import { products } from "../../Components/products/products";
import type { Cart, CartLine } from "../../types/cart";
import type { Product } from "../../types/product";

// Demo data built from products.ts. Replace with Supabase queries later.
const OWNER_ID = "user_demo";

function findProduct(id: string): Product {
  const product = products.find((p) => p.id === id);
  if (!product)
    throw new Error(`Demo product ${id} is missing from products.ts`);
  return product;
}

const line = (id: string, quantity: number): CartLine => ({
  ...findProduct(id),
  quantity,
  addedBy: OWNER_ID,
});

export const DEMO_CART: Cart = {
  id: "cart_demo_1",
  ownerId: OWNER_ID,
  items: [line("p01", 1), line("p06", 2), line("p07", 1), line("p19", 1)],
};

export const DEMO_WISHLIST: Product[] = [
  findProduct("p12"),
  findProduct("p24"),
];
