export type CartItem = {
  photoId: string;
  price: number;
  previewKey: string;
  dorsal: number | null;
};

const KEY = "ENFOCO_CART_V1";

function notify() {
  // Actualiza componentes en la misma pestaña
  window.dispatchEvent(new Event("enfoco-cart"));
}

export function getCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function setCart(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  notify();
}

export function addToCart(item: CartItem) {
  const items = getCart();
  if (!items.some((i) => i.photoId === item.photoId)) {
    items.push(item);
    localStorage.setItem(KEY, JSON.stringify(items));
    notify();
  }
  return items;
}

export function removeFromCart(photoId: string) {
  const items = getCart().filter((i) => i.photoId !== photoId);
  localStorage.setItem(KEY, JSON.stringify(items));
  notify();
  return items;
}

export function clearCart() {
  localStorage.setItem(KEY, JSON.stringify([]));
  notify();
}