import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import type { CartLine } from "../types/cart";
import type { Product } from "../types/product";
import { useAuth } from "../auth/authContext";
import { demoServer } from "../demo/demoServer";
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
  | { type: "toggleWishlist"; product: Product }
  | { type: "moveToCart"; id: string }
  | { type: "reset"; userId: string | null }
  | { type: "undo" }
  | { type: "dismissUndo" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "reset":
      return init(action.userId);

    case "add": {
      const { product } = action;
      if (product.stock <= 0) return state;
      const existing = state.items.find((i) => i.id === product.id);
      if (existing) {
        return {
          ...state,
          last: null,
          items: state.items.map((i) =>
            i.id === product.id
              ? { ...i, quantity: Math.min(i.stock, i.quantity + 1) }
              : i,
          ),
        };
      }
      return {
        ...state,
        last: null,
        items: [
          ...state.items,
          { ...product, quantity: 1, addedBy: state.ownerId },
        ],
      };
    }

    case "setQty":
      return {
        ...state,
        last: null,
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
      return {
        ...state,
        last: null,
        items: state.items.filter((i) => i.id !== action.id),
      };

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

    case "toggleWishlist": {
      const { product } = action;
      const saved = state.wishlist.some((w) => w.id === product.id);
      return {
        ...state,
        wishlist: saved
          ? state.wishlist.filter((w) => w.id !== product.id)
          : [product, ...state.wishlist],
      };
    }

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
      // The product is already back in the cart: drop the undo, never add a second line
      if (state.items.some((i) => i.id === last.item.id)) {
        return { ...state, last: null };
      }
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

// The cart a person starts with: whatever the server has saved for them (nothing for a guest).
const init = (userId: string | null): State => {
  const saved = userId
    ? demoServer.loadCart(userId)
    : { items: [], wishlist: [] };
  return {
    ownerId: userId ?? "guest",
    items: saved.items,
    wishlist: saved.wishlist,
    last: null,
    seq: 0,
  };
};

const NO_ITEMS: CartLine[] = [];
const NO_PRODUCTS: Product[] = [];

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const signedIn = userId !== null;
  const [state, dispatch] = useReducer(reducer, userId, init);

  // A different person (or nobody) is now using the app: start from a fresh cart.
  const [cartUserId, setCartUserId] = useState(userId);
  if (cartUserId !== userId) {
    setCartUserId(userId);
    dispatch({ type: "reset", userId });
  }

  // Save the cart and wishlist after every change, so they are still there after a refresh.
  const { items: savedItems, wishlist: savedWishlist } = state;
  useEffect(() => {
    if (userId)
      demoServer.saveCart(userId, {
        items: savedItems,
        wishlist: savedWishlist,
      });
  }, [userId, savedItems, savedWishlist]);

  // Guests cannot change the cart or the wishlist. The screens ask them to sign in first;
  // this is the safety net in case any screen forgets.
  const send = useCallback(
    (action: Action) => {
      if (signedIn) dispatch(action);
    },
    [signedIn],
  );

  const addToCart = useCallback(
    (product: Product) => send({ type: "add", product }),
    [send],
  );
  const setQuantity = useCallback(
    (id: string, quantity: number) => send({ type: "setQty", id, quantity }),
    [send],
  );
  const removeItem = useCallback(
    (id: string) => send({ type: "remove", id }),
    [send],
  );
  const deleteItem = useCallback(
    (id: string) => send({ type: "delete", id }),
    [send],
  );
  const moveToWishlist = useCallback(
    (id: string) => send({ type: "wishlist", id }),
    [send],
  );
  const removeFromWishlist = useCallback(
    (id: string) => send({ type: "unwishlist", id }),
    [send],
  );
  const toggleWishlist = useCallback(
    (product: Product) => send({ type: "toggleWishlist", product }),
    [send],
  );
  const moveToCart = useCallback(
    (id: string) => send({ type: "moveToCart", id }),
    [send],
  );
  const undo = useCallback(() => send({ type: "undo" }), [send]);
  const dismissUndo = useCallback(() => send({ type: "dismissUndo" }), [send]);

  // A guest always sees an empty cart and wishlist.
  const items = signedIn ? state.items : NO_ITEMS;
  const wishlist = signedIn ? state.wishlist : NO_PRODUCTS;
  const last = signedIn ? state.last : null;

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
      toggleWishlist,
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
      toggleWishlist,
      moveToCart,
      undo,
      dismissUndo,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
