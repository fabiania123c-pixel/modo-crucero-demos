import { NextResponse } from "next/server";
import { contextoClinica, obtenerDemo } from "@/lib/demos";

type Mensaje = { role: "user" | "assistant"; content: string };

const MAX_MENSAJES = 12;
const MAX_CARACTERES = 500;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "La recepcionista no está configurada todavía." },
      { status: 503 }
    );
  }

  let body: { slug?: string; messages?: Mensaje[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const demo = body.slug ? await obtenerDemo(body.slug) : null;
  if (!demo) {
    return NextResponse.json({ error: "Demo no encontrado." }, { status: 404 });
  }

  const mensajes = (body.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_MENSAJES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CARACTERES) }));

  if (mensajes.length === 0 || mensajes[mensajes.length - 1].role !== "user") {
    return NextResponse.json({ error: "Falta el mensaje." }, { status: 400 });
  }

  const system = `Eres la recepcionista virtual de demostración de ${demo.nombre}. Esta es una demo preparada por Modo Crucero para mostrarle a la clínica cómo atendería una IA a sus pacientes.

Información pública de la clínica:
${contextoClinica(demo)}

Cómo respondes:
- En español de Ecuador, cálida, profesional y breve: máximo 3 frases.
- Usa solo la información de arriba. Si algo no está ahí (precios, seguros, un servicio no listado), di que el equipo de la clínica lo confirma.
- Para agendar: pide el nombre y el servicio, propone 2 horarios concretos dentro del horario de atención y confirma el que elija. Aclara una sola vez, al confirmar, que es una demostración y la cita no queda registrada.
- No des diagnósticos ni consejos médicos; ante una urgencia, recomienda llamar a la clínica o acudir a emergencias.
- Nunca digas que eres de Anthropic ni hables de cómo funcionas por dentro.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-haiku-5-5",
      max_tokens: 300,
      system,
      messages: mensajes,
    }),
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "La recepcionista no pudo responder. Intenta de nuevo." },
      { status: 502 }
    );
  }

  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  const texto = (data.content ?? [])
    .filter((c) => c.type === "text")
    .map((c) => c.text ?? "")
    .join("")
    .trim();

  return NextResponse.json({ reply: texto || "Disculpe, ¿me lo puede repetir?" });
}
