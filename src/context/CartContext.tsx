'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

export interface CartItem {
  id: string
  name: string
  slug: string
  price: number
  image?: string
  quantity: number
  variantId?: string
  notes?: string
}

interface CartContextType {
  items: CartItem[]
  itemCount: number
  total: number
  addItem: (item: CartItem) => void
  removeItem: (id: string, variantId?: string) => void
  updateQuantity: (id: string, variantId: string | undefined, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart')
      if (saved) setItems(JSON.parse(saved))
    } catch {}
  }, [])

  // Sync to localStorage and dispatch event when items change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
    window.dispatchEvent(new Event('cart-updated'))
  }, [items])

  // Listen for external cart updates (e.g., from shop page)
  useEffect(() => {
    const onCartUpdated = () => {
      try {
        const saved = localStorage.getItem('cart')
        if (saved) setItems(JSON.parse(saved))
      } catch {}
    }
    window.addEventListener('cart-updated', onCartUpdated)
    return () => window.removeEventListener('cart-updated', onCartUpdated)
  }, [])

  const addItem = useCallback((newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.id === newItem.id && i.variantId === newItem.variantId
      )
      if (existing) {
        return prev.map((i) =>
          i.id === newItem.id && i.variantId === newItem.variantId
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        )
      }
      return [...prev, newItem]
    })
  }, [])

  const removeItem = useCallback((id: string, variantId?: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.id === id && i.variantId === variantId))
    )
  }, [])

  const updateQuantity = useCallback(
    (id: string, variantId: string | undefined, quantity: number) => {
      if (quantity <= 0) {
        removeItem(id, variantId)
        return
      }
      setItems((prev) =>
        prev.map((i) =>
          i.id === id && i.variantId === variantId ? { ...i, quantity } : i
        )
      )
    },
    [removeItem]
  )

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const itemCount = items.reduce((s, i) => s + i.quantity, 0)
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, itemCount, total, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
