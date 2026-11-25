import { notFound } from "next/navigation";
import Chat from "@/components/Chat";
import Simulada from "@/components/Simulada";
import { obtenerDemo } from "@/lib/demos";

export const revalidate = 300;

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || "";
// With an API key the demo shows the live receptionist; without one, a scripted conversation.
const CHAT_EN_VIVO = Boolean(process.env.ANTHROPIC_API_KEY);

function fmt(n: number) {
  return new Intl.NumberFormat("es-EC", { maximumFractionDigits: 0 }).format(n);
}

export default async function DemoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = await obtenerDemo(slug);
  if (!d) notFound();

  const promedio = Math.round((d.estimado.min + d.estimado.max) / 2);
  const recuperable = promedio * d.ticketPromedio;
  const mejorCompetidor = [...d.competencia].sort((a, b) => b.calificacion - a.calificacion)[0];
  const servicio = d.servicios[0] ?? "una cita";
  const profesional = d.profesionales[0]?.nombre ?? "el especialista";
  const linkWhatsapp = WHATSAPP
    ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
        `Hola Fabián, vi el demo para ${d.nombre}. Me interesa conversar.`
      )}`
    : "";

  return (
    <main className="contenedor">
      <header className="cabecera">
        <div>
          <p className="marca">Propuesta preparada por Modo Crucero</p>
          <h1>{d.nombre}</h1>
          <p className="sub">
            {d.especialidad} · {d.zona}
          </p>
        </div>
        <span className="badge">Demo</span>
      </header>

      <section>
        <h2>1. Lo que encontramos</h2>
        <p className="nota">Con información pública de su clínica en Google y redes sociales.</p>
        <div className="metricas">
          <div className="metrica">
            <span>Reviews que mencionan demoras para responder o agendar</span>
            <strong>
              {d.quejas.cantidad}
              {d.numReviews ? ` de ${fmt(d.numReviews)}` : ""}
            </strong>
          </div>
          {d.calificacion !== undefined && mejorCompetidor && (
            <div className="metrica">
              <span>Su calificación frente a la mejor de su zona</span>
              <strong>
                {d.calificacion} <small>vs {mejorCompetidor.calificacion}</small>
              </strong>
            </div>
          )}
          <div className="metrica">
            <span>Pacientes que podrían estar perdiéndose al mes (estimado)</span>
            <strong>
              {d.estimado.min}–{d.estimado.max}
            </strong>
          </div>
        </div>
        {d.quejas.ejemplos.length > 0 && (
          <ul className="citas">
            {d.quejas.ejemplos.map((q, i) => (
              <li key={i}>
                “{q.texto}”{" "}
                {q.link && q.link !== "#" && (
                  <a href={q.link} target="_blank" rel="noreferrer">
                    ver review
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className="nota">{d.estimado.supuestos}</p>
      </section>

      {CHAT_EN_VIVO ? (
        <section>
          <h2>2. Pruebe su recepcionista IA</h2>
          <p className="nota">
            Ya conoce sus servicios, horarios y profesionales. Escríbale como si fuera un paciente y
            pídale una cita.
          </p>
          <Chat slug={d.slug} nombre={d.nombre} servicios={d.servicios} />
        </section>
      ) : (
        <section>
          <h2>2. Así atendería su recepcionista IA</h2>
          <p className="nota">
            Un paciente escribe a las 11:42 de la noche. La recepcionista ya conoce sus servicios,
            horarios y profesionales, y agenda la cita sin que nadie de su equipo intervenga.
          </p>
          <Simulada nombre={d.nombre} servicio={servicio} profesional={profesional} />
        </section>
      )}

      <section>
        <h2>3. Pacientes que vuelven solos</h2>
        <p className="nota">
          Cada semana el sistema detecta pacientes que no han vuelto y les escribe por WhatsApp.
        </p>
        <div className="whatsapp">
          <div className="burbuja ella">
            Hola María, han pasado 7 meses desde su última visita a {d.nombre}. ¿Le agendo{" "}
            {servicio.toLowerCase()} esta semana? Tenemos jueves 10:00 o viernes 16:30.
          </div>
          <div className="burbuja yo">El viernes por favor</div>
          <div className="burbuja ella">
            Listo, viernes 16:30 con {profesional}. Le recuerdo un día antes.
          </div>
        </div>
      </section>

      <section>
        <h2>4. Lo que vería cada mes</h2>
        <div className="panel">
          <span>Recuperado este mes (ejemplo)</span>
          <strong className="grande">${fmt(recuperable)}</strong>
          <p className="nota">
            Ejemplo calculado con {promedio} pacientes recuperados al mes y un ticket promedio de $
            {fmt(d.ticketPromedio)}. Con sus datos reales, este número se mide cada mes.
          </p>
          <div className="filas">
            <div>
              <span>Pacientes reactivados</span>
              <span>{promedio}</span>
            </div>
            <div>
              <span>Citas agendadas fuera de horario</span>
              <span>Medido cada mes</span>
            </div>
            <div>
              <span>Inasistencias evitadas por confirmación</span>
              <span>Medido cada mes</span>
            </div>
          </div>
        </div>
      </section>

      <section className="cierre">
        <h2>Pruébelo 30 días sin riesgo</h2>
        <p>Sin costo de instalación. Solo paga por los pacientes que vuelvan a agendar.</p>
        {linkWhatsapp && (
          <a className="boton" href={linkWhatsapp} target="_blank" rel="noreferrer">
            Hablar con Fabián por WhatsApp
          </a>
        )}
      </section>

      <footer className="pie">
        Demo preparado por Modo Crucero con información pública. No es la página oficial de{" "}
        {d.nombre}.
      </footer>
    </main>
  );
}
