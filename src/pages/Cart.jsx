import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { useToast } from '../context/useToast.js'
import { getCart, updateCartItem, removeCartItem } from '../lib/cartApi.js'
import { getProductsApiBaseUrl } from '../lib/api.js'
import '../styles/cart.css'

export default function Cart() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState({})
  const [updatingId, setUpdatingId] = useState(null)

  const fetchCart = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getCart()
      setCart(result.data)
    } catch (err) {
      if (err.status === 401) {
        navigate('/login', { replace: true })
        return
      }
      showToast(err.message || 'Failed to load cart', 'error')
    } finally {
      setLoading(false)
    }
  }, [navigate, showToast])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  // Fetch product details for each unique product_id
  useEffect(() => {
    if (!cart?.items?.length) return
    const ids = [...new Set(cart.items.map((i) => i.product_id))]
    ids.forEach((id) => {
      if (products[id]) return
      fetch(`${getProductsApiBaseUrl()}/api/products/${id}/`)
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data?.data) setProducts((prev) => ({ ...prev, [id]: data.data }))
        })
        .catch(() => {})
    })
  }, [cart, products])

  const handleQuantity = async (itemId, newQty) => {
    if (newQty < 1) return handleRemove(itemId, true)
    setUpdatingId(itemId)
    try {
      await updateCartItem(itemId, newQty)
      setCart((prev) => ({
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

  const handleRemove = async (itemId, silent = false) => {
    if (!silent) {
      if (!window.confirm('Remove this product from your cart?')) return
    }
    setUpdatingId(itemId)
    try {
      await removeCartItem(itemId)
      setCart((prev) => ({
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

  const items = cart?.items || []

  const subtotal = items.reduce((sum, item) => {
    const p = products[item.product_id]
    if (!p) return sum
    const price = p.discount_price || p.price || 0
    return sum + price * item.quantity
  }, 0)

  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0)

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
            <Link to="/products" className="cart-continue-btn">Continue Shopping</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {items.map((item) => {
                const p = products[item.product_id]
                const price = p?.discount_price || p?.price || 0
                const lineTotal = price * item.quantity
                return (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-image">
                      {p?.images?.[0] || p?.thumbnail ? (
                        <img src={p.images?.[0] || p.thumbnail} alt={p?.name || 'Product'} />
                      ) : (
                        <div className="cart-item-no-img">No image</div>
                      )}
                    </div>
                    <div className="cart-item-details">
                      <h3>{p?.name || `Product #${item.product_id}`}</h3>
                      {p?.sku && <span className="cart-item-sku">SKU: {p.sku}</span>}
                      <span className="cart-item-price">${price.toFixed(2)}</span>
                    </div>
                    <div className="cart-item-actions">
                      <div className="cart-qty-controls">
                        <button
                          className="cart-qty-btn"
                          disabled={updatingId === item.id}
                          onClick={() => handleQuantity(item.id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="cart-qty-value">{item.quantity}</span>
                        <button
                          className="cart-qty-btn"
                          disabled={updatingId === item.id}
                          onClick={() => handleQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <span className="cart-item-subtotal">${lineTotal.toFixed(2)}</span>
                      <button
                        className="cart-remove-btn"
                        disabled={updatingId === item.id}
                        onClick={() => handleRemove(item.id)}
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
              <Link to="/products" className="cart-continue-btn">Continue Shopping</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
