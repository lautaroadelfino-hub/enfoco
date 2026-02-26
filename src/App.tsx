import { useEffect, useMemo, useState } from "react";
import EventGallery from "./components/EventGallery";
import CartPanel from "./components/CartPanel";
import AdminUpload from "./components/AdminUpload";

type Event = {
  id: string;
  torneo: string;
  fecha: string;
  encuentro: string;
  lugar?: string | null;
};

function getRoute() {
  const h = (window.location.hash || "#/").replace("#", "");
  if (h === "/") return "home";
  if (h === "/galeria") return "galeria";
  if (h === "/carrito") return "carrito";
  if (h === "/admin") return "admin";
  return "home";
}

export default function App() {
  const [route, setRoute] = useState(getRoute());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Admin “habilitado” en este navegador
  const [adminEnabled, setAdminEnabled] = useState(
    localStorage.getItem("ENFOCO_ADMIN_ENABLED") === "1"
  );
  const [adminKey, setAdminKey] = useState(localStorage.getItem("ENFOCO_ADMIN_KEY") || "");
  const [adminMsg, setAdminMsg] = useState<string | null>(null);
  const [adminBusy, setAdminBusy] = useState(false);

  useEffect(() => {
    const onHash = () => setRoute(getRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => setEvents(data.events ?? []))
      .finally(() => setLoading(false));
  }, []);

  const content = useMemo(() => {
    if (route === "galeria") return <EventGallery />;
    if (route === "carrito") return <CartPanel />;

    if (route === "admin") {
      // Gate: solo muestra AdminUpload si validaste la key
      if (!adminEnabled) {
        return (
          <div className="card" style={{ padding: 16, marginTop: 18 }}>
            <h2 className="sectionTitle">Admin</h2>
            <div className="subtle" style={{ marginBottom: 10 }}>
              Ingresá tu Admin Key para habilitar el panel en este navegador.
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="ADMIN KEY"
                className="btn"
                style={{ width: 260, cursor: "text" }}
              />
              <button
                className="btn btnPrimary"
                disabled={adminBusy}
                onClick={async () => {
                  setAdminBusy(true);
                  setAdminMsg(null);
                  try {
                    const res = await fetch("/api/admin/auth", {
                      headers: { "x-admin-key": adminKey }
                    });
                    if (!res.ok) throw new Error("Key incorrecta");
                    localStorage.setItem("ENFOCO_ADMIN_KEY", adminKey);
                    localStorage.setItem("ENFOCO_ADMIN_ENABLED", "1");
                    setAdminEnabled(true);
                    setAdminMsg("✅ Admin habilitado");
                  } catch (e: any) {
                    setAdminMsg("❌ " + (e?.message ?? "Error"));
                  } finally {
                    setAdminBusy(false);
                  }
                }}
              >
                {adminBusy ? "Validando…" : "Habilitar Admin"}
              </button>

              <button
                className="btn"
                onClick={() => {
                  localStorage.removeItem("ENFOCO_ADMIN_ENABLED");
                  setAdminEnabled(false);
                  setAdminMsg("Admin deshabilitado");
                }}
              >
                Deshabilitar
              </button>
            </div>

            {adminMsg ? <div style={{ marginTop: 12 }} className="subtle">{adminMsg}</div> : null}
          </div>
        );
      }

      return (
        <div style={{ marginTop: 18 }}>
          <AdminUpload />
        </div>
      );
    }

    // Home
    return (
      <div className="card" style={{ padding: 16, marginTop: 18 }}>
        <h2 className="sectionTitle">Eventos</h2>

        {loading ? (
          <p className="subtle">Cargando…</p>
        ) : events.length === 0 ? (
          <p className="subtle">Todavía no hay eventos.</p>
        ) : (
          <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
            {events.map((e) => (
              <div key={e.id} className="card" style={{ padding: 14, boxShadow: "none" }}>
                <div style={{ fontWeight: 800 }}>{e.torneo}</div>
                <div className="subtle">{e.fecha} — {e.encuentro}</div>
                {e.lugar ? <div className="subtle">{e.lugar}</div> : null}
              </div>
            ))}
          </div>
        )}

        <div className="hr" />
        <div className="subtle">
          Tip: entrá a <b>Galería</b> para filtrar por dorsal y agregar al carrito.
        </div>
      </div>
    );
  }, [route, adminEnabled, adminKey, adminBusy, adminMsg, events, loading]);

  return (
    <>
      <div className="topbar">
        <div className="topbarInner">
          <div className="brand">
            <h1>ENFOCO</h1>
            <span className="badge">Fotos de eventos</span>
          </div>

          <div className="nav">
            <a className="btn" href="#/">Inicio</a>
            <a className="btn" href="#/galeria">Galería</a>
            <a className="btn" href="#/carrito">Carrito</a>

            {/* Admin NO visible para todos */}
            {adminEnabled ? <a className="btn btnPrimary" href="#/admin">Admin</a> : null}
          </div>
        </div>
      </div>

      <div className="container">{content}</div>
    </>
  );
}