export type CartItem = {
  photoId: string;
  price: number;
  previewKey: string;
  dorsal: number | null;
};

const KEY = "ENFOCO_CART_V1";

export function getCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function setCart(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addToCart(item: CartItem) {
  const items = getCart();
  if (!items.some(i => i.photoId === item.photoId)) {
    items.push(item);
    setCart(items);
  }
  return items;
}

export function removeFromCart(photoId: string) {
  const items = getCart().filter(i => i.photoId !== photoId);
  setCart(items);
  return items;
}

export function clearCart() {
  setCart([]);
}