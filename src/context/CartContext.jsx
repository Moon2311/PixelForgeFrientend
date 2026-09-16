import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { getAccessToken } from '../lib/api.js'
import { getCart as fetchServerCart, addToCart as serverAddToCart } from '../lib/cartApi.js'

const CartContext = createContext(null)

const GUEST_CART_KEY = 'guest_cart'

function readGuestCart() {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeGuestCart(items) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
}

export function CartProvider({ children }) {
  const [guestItems, setGuestItems] = useState(readGuestCart)
  const [serverCount, setServerCount] = useState(0)
  const isAuth = Boolean(getAccessToken())

  // Keep guest cart in sync across tabs
  useEffect(() => {
    const handler = (e) => {
      if (e.key === GUEST_CART_KEY) {
        setGuestItems(readGuestCart())
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  // Refresh server cart count when authenticated
  const refreshServerCount = useCallback(async () => {
    if (!getAccessToken()) {
      setServerCount(0)
      return
    }
    try {
      const result = await fetchServerCart()
      const items = result?.data?.items || []
      setServerCount(items.reduce((s, i) => s + i.quantity, 0))
    } catch {
      // silently ignore
    }
  }, [])

  useEffect(() => {
    refreshServerCount()
    const handler = () => refreshServerCount()
    window.addEventListener('cart-updated', handler)
    return () => window.removeEventListener('cart-updated', handler)
  }, [refreshServerCount])

  const cartCount = isAuth ? serverCount : guestItems.reduce((s, i) => s + i.quantity, 0)
  const cartItems = isAuth ? [] : guestItems // server items fetched separately in Cart page

  const addToGuestCart = useCallback((product) => {
    setGuestItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id)
      let next
      if (existing) {
        next = prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        )
      } else {
        next = [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            price: product.discount_price || product.price,
            quantity: 1,
            imageUrl: product.images?.[0] || product.thumbnail || '',
          },
        ]
      }
      writeGuestCart(next)
      return next
    })
    window.dispatchEvent(new Event('cart-updated'))
  }, [])

  const removeFromGuestCart = useCallback((productId) => {
    setGuestItems((prev) => {
      const next = prev.filter((i) => i.productId !== productId)
      writeGuestCart(next)
      return next
    })
    window.dispatchEvent(new Event('cart-updated'))
  }, [])

  const updateGuestQuantity = useCallback((productId, quantity) => {
    if (quantity < 1) return removeFromGuestCart(productId)
    setGuestItems((prev) => {
      const next = prev.map((i) =>
        i.productId === productId ? { ...i, quantity } : i,
      )
      writeGuestCart(next)
      return next
    })
    window.dispatchEvent(new Event('cart-updated'))
  }, [removeFromGuestCart])

  const clearGuestCart = useCallback(() => {
    setGuestItems([])
    writeGuestCart([])
    window.dispatchEvent(new Event('cart-updated'))
  }, [])

  // Merge guest cart into server cart after login
  const mergeGuestCartToServer = useCallback(async () => {
    const guest = readGuestCart()
    if (guest.length === 0) return
    for (const item of guest) {
      try {
        await serverAddToCart(item.productId, item.quantity)
      } catch {
        // best-effort — don't block login flow
      }
    }
    clearGuestCart()
    refreshServerCount()
  }, [clearGuestCart, refreshServerCount])

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        guestItems,
        addToGuestCart,
        removeFromGuestCart,
        updateGuestQuantity,
        clearGuestCart,
        mergeGuestCartToServer,
        refreshServerCount,
      }}
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
