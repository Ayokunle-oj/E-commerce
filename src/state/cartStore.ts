import { useSyncExternalStore } from 'react'

type CartListener = () => void

let itemCount = 3
const listeners = new Set<CartListener>()

export const cartStore = {
  getSnapshot: () => itemCount,
  subscribe: (listener: CartListener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  setItemCount: (nextCount: number) => {
    itemCount = Math.max(0, Math.floor(nextCount))
    listeners.forEach((listener) => listener())
  },
}

export function useCartCount() {
  return useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getSnapshot)
}
