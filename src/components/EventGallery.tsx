import { useEffect, useState } from "react";
import { addToCart } from "../lib/cart";

type EventRow = {
  id: string;
  torneo: string;
  fecha: string;
  encuentro: string;
};

type PhotoRow = {
  id: string;
  event_id: string;
  dorsal: number | null;
  preview_key: string; // "preview/ev.../ph....jpg"
  price_ars: number;
};

export default function EventGallery() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [eventId, setEventId] = useState("");
  const [dorsal, setDorsal] = useState("");
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => setEvents(data.events ?? []))
      .finally(() => setLoadingEvents(false));
  }, []);

  async function loadPhotos() {
    if (!eventId) return setPhotos([]);
    setLoadingPhotos(true);

    const params = new URLSearchParams({ event_id: eventId });
    if (dorsal.trim() !== "") params.set("dorsal", dorsal.trim());

    try {
      const res = await fetch("/api/photos?" + params.toString());
      const data = await res.json();
      setPhotos(data.photos ?? []);
    } finally {
      setLoadingPhotos(false);
    }
  }

  useEffect(() => {
    loadPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  return (
    <div style={{ marginTop: 18, border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700 }}>Galería</h2>

      {loadingEvents ? (
        <p>Cargando eventos…</p>
      ) : (
        <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
          <select
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            style={{ padding: 10, border: "1px solid #ccc", borderRadius: 10 }}
          >
            <option value="">Elegí un evento…</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.fecha} · {e.torneo} · {e.encuentro}
              </option>
            ))}
          </select>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              value={dorsal}
              onChange={(e) => setDorsal(e.target.value)}
              placeholder="Filtrar por dorsal (opcional)"
              style={{ padding: 10, border: "1px solid #ccc", borderRadius: 10, width: 220 }}
            />
            <button
              onClick={loadPhotos}
              disabled={!eventId || loadingPhotos}
              style={{ padding: "10px 12px", borderRadius: 10, fontWeight: 700, opacity: loadingPhotos ? 0.6 : 1 }}
            >
              {loadingPhotos ? "Buscando…" : "Buscar"}
            </button>
          </div>

          {!eventId ? (
            <p style={{ opacity: 0.7 }}>Seleccioná un evento para ver fotos.</p>
          ) : loadingPhotos ? (
            <p>Cargando fotos…</p>
          ) : photos.length === 0 ? (
            <p style={{ opacity: 0.7 }}>No hay fotos para ese filtro.</p>
          ) : (
            <div
              style={{
                marginTop: 6,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: 12
              }}
            >
              {photos.map((p) => {
                const imgUrl = "/api/" + p.preview_key; // => /api/preview/...
                return (
                  <div key={p.id} style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
                    <img src={imgUrl} style={{ width: "100%", display: "block" }} />
                    <div style={{ padding: 10 }}>
                      <div style={{ fontWeight: 700 }}>${p.price_ars.toLocaleString("es-AR")}</div>
                      <div style={{ opacity: 0.75 }}>Dorsal: {p.dorsal ?? "—"}</div>

                      <button
                        onClick={() => {
                          addToCart({
                            photoId: p.id,
                            price: p.price_ars,
                            previewKey: p.preview_key,
                            dorsal: p.dorsal
                          });
                          alert("Agregada al carrito ✅");
                        }}
                        style={{
                          marginTop: 8,
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: 10,
                          fontWeight: 700
                        }}
                      >
                        Agregar al carrito
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}