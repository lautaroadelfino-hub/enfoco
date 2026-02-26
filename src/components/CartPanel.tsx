import { useEffect, useMemo, useState } from "react";
import { CartItem, clearCart, getCart, removeFromCart } from "../lib/cart";

export default function CartPanel() {
  const [items, setItems] = useState<CartItem[]>([]);

  const refresh = () => setItems(getCart());

  useEffect(() => {
    refresh();

    // 1) cambios desde otras pestañas
    const onStorage = (e: StorageEvent) => {
      if (e.key === "ENFOCO_CART_V1") refresh();
    };

    // 2) cambios en la misma pestaña (evento custom)
    const onCustom = () => refresh();

    window.addEventListener("storage", onStorage);
    window.addEventListener("enfoco-cart", onCustom as any);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("enfoco-cart", onCustom as any);
    };
  }, []);

  const total = useMemo(() => items.reduce((acc, i) => acc + i.price, 0), [items]);

  return (
    <div style={{ marginTop: 18, border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700 }}>Carrito</h2>

      {items.length === 0 ? (
        <p style={{ opacity: 0.7 }}>Tu carrito está vacío.</p>
      ) : (
        <>
          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            {items.map((i) => (
              <div
                key={i.photoId}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  border: "1px solid #eee",
                  borderRadius: 12,
                  padding: 10
                }}
              >
                <img
                  src={"/api/" + i.previewKey}
                  style={{ width: 90, height: 60, objectFit: "cover", borderRadius: 10 }}
                />

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>${i.price.toLocaleString("es-AR")}</div>
                  <div style={{ opacity: 0.75 }}>Dorsal: {i.dorsal ?? "—"}</div>
                </div>

                <button
                  onClick={() => {
                    setItems(removeFromCart(i.photoId));
                    window.dispatchEvent(new Event("enfoco-cart"));
                  }}
                  style={{ padding: "10px 12px", borderRadius: 10 }}
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>Total: ${total.toLocaleString("es-AR")}</div>
            <button
              onClick={() => {
                clearCart();
                setItems([]);
                window.dispatchEvent(new Event("enfoco-cart"));
              }}
              style={{ padding: "10px 12px", borderRadius: 10 }}
            >
              Vaciar
            </button>
          </div>

          <div style={{ marginTop: 12, opacity: 0.8 }}>
            Próximo paso: botón <b>Pagar con Mercado Pago</b>.
          </div>
        </>
      )}
    </div>
  );
}