// LocalStorage Mock Cart Database Service
// Easily replaceable with real API/Backend database calls in the future.

const STORAGE_KEY = "gearverse_shopping_cart";
const PROMO_KEY = "gearverse_applied_promo";

const INITIAL_CART_ITEMS = [
  {
    id: "1",
    name: "GearVerse Pro Headset",
    tag: "RGB • 7.1 Surround • Pink",
    unitPrice: 89.99,
    quantity: 1,
    delivery: "Est. Delivery: 2-3 Business Days",
    image: "/images/headset.jpg",
  },
  {
    id: "2",
    name: "GearVerse Mechanical Keyboard",
    tag: "Cherry MX Red • TKL Layout • Matte Black",
    unitPrice: 149.99,
    quantity: 1,
    delivery: "Est. Delivery: 2-3 Business Days",
    image: "/images/keyboard.jpg",
  },
  {
    id: "3",
    name: "GearVerse Gaming Mouse",
    tag: "Wireless • 25K DPI • Black",
    unitPrice: 69.99,
    quantity: 2,
    delivery: "Est. Delivery: 2-3 Business Days",
    image: "/images/mouse.jpg",
  },
];

const PROMO_CODES = {
  GEAR30: { discount: 30.0, description: "Code 'GEAR30' saved you $30.00!" },
  GAME10: { discount: 10.0, description: "Code 'GAME10' saved you $10.00!" },
};

export const DEFAULT_SHIPPING = 5.99;

export function getInitialCart() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback if parse fails
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CART_ITEMS));
  return INITIAL_CART_ITEMS;
}

export function saveCart(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getSavedPromo() {
  return localStorage.getItem(PROMO_KEY) || "GEAR30"; // Default applied matching mockup
}

export function savePromo(code) {
  if (code) {
    localStorage.setItem(PROMO_KEY, code);
  } else {
    localStorage.removeItem(PROMO_KEY);
  }
}

export function resetToDefaultCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CART_ITEMS));
  localStorage.setItem(PROMO_KEY, "GEAR30");
  return { items: INITIAL_CART_ITEMS, promoCode: "GEAR30" };
}

export function validatePromoCode(code) {
  const normalized = (code || "").trim().toUpperCase();
  if (PROMO_CODES[normalized]) {
    return { valid: true, code: normalized, ...PROMO_CODES[normalized] };
  }
  return { valid: false, error: "Invalid promo code" };
}
