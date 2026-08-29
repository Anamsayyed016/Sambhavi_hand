'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react'
import type { Product } from '@/lib/products'

const WISHLIST_STORAGE_KEY = 'sambhavi_wishlist'
const CART_STORAGE_KEY = 'sambhavi_cart_v1'

export type CartItem = {
  slug: string
  name: string
  price: number
  image: string
  category: string
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  wishlist: string[]
  isCartOpen: boolean
  count: number
  subtotal: number
  pricingReady: boolean
  addItem: (product: Product, quantity?: number) => void
  removeItem: (slug: string) => void
  updateQuantity: (slug: string, quantity: number) => void
  clearCart: () => void
  /** Refresh unit prices from the database (source of truth for checkout). */
  revalidatePrices: () => Promise<{
    ok: boolean
    total?: number
    items?: CartItem[]
    error?: string
  }>
  toggleWishlist: (slug: string) => void
  isWishlisted: (slug: string) => boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function readWishlistFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === 'string')
  } catch {
    return []
  }
}

function readCartFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((row) => {
        if (!row || typeof row !== 'object') return null
        const item = row as Record<string, unknown>
        if (typeof item.slug !== 'string' || typeof item.quantity !== 'number') return null
        return {
          slug: item.slug,
          name: typeof item.name === 'string' ? item.name : item.slug,
          price: typeof item.price === 'number' ? item.price : 0,
          image: typeof item.image === 'string' ? item.image : '',
          category: typeof item.category === 'string' ? item.category : '',
          quantity: Math.max(1, Math.floor(item.quantity)),
        } satisfies CartItem
      })
      .filter((item): item is CartItem => item !== null)
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])
  const [wishlistReady, setWishlistReady] = useState(false)
  const [cartReady, setCartReady] = useState(false)
  const [pricingReady, setPricingReady] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  useEffect(() => {
    setWishlist(readWishlistFromStorage())
    setItems(readCartFromStorage())
    setWishlistReady(true)
    setCartReady(true)
  }, [])

  useEffect(() => {
    if (!wishlistReady) return
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist))
    } catch {
      // Ignore quota / private-mode write failures
    }
  }, [wishlist, wishlistReady])

  useEffect(() => {
    if (!cartReady) return
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Ignore quota / private-mode write failures
    }
  }, [items, cartReady])

  const revalidatePrices = useCallback(async () => {
    setPricingReady(false)
    const current = items
    if (current.length === 0) {
      setPricingReady(true)
      return { ok: true, total: 0 }
    }

    try {
      const res = await fetch('/api/cart/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: current.map((item) => ({ slug: item.slug, quantity: item.quantity })),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setPricingReady(true)
        return { ok: false, error: data.error ?? 'Unable to refresh prices.' }
      }

      const nextItems: CartItem[] = (data.items as Array<{
        slug: string
        name: string
        price: number
        image: string
        category: string
        quantity: number
      }>).map((row) => ({
        slug: row.slug,
        name: row.name,
        price: row.price,
        image: row.image,
        category: row.category,
        quantity: row.quantity,
      }))

      setItems(nextItems)
      setPricingReady(true)
      return { ok: true, total: data.total as number, items: nextItems }
    } catch {
      setPricingReady(true)
      return { ok: false, error: 'Unable to refresh prices.' }
    }
  }, [items])

  useEffect(() => {
    if (!cartReady) return

    let cancelled = false
    async function hydratePrices() {
      const snapshot = readCartFromStorage()
      if (snapshot.length === 0) {
        if (!cancelled) setPricingReady(true)
        return
      }
      try {
        const res = await fetch('/api/cart/pricing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: snapshot.map((item) => ({ slug: item.slug, quantity: item.quantity })),
          }),
        })
        const data = await res.json().catch(() => ({}))
        if (!cancelled && res.ok && Array.isArray(data.items)) {
          setItems(
            data.items.map(
              (row: {
                slug: string
                name: string
                price: number
                image: string
                category: string
                quantity: number
              }) => ({
                slug: row.slug,
                name: row.name,
                price: row.price,
                image: row.image,
                category: row.category,
                quantity: row.quantity,
              }),
            ),
          )
        }
      } catch {
        // Keep stored snapshot if pricing API is unavailable.
      } finally {
        if (!cancelled) setPricingReady(true)
      }
    }

    void hydratePrices()
    return () => {
      cancelled = true
    }
  }, [cartReady])

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === product.slug)
      if (existing) {
        return prev.map((i) =>
          i.slug === product.slug ? { ...i, quantity: i.quantity + quantity, price: product.price } : i,
        )
      }
      return [
        ...prev,
        {
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          quantity,
        },
      ]
    })
    setIsCartOpen(true)
  }, [])

  const removeItem = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug))
  }, [])

  const updateQuantity = useCallback((slug: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.slug === slug ? { ...i, quantity: Math.max(1, quantity) } : i))
        .filter((i) => i.quantity > 0),
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const toggleWishlist = useCallback((slug: string) => {
    setWishlist((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    )
  }, [])

  const isWishlisted = useCallback((slug: string) => wishlist.includes(slug), [wishlist])

  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])

  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items])
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  )

  const value: CartContextValue = {
    items,
    wishlist,
    isCartOpen,
    count,
    subtotal,
    pricingReady,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    revalidatePrices,
    toggleWishlist,
    isWishlisted,
    openCart,
    closeCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
