import type { Product } from "./product";

export interface CartLine extends Product {
  quantity: number;
  addedBy: string; // user id, so group carts can attribute items later
}

export interface Cart {
  id: string;
  ownerId: string;
  items: CartLine[];
}
