"use client";

import { useEffect, useState } from "react";

type Linea = { de: "paciente" | "ia"; texto: string; hora: string };

export default function Simulada({
  nombre,
  servicio,
  profesional,
}: {
  nombre: string;
  servicio: string;
  profesional: string;
}) {
  const guion: Linea[] = [
    { de: "paciente", texto: `Hola, quisiera agendar ${servicio.toLowerCase()}. ¿Tienen esta semana?`, hora: "23:42" },
    {
      de: "ia",
      texto: `¡Hola! Con gusto. Tenemos el jueves a las 10:00 o el viernes a las 16:30 con ${profesional}. ¿Cuál le queda mejor?`,
      hora: "23:42",
    },
    { de: "paciente", texto: "El viernes porfa", hora: "23:43" },
    { de: "ia", texto: "¿Me ayuda con su nombre completo para registrar la cita?", hora: "23:43" },
    { de: "paciente", texto: "María Torres", hora: "23:43" },
    {
      de: "ia",
      texto: `Listo, María. Su cita en ${nombre} quedó el viernes a las 16:30 con ${profesional}. Le enviaré un recordatorio un día antes.`,
      hora: "23:43",
    },
  ];

  const [visibles, setVisibles] = useState(0);
  const [escribiendo, setEscribiendo] = useState(false);
  const [vuelta, setVuelta] = useState(0);

  useEffect(() => {
    if (visibles >= guion.length) return;
    const siguiente = guion[visibles];
    // the receptionist "types" before each reply; the patient's messages appear sooner
    const pausa = siguiente.de === "ia" ? 1400 : 900;
    if (siguiente.de === "ia") setEscribiendo(true);
    const t = setTimeout(() => {
      setEscribiendo(false);
      setVisibles((v) => v + 1);
    }, pausa);
    return () => clearTimeout(t);
    // guion is rebuilt each render from stable props; visibles and vuelta drive the animation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibles, vuelta]);

  return (
    <div className="chat">
      <div className="chat-header">
        <span className="dot" aria-hidden="true" />
        <div>
          <strong>{nombre}</strong>
          <small>Recepcionista IA · responde 24/7</small>
        </div>
        <span className="badge simulacion">Simulación</span>
      </div>
      <div className="chat-body">
        {guion.slice(0, visibles).map((l, i) => (
          <div key={`${vuelta}-${i}`} className={`burbuja ${l.de === "paciente" ? "yo" : "ella"} aparece`}>
            {l.texto}
            <span className="hora">{l.hora}</span>
          </div>
        ))}
        {escribiendo && <div className="burbuja ella escribiendo">escribiendo…</div>}
      </div>
      <div className="chat-pie">
        <span>La clínica estaba cerrada. La cita quedó agendada igual.</span>
        {visibles >= guion.length && (
          <button
            type="button"
            onClick={() => {
              setVisibles(0);
              setVuelta((v) => v + 1);
            }}
          >
            Ver de nuevo
          </button>
        )}
      </div>
    </div>
  );
}
