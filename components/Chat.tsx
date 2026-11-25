"use client";

import { useEffect, useRef, useState } from "react";

type Mensaje = { role: "user" | "assistant"; content: string };

export default function Chat({
  slug,
  nombre,
  servicios,
}: {
  slug: string;
  nombre: string;
  servicios: string[];
}) {
  const SUGERENCIAS = [
    `Quiero agendar ${servicios[0] ? servicios[0].toLowerCase() : "una cita"}`,
    "¿Qué horarios tienen?",
    servicios[1] ? `¿Hacen ${servicios[1].toLowerCase()}?` : "¿Dónde están ubicados?",
  ];
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      role: "assistant",
      content: `Hola, gracias por escribir a ${nombre}. ¿En qué le puedo ayudar hoy?`,
    },
  ]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const fin = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fin.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [mensajes, cargando]);

  async function enviar(contenido: string) {
    const limpio = contenido.trim();
    if (!limpio) {
      setError("Escribe un mensaje primero.");
      return;
    }
    if (cargando) return;
    setError("");
    const nuevos: Mensaje[] = [...mensajes, { role: "user", content: limpio }];
    setMensajes(nuevos);
    setTexto("");
    setCargando(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        // the greeting is UI-only; the API expects the conversation to start with the user
        body: JSON.stringify({ slug, messages: nuevos.slice(1) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setMensajes([...nuevos, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo enviar. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="chat">
      <div className="chat-header">
        <span className="dot" aria-hidden="true" />
        <div>
          <strong>{nombre}</strong>
          <small>Recepcionista IA · en línea</small>
        </div>
      </div>
      <div className="chat-body">
        {mensajes.map((m, i) => (
          <div key={i} className={`burbuja ${m.role === "user" ? "yo" : "ella"}`}>
            {m.content}
          </div>
        ))}
        {cargando && <div className="burbuja ella escribiendo">escribiendo…</div>}
        <div ref={fin} />
      </div>
      {mensajes.length === 1 && (
        <div className="sugerencias">
          {SUGERENCIAS.map((s) => (
            <button key={s} type="button" onClick={() => enviar(s)}>
              {s}
            </button>
          ))}
        </div>
      )}
      <form
        className="chat-input"
        onSubmit={(e) => {
          e.preventDefault();
          enviar(texto);
        }}
      >
        <input
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            if (error) setError("");
          }}
          placeholder="Escriba como si fuera un paciente…"
          maxLength={500}
          aria-label="Mensaje"
        />
        <button type="submit" disabled={cargando}>
          Enviar
        </button>
      </form>
      {error && <p className="chat-error">{error}</p>}
    </div>
  );
}
