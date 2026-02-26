import { useEffect, useMemo, useState } from "react";
import EventGallery from "./components/EventGallery";
import CartPanel from "./components/CartPanel";
import AdminUpload from "./components/AdminUpload";
import { getCart } from "./lib/cart";

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

  // Admin gate
  const [adminEnabled, setAdminEnabled] = useState(
    localStorage.getItem("ENFOCO_ADMIN_ENABLED") === "1"
  );
  const [adminKey, setAdminKey] = useState(localStorage.getItem("ENFOCO_ADMIN_KEY") || "");
  const [adminMsg, setAdminMsg] = useState<string | null>(null);
  const [adminBusy, setAdminBusy] = useState(false);

  // Cart count (updates when cart changes)
  const [cartCount, setCartCount] = useState(() => {
    try { return getCart().length; } catch { return 0; }
  });

  useEffect(() => {
    const onHash = () => setRoute(getRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    const refresh = () => {
      try { setCartCount(getCart().length); } catch { setCartCount(0); }
    };
    refresh();
    window.addEventListener("enfoco-cart", refresh as any);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("enfoco-cart", refresh as any);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const content = useMemo(() => {
    if (route === "galeria") return <EventGallery />;
    if (route === "carrito") return <CartPanel />;

    if (route === "admin") {
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
                    window.location.hash = "#/admin";
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

    // HOME landing
    return (
      <div style={{ marginTop: 18, display: "grid", gap: 14 }}>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, letterSpacing: ".04em" }}>Encontrá tus fotos</h2>
              <div className="subtle" style={{ marginTop: 8, maxWidth: 640 }}>
                Seleccioná el evento, filtrá por dorsal y comprá solo las fotos que querés.
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <a className="btn btnPrimary" href="#/galeria">Ir a Galería</a>
              <a className="btn" href="#/carrito">Ver Carrito</a>
            </div>
          </div>

          <div className="hr" />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            <div className="card" style={{ padding: 14, boxShadow: "none" }}>
              <div style={{ fontWeight: 800 }}>1) Elegí evento</div>
              <div className="subtle" style={{ marginTop: 6 }}>
                Torneo · fecha · encuentro
              </div>
            </div>
            <div className="card" style={{ padding: 14, boxShadow: "none" }}>
              <div style={{ fontWeight: 800 }}>2) Filtrá por dorsal</div>
              <div className="subtle" style={{ marginTop: 6 }}>
                Más rápido para encontrarte
              </div>
            </div>
            <div className="card" style={{ padding: 14, boxShadow: "none" }}>
              <div style={{ fontWeight: 800 }}>3) Comprá y descargá</div>
              <div className="subtle" style={{ marginTop: 6 }}>
                Descarga HD después del pago
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 800 }}>Tip</div>
          <div className="subtle" style={{ marginTop: 6 }}>
            Si no encontrás tu foto con dorsal, probá sin filtro y ordená por fecha.
          </div>
        </div>
      </div>
    );
  }, [route, adminEnabled, adminKey, adminBusy, adminMsg]);

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
            <a className="btn" href="#/carrito">
              Carrito{cartCount > 0 ? ` (${cartCount})` : ""}
            </a>

            {/* Admin solo si está habilitado */}
            {adminEnabled ? <a className="btn btnPrimary" href="#/admin">Admin</a> : null}
          </div>
        </div>
      </div>

      <div className="container">{content}</div>
    </>
  );
}