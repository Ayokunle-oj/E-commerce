import { useCallback, useMemo, useReducer, type ReactNode } from "react";
import type { CartLine } from "../types/cart";
import type { Product } from "../types/product";
import { DEMO_CART, DEMO_WISHLIST } from "../Pages/cart/demoCart";
import {
  CartContext,
  type CartContextValue,
  type LastAction,
} from "./CartContext";

interface State {
  ownerId: string;
  items: CartLine[];
  wishlist: Product[];
  last: LastAction | null;
  seq: number;
}

type Action =
  | { type: "add"; product: Product }
  | { type: "setQty"; id: string; quantity: number }
  | { type: "remove"; id: string }
  | { type: "delete"; id: string }
  | { type: "wishlist"; id: string }
  | { type: "unwishlist"; id: string }
  | { type: "moveToCart"; id: string }
  | { type: "undo" }
  | { type: "dismissUndo" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "add": {
      const { product } = action;
      if (product.stock <= 0) return state;
      const existing = state.items.find((i) => i.id === product.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === product.id
              ? { ...i, quantity: Math.min(i.stock, i.quantity + 1) }
              : i,
          ),
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          { ...product, quantity: 1, addedBy: state.ownerId },
        ],
      };
    }

    case "setQty":
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id
            ? {
                ...i,
                quantity: Math.max(1, Math.min(i.stock, action.quantity)),
              }
            : i,
        ),
      };

    case "remove": {
      const index = state.items.findIndex((i) => i.id === action.id);
      if (index === -1) return state;
      const seq = state.seq + 1;
      return {
        ...state,
        seq,
        items: state.items.filter((i) => i.id !== action.id),
        last: { key: seq, kind: "removed", item: state.items[index], index },
      };
    }

    case "delete":
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };

    case "wishlist": {
      const index = state.items.findIndex((i) => i.id === action.id);
      if (index === -1) return state;
      const item = state.items[index];
      const seq = state.seq + 1;
      return {
        ...state,
        seq,
        items: state.items.filter((i) => i.id !== action.id),
        wishlist: [item, ...state.wishlist.filter((w) => w.id !== item.id)],
        last: { key: seq, kind: "wishlisted", item, index },
      };
    }

    case "unwishlist":
      return {
        ...state,
        wishlist: state.wishlist.filter((w) => w.id !== action.id),
      };

    case "moveToCart": {
      const product = state.wishlist.find((w) => w.id === action.id);
      if (!product || product.stock <= 0) return state;
      const existing = state.items.find((i) => i.id === product.id);
      const items = existing
        ? state.items.map((i) =>
            i.id === product.id
              ? { ...i, quantity: Math.min(i.stock, i.quantity + 1) }
              : i,
          )
        : [...state.items, { ...product, quantity: 1, addedBy: state.ownerId }];
      return {
        ...state,
        items,
        wishlist: state.wishlist.filter((w) => w.id !== product.id),
        last: null,
      };
    }

    case "undo": {
      const { last } = state;
      if (!last) return state;
      const items = [...state.items];
      items.splice(Math.min(last.index, items.length), 0, last.item);
      return {
        ...state,
        items,
        wishlist:
          last.kind === "wishlisted"
            ? state.wishlist.filter((w) => w.id !== last.item.id)
            : state.wishlist,
        last: null,
      };
    }

    case "dismissUndo":
      return state.last ? { ...state, last: null } : state;
  }
}

const init = (): State => ({
  ownerId: DEMO_CART.ownerId,
  items: DEMO_CART.items,
  wishlist: DEMO_WISHLIST,
  last: null,
  seq: 0,
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, init);

  const addToCart = useCallback(
    (product: Product) => dispatch({ type: "add", product }),
    [],
  );
  const setQuantity = useCallback(
    (id: string, quantity: number) =>
      dispatch({ type: "setQty", id, quantity }),
    [],
  );
  const removeItem = useCallback(
    (id: string) => dispatch({ type: "remove", id }),
    [],
  );
  const deleteItem = useCallback(
    (id: string) => dispatch({ type: "delete", id }),
    [],
  );
  const moveToWishlist = useCallback(
    (id: string) => dispatch({ type: "wishlist", id }),
    [],
  );
  const removeFromWishlist = useCallback(
    (id: string) => dispatch({ type: "unwishlist", id }),
    [],
  );
  const moveToCart = useCallback(
    (id: string) => dispatch({ type: "moveToCart", id }),
    [],
  );
  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const dismissUndo = useCallback(() => dispatch({ type: "dismissUndo" }), []);

  const { items, wishlist, last } = state;

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      wishlist,
      last,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      addToCart,
      setQuantity,
      removeItem,
      deleteItem,
      moveToWishlist,
      removeFromWishlist,
      moveToCart,
      undo,
      dismissUndo,
    }),
    [
      items,
      wishlist,
      last,
      addToCart,
      setQuantity,
      removeItem,
      deleteItem,
      moveToWishlist,
      removeFromWishlist,
      moveToCart,
      undo,
      dismissUndo,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
