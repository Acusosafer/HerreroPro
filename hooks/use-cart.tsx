"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

// Actualizar la interfaz CartItem para asegurar que el precio es unitario
export interface CartItem {
  id: string
  name: string
  price: number // Precio unitario
  quantity: number
  type: string
  length?: number
}

interface CartStore {
  items: CartItem[]
  addItem: (data: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

export const useCart = create(
  persist<CartStore>(
    (set, get) => ({
      items: [],
      // Actualizar la función addItem para mantener el precio unitario
      addItem: (data: CartItem) => {
        const currentItems = get().items
        const existingItem = currentItems.find((item) => item.id === data.id)

        if (existingItem) {
          return set({
            items: currentItems.map((item) =>
              item.id === data.id ? { ...item, quantity: item.quantity + data.quantity } : item,
            ),
          })
        }

        set({ items: [...currentItems, data] })
      },
      removeItem: (id: string) => {
        set({ items: get().items.filter((item) => item.id !== id) })
      },
      updateQuantity: (id: string, quantity: number) => {
        set({
          items: get().items.map((item) => (item.id === id ? { ...item, quantity } : item)),
        })
      },
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
