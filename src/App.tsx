import { useEffect, useMemo, useState } from "react";
import EventGallery from "./components/EventGallery";
import CartPanel from "./components/CartPanel";
import AdminUpload from "./components/AdminUpload";
import { getCart } from "./lib/cart";

function getRoute() {
  const h = (window.location.hash || "#/").replace("#", "");
  if (h === "/galeria") return "galeria";
  if (h === "/carrito") return "carrito";
  if (h === "/admin") return "admin";
  return "home";
}

export default function App() {
  const [route, setRoute] = useState(getRoute());

  const [adminEnabled, setAdminEnabled] = useState(
    localStorage.getItem("ENFOCO_ADMIN_ENABLED") === "1"
  );
  const [adminKey, setAdminKey] = useState(localStorage.getItem("ENFOCO_ADMIN_KEY") || "");
  const [adminMsg, setAdminMsg] = useState<string | null>(null);
  const [adminBusy, setAdminBusy] = useState(false);

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

  const page = useMemo(() => {
    if (route === "galeria") return { title: "Galería", subtitle: "Elegí evento, filtrá por dorsal y agregá al carrito", body: <EventGallery /> };
    if (route === "carrito") return { title: "Carrito", subtitle: "Revisá tus fotos seleccionadas", body: <CartPanel /> };

    if (route === "admin") {
      if (!adminEnabled) {
        return {
          title: "Admin",
          subtitle: "Ingresá tu key para habilitar el panel en este navegador",
          body: (
            <div style={{ display: "grid", gap: 10 }}>
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
                  {adminBusy ? "Validando…" : "Habilitar"}
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

              {adminMsg ? <div className="subtle">{adminMsg}</div> : null}
            </div>
          )
        };
      }

      return { title: "Admin", subtitle: "Subí fotos y asigná dorsal", body: <AdminUpload /> };
    }

    // HOME (landing)
    return {
      title: "ENFOCO",
      subtitle: "Encontrá tus fotos en segundos",
      body: (
        <div className="card" style={{ padding: 16, boxShadow: "none" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a className="btn btnPrimary" href="#/galeria">Ir a Galería</a>
            <a className="btn" href="#/carrito">Ver Carrito</a>
          </div>

          <div className="hr" />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            <div className="card" style={{ padding: 14, boxShadow: "none" }}>
              <div style={{ fontWeight: 800 }}>1) Elegí evento</div>
              <div className="subtle" style={{ marginTop: 6 }}>Torneo · fecha · encuentro</div>
            </div>
            <div className="card" style={{ padding: 14, boxShadow: "none" }}>
              <div style={{ fontWeight: 800 }}>2) Filtrá por dorsal</div>
              <div className="subtle" style={{ marginTop: 6 }}>Encontrate más rápido</div>
            </div>
            <div className="card" style={{ padding: 14, boxShadow: "none" }}>
              <div style={{ fontWeight: 800 }}>3) Comprá y descargá</div>
              <div className="subtle" style={{ marginTop: 6 }}>HD después del pago</div>
            </div>
          </div>

          <div className="hr" />
          <div className="subtle">Carrito actual: <b>{cartCount}</b> foto(s)</div>
        </div>
      )
    };
  }, [route, adminEnabled, adminKey, adminBusy, adminMsg, cartCount]);

  const NavItem = ({ href, label, active }: { href: string; label: string; active: boolean }) => (
    <a className={"navLink " + (active ? "navLinkActive" : "")} href={href}>
      <span>{label}</span>
    </a>
  );

  return (
    <>
      <div className="topbar">
        <div className="topbarInner">
          <div className="brand">
            <h1>ENFOCO</h1>
            <span className="badge">Fotos de eventos</span>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="layout">
          <aside className="card sidebar">
            <div className="sideTitle">Menú</div>
            <div className="sideNav">
              <NavItem href="#/" label="Inicio" active={route === "home"} />
              <NavItem href="#/galeria" label="Galería" active={route === "galeria"} />
              <NavItem href="#/carrito" label={`Carrito${cartCount ? ` (${cartCount})` : ""}`} active={route === "carrito"} />
              {adminEnabled ? <NavItem href="#/admin" label="Admin" active={route === "admin"} /> : null}
            </div>

            <div className="hr" />
            <div className="subtle" style={{ fontSize: 12 }}>
              Tip: si no sabés dorsal, buscá sin filtro.
            </div>
          </aside>

          <main className="card mainCard">
            <div className="pageHead">
              <h2>{page.title}</h2>
              <div className="subtle">{page.subtitle}</div>
            </div>
            <div className="hr" />
            {page.body}
          </main>
        </div>
      </div>
    </>
  );
}