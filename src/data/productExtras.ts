// Extra details for the product page, kept apart from the Product type on purpose.
// ALL OF THIS IS SAMPLE DATA for building and testing the page.
// Real data comes from Supabase later. Never ship sample inspections, delivery times or specs:
//   inspection: only from a check Fimba Go really did, with the real date.
//   delivery:   only the real supplier and courier times.
//   images:     only your own photos (no supplier photos without permission).
import type { Product } from "../types/product";

export interface InspectionCheck {
  label: string;
  passed: boolean;
}

export interface Inspection {
  checkedOn: string; // "YYYY-MM-DD"
  checks: InspectionCheck[];
  note?: string;
}

export interface ProductExtras {
  images?: string[];
  longDescription?: string;
  details?: { label: string; value: string }[];
  delivery?: { minDays: number; maxDays: number };
  inspection?: Inspection;
}

const photos = (id: string) => [
  `/images/products/${id}.svg`,
  `/images/products/${id}-2.svg`,
  `/images/products/${id}-3.svg`,
];

function sample(product: Product): ProductExtras {
  return {
    images: photos(product.id),
    delivery: { minDays: 4, maxDays: 8 },
    inspection: product.verified
      ? {
          checkedOn: "2026-10-12",
          checks: [
            { label: "Matches the listing photos", passed: true },
            { label: "Works as described", passed: true },
            { label: "Packaging intact", passed: true },
          ],
        }
      : undefined,
  };
}

const overrides: Record<string, ProductExtras> = {
  p01: {
    longDescription:
      "Roomy backpack with a padded laptop pocket, a front zip pocket and padded shoulder straps. It has two main compartments for books and a charger, plus a side pocket for a bottle. Sample text: replace it with the real description of the product you check.",
    details: [
      { label: "Category", value: "Bags" },
      { label: "Compartments", value: "2 main, 2 small" },
      { label: "Laptop pocket", value: "Yes" },
    ],
  },
  p07: {
    longDescription:
      "Over-ear Bluetooth headphones with noise cancelling and soft ear cushions for long study sessions. They fold flat for a bag and charge over USB. Sample text: replace it with the real description of the product you check.",
    details: [
      { label: "Category", value: "Earbuds" },
      { label: "Type", value: "Over-ear, Bluetooth" },
      { label: "Charging", value: "USB" },
    ],
    delivery: { minDays: 5, maxDays: 10 },
  },
  p11: {
    longDescription:
      "High-capacity power bank with two USB ports, enough to charge a phone several times. Sample text: replace it with the real description of the product you check.",
    details: [
      { label: "Category", value: "Chargers" },
      { label: "Capacity", value: "20,000 mAh" },
      { label: "Ports", value: "2 USB" },
    ],
  },
  p18: {
    longDescription:
      "1.5 litre electric kettle with auto shut-off, quick for tea, noodles and more. Sample text: replace it with the real description of the product you check.",
    details: [
      { label: "Category", value: "Kitchen" },
      { label: "Capacity", value: "1.5 litres" },
    ],
  },
};

export function getExtras(product: Product): ProductExtras {
  return { ...sample(product), ...(overrides[product.id] ?? {}) };
}
