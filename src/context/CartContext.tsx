import { createContext } from "react";
import type { CartLine } from "../types/cart";
import type { Product } from "../types/product";

export interface LastAction {
  key: number;
  kind: "removed" | "wishlisted";
  item: CartLine;
  index: number;
}

export interface CartContextValue {
  items: CartLine[];
  wishlist: Product[];
  last: LastAction | null;
  itemCount: number; // total quantity, used for the nav badges
  subtotal: number; // items only, before delivery and promo
  addToCart: (product: Product) => void;
  setQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void; // from the cart page: leaves an undo toast
  deleteItem: (id: string) => void; // from product cards: removes quietly, no undo toast
  moveToWishlist: (id: string) => void;
  removeFromWishlist: (id: string) => void;
  toggleWishlist: (product: Product) => void; // heart on the product page
  moveToCart: (id: string) => void;
  undo: () => void;
  dismissUndo: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);
