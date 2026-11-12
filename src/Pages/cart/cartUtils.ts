export const DELIVERY_FEE = 500; // demo value, move to the backend later

// Demo promo codes. Real validation must happen on the server.
const PROMOS: Record<string, { type: "percent" | "flat"; value: number }> = {
  FIMBA10: { type: "percent", value: 10 },
  WELCOME500: { type: "flat", value: 500 },
};

export function findPromo(code: string) {
  return PROMOS[code.trim().toUpperCase()] ?? null;
}

export interface Totals {
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  itemCount: number;
}

export function calcTotals(
  items: { price: number; quantity: number }[],
  promoCode: string | null,
): Totals {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const promo = promoCode ? findPromo(promoCode) : null;

  let discount = 0;
  if (promo) {
    discount =
      promo.type === "percent"
        ? Math.round((subtotal * promo.value) / 100)
        : promo.value;
    discount = Math.min(discount, subtotal);
  }

  const delivery = items.length > 0 ? DELIVERY_FEE : 0;
  return {
    subtotal,
    discount,
    delivery,
    total: subtotal - discount + delivery,
    itemCount,
  };
}

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export const formatNaira = (amount: number) => naira.format(amount);

// First-visit swipe hint (touch devices only, once).
const HINT_KEY = "fimba-cart-swipe-hint";

export function shouldPlayHint(): boolean {
  try {
    if (typeof window === "undefined") return false;
    if (!window.matchMedia("(pointer: coarse)").matches) return false;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return false;
    return window.localStorage.getItem(HINT_KEY) !== "done";
  } catch {
    return false;
  }
}

export function markHintDone() {
  try {
    window.localStorage.setItem(HINT_KEY, "done");
  } catch {
    /* storage can be unavailable; the hint just plays again */
  }
}
