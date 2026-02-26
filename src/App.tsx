import { useEffect, useState } from "react";
import AdminUpload from "./components/AdminUpload";

type Event = {
  id: string;
  torneo: string;
  fecha: string;
  encuentro: string;
  lugar?: string | null;
};

export default function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => setEvents(data.events ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>ENFOCO</h1>

      {/* ADMIN */}
      <div style={{ marginTop: 16 }}>
        <AdminUpload />
      </div>

      {/* EVENTOS */}
      <p style={{ marginTop: 18, opacity: 0.75 }}>Eventos</p>

      {loading ? (
        <p style={{ marginTop: 18 }}>Cargando…</p>
      ) : events.length === 0 ? (
        <p style={{ marginTop: 18 }}>Todavía no hay eventos.</p>
      ) : (
        <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
          {events.map((e) => (
            <div key={e.id} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
              <div style={{ fontWeight: 700 }}>{e.torneo}</div>
              <div style={{ opacity: 0.8 }}>
                {e.fecha} — {e.encuentro}
              </div>
              {e.lugar ? <div style={{ opacity: 0.65 }}>{e.lugar}</div> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}