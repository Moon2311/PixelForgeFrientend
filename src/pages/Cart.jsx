import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { useToast } from '../context/useToast.js'
import { useCart } from '../context/CartContext.jsx'
import { getAccessToken } from '../lib/api.js'
import { getCart, updateCartItem, removeCartItem } from '../lib/cartApi.js'
import { getProductsApiBaseUrl } from '../lib/api.js'
import '../styles/cart.css'

export default function Cart() {
  const navigate = useNavigate()
  const showToast = useToast()
  const isAuth = Boolean(getAccessToken())
  const {
    guestItems,
    updateGuestQuantity,
    removeFromGuestCart,
    refreshServerCount,
  } = useCart()

  // Server cart state (only used when authenticated)
  const [serverCart, setServerCart] = useState(null)
  const [serverLoading, setServerLoading] = useState(false)
  const [products, setProducts] = useState({})
  const [updatingId, setUpdatingId] = useState(null)

  const fetchServerCart = useCallback(async () => {
    if (!isAuth) return
    setServerLoading(true)
    try {
      const result = await getCart()
      setServerCart(result.data)
    } catch (err) {
      showToast(err.message || 'Failed to load cart', 'error')
    } finally {
      setServerLoading(false)
    }
  }, [isAuth, showToast])

  useEffect(() => {
    if (isAuth) fetchServerCart()
  }, [isAuth, fetchServerCart])

  // Fetch product details for server cart items
  useEffect(() => {
    const items = serverCart?.items
    if (!items?.length) return
    const ids = [...new Set(items.map((i) => i.product_id))]
    ids.forEach((id) => {
      if (products[id]) return
      fetch(`${getProductsApiBaseUrl()}/api/products/${id}/`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.data) setProducts((prev) => ({ ...prev, [id]: data.data }))
        })
        .catch(() => {})
    })
  }, [serverCart, products])

  // Fetch product details for guest cart items
  useEffect(() => {
    if (isAuth || guestItems.length === 0) return
    guestItems.forEach((item) => {
      if (products[item.productId]) return
      fetch(`${getProductsApiBaseUrl()}/api/products/${item.productId}/`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.data) setProducts((prev) => ({ ...prev, [item.productId]: data.data }))
        })
        .catch(() => {})
    })
  }, [isAuth, guestItems, products])

  // Server cart handlers
  const handleServerQuantity = async (itemId, newQty) => {
    if (newQty < 1) return handleServerRemove(itemId, true)
    setUpdatingId(itemId)
    try {
      await updateCartItem(itemId, newQty)
      setServerCart((prev) => ({
        ...prev,
        items: prev.items.map((i) => (i.id === itemId ? { ...i, quantity: newQty } : i)),
      }))
      window.dispatchEvent(new Event('cart-updated'))
    } catch (err) {
      showToast(err.message || 'Failed to update', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleServerRemove = async (itemId, silent = false) => {
    if (!silent && !window.confirm('Remove this product from your cart?')) return
    setUpdatingId(itemId)
    try {
      await removeCartItem(itemId)
      setServerCart((prev) => ({
        ...prev,
        items: prev.items.filter((i) => i.id !== itemId),
      }))
      window.dispatchEvent(new Event('cart-updated'))
      if (!silent) showToast('Item removed from cart', 'success')
    } catch (err) {
      showToast(err.message || 'Failed to remove', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  // Guest cart handlers
  const handleGuestQuantity = (productId, newQty) => {
    updateGuestQuantity(productId, newQty)
  }

  const handleGuestRemove = (productId) => {
    if (!window.confirm('Remove this product from your cart?')) return
    removeFromGuestCart(productId)
    showToast('Item removed from cart', 'success')
  }

  // Compute items and totals based on auth state
  const loading = isAuth ? serverLoading : false

  const items = isAuth
    ? (serverCart?.items || []).map((item) => ({
        id: item.id,
        productId: item.product_id,
        quantity: item.quantity,
        name: products[item.product_id]?.name || `Product #${item.product_id}`,
        price: products[item.product_id]?.discount_price || products[item.product_id]?.price || 0,
        imageUrl: products[item.product_id]?.images?.[0] || products[item.product_id]?.thumbnail || '',
        sku: products[item.product_id]?.sku || '',
      }))
    : guestItems.map((item) => ({
        id: item.productId,
        productId: item.productId,
        quantity: item.quantity,
        name: item.name,
        price: Number(item.price) || 0,
        imageUrl: item.imageUrl || '',
        sku: '',
      }))

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0)

  if (loading) {
    return (
      <div className="cart-page">
        <div className="cart-wrap">
          <Navbar />
          <p className="cart-status">
            <span className="spinner" aria-hidden="true" />
            Loading cart...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="cart-wrap">
        <Navbar />

        {/* Guest sign-in banner */}
        {!isAuth && items.length > 0 && (
          <div className="cart-guest-banner">
            <p>
              <strong>Sign in or create an account</strong> to place your order and track your purchases.
            </p>
            <div className="cart-guest-actions">
              <Link to="/login" state={{ returnTo: '/cart' }} className="cart-continue-btn">
                Sign In
              </Link>
              <Link to="/register" className="cart-continue-btn cart-continue-btn-outline">
                Create Account
              </Link>
            </div>
          </div>
        )}

        <div className="cart-header">
          <h1>Your Cart</h1>
          {items.length > 0 && <span className="cart-count">{totalQty} item{totalQty !== 1 ? 's' : ''}</span>}
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
            </div>
            <h2>Your cart is empty</h2>
            <p>Add products to your cart and they will appear here.</p>
            <Link to="/products" className="cart-continue-btn">Browse Products</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {items.map((item) => {
                const lineTotal = item.price * item.quantity
                return (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-image">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} />
                      ) : (
                        <div className="cart-item-no-img">No image</div>
                      )}
                    </div>
                    <div className="cart-item-details">
                      <h3>{item.name}</h3>
                      {item.sku && <span className="cart-item-sku">SKU: {item.sku}</span>}
                      <span className="cart-item-price">${item.price.toFixed(2)}</span>
                    </div>
                    <div className="cart-item-actions">
                      <div className="cart-qty-controls">
                        <button
                          className="cart-qty-btn"
                          disabled={updatingId === item.id}
                          onClick={() =>
                            isAuth
                              ? handleServerQuantity(item.id, item.quantity - 1)
                              : handleGuestQuantity(item.productId, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="cart-qty-value">{item.quantity}</span>
                        <button
                          className="cart-qty-btn"
                          disabled={updatingId === item.id}
                          onClick={() =>
                            isAuth
                              ? handleServerQuantity(item.id, item.quantity + 1)
                              : handleGuestQuantity(item.productId, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <span className="cart-item-subtotal">${lineTotal.toFixed(2)}</span>
                      <button
                        className="cart-remove-btn"
                        disabled={updatingId === item.id}
                        onClick={() =>
                          isAuth
                            ? handleServerRemove(item.id)
                            : handleGuestRemove(item.productId)
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="cart-summary">
              <h2>Order Summary</h2>
              <div className="cart-summary-row">
                <span>Subtotal ({totalQty} item{totalQty !== 1 ? 's' : ''})</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="cart-summary-total">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {isAuth ? (
                <button type="button" className="cart-continue-btn" style={{ width: '100%' }}>
                  Proceed to Checkout
                </button>
              ) : (
                <Link to="/login" state={{ returnTo: '/cart' }} className="cart-continue-btn" style={{ display: 'block', textAlign: 'center' }}>
                  Sign in to Checkout
                </Link>
              )}
              <Link to="/products" className="cart-continue-btn cart-continue-btn-outline" style={{ display: 'block', textAlign: 'center', marginTop: '0.75rem' }}>
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
