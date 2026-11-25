import fs from "node:fs";
import path from "node:path";
import ejemplo from "@/data/demos.json";

export type Demo = {
  slug: string;
  nombre: string;
  especialidad: string;
  zona: string;
  direccion?: string;
  profesionales: { nombre: string; rol: string }[];
  servicios: string[];
  horarios: string;
  calificacion?: number;
  numReviews?: number;
  quejas: { cantidad: number; ejemplos: { texto: string; link: string }[] };
  competencia: { nombre: string; calificacion: number }[];
  estimado: { min: number; max: number; supuestos: string };
  ticketPromedio: number;
  fecha?: string;
};

// Demos older than this stop loading, so old links can't keep spending API credit.
const DIAS_VIGENCIA = 60;
const SLUG_VALIDO = /^[a-z0-9-]{3,80}$/;
const CARPETA = path.join(process.cwd(), "data", "demos");

function vigente(d: Demo): boolean {
  if (!d.fecha) return true;
  const creado = Date.parse(d.fecha);
  if (Number.isNaN(creado)) return true;
  return Date.now() - creado < DIAS_VIGENCIA * 864e5;
}

// The nightly task commits one file per clinic: data/demos/<slug>.json
function demoDesdeArchivo(slug: string): Demo | null {
  if (!SLUG_VALIDO.test(slug)) return null;
  try {
    const d = JSON.parse(fs.readFileSync(path.join(CARPETA, `${slug}.json`), "utf8")) as Demo;
    if (!d.nombre || !Array.isArray(d.servicios)) return null;
    return { ...d, slug };
  } catch {
    return null;
  }
}

// Nightly demos are JSON files in Fabián's Drive, shared as "anyone with the link".
// The URL path is the Drive file id, so the link can't be guessed.
const ID_DRIVE = /^[A-Za-z0-9_-]{25,60}$/;

async function demoDesdeDrive(id: string): Promise<Demo | null> {
  if (!ID_DRIVE.test(id)) return null;
  try {
    const res = await fetch(`https://drive.google.com/uc?export=download&id=${id}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const d = JSON.parse(await res.text()) as Demo;
    if (!d.nombre || !Array.isArray(d.servicios)) return null;
    return { ...d, slug: id };
  } catch {
    return null;
  }
}

export async function obtenerDemo(slug: string): Promise<Demo | null> {
  const local = (ejemplo as Demo[]).find((d) => d.slug === slug);
  if (local) return local;
  const encontrado = demoDesdeArchivo(slug) ?? (await demoDesdeDrive(slug));
  return encontrado && vigente(encontrado) ? encontrado : null;
}

export function contextoClinica(d: Demo): string {
  const profesionales = d.profesionales.map((p) => `${p.nombre} (${p.rol})`).join(", ");
  return [
    `Clínica: ${d.nombre}`,
    `Especialidad: ${d.especialidad}`,
    `Zona: ${d.zona}${d.direccion ? `, dirección: ${d.direccion}` : ""}`,
    `Profesionales: ${profesionales || "no publicado"}`,
    `Servicios: ${d.servicios.join(", ") || "no publicado"}`,
    `Horarios: ${d.horarios || "no publicado"}`,
  ].join("\n");
}
