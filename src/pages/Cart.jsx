import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import StoreLayout from '../components/StoreLayout.jsx'
import { TrashIcon } from '../components/Icons.jsx'
import { formatMoney } from '../lib/format.js'
import { useToast } from '../context/useToast.js'
import { useCart } from '../context/CartContext.jsx'
import { getAccessToken } from '../lib/api.js'
import { getCart, updateCartItem, removeCartItem } from '../lib/cartApi.js'
import { getApiBaseUrl } from '../lib/api.js'

export default function Cart() {
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
      fetch(`${getApiBaseUrl()}/api/products/${id}/`)
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
      fetch(`${getApiBaseUrl()}/api/products/${item.productId}/`)
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
      <StoreLayout>
        <main className="mx-auto max-w-[1500px] px-3 sm:px-4 py-5">
          <div className="bg-white p-6 animate-pulse space-y-4" aria-busy="true" aria-label="Loading cart">
            <div className="h-7 w-48 bg-gray-200 rounded" />
            {[0, 1].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-32 h-32 bg-gray-200" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-2/3 bg-gray-200 rounded" />
                  <div className="h-4 w-1/4 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </StoreLayout>
    )
  }

  const itemsLabel = `${totalQty} item${totalQty !== 1 ? 's' : ''}`
  const linkCls = 'text-pf-link hover:text-pf-link-hover hover:underline cursor-pointer disabled:opacity-50'

  return (
    <StoreLayout>
      <main className="mx-auto max-w-[1500px] px-3 sm:px-4 py-5">
        {items.length === 0 ? (
          <div className="bg-white p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-8">
            <div className="w-40 h-40 shrink-0 rounded-full bg-pf-bg flex items-center justify-center text-pf-text-light">
              <svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-pf-text mb-1">Your cart is empty</h1>
              <p className="text-sm text-pf-text-light mb-5">
                Check out today’s deals, or keep browsing to find something you love.
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                <Link to="/products" className="bg-pf-cta hover:bg-pf-cta-hover text-pf-text hover:text-pf-text text-sm font-medium px-6 py-2 rounded-full shadow-sm">
                  Continue shopping
                </Link>
                {!isAuth && (
                  <Link to="/login" state={{ returnTo: '/cart' }} className="bg-white border border-gray-300 hover:bg-gray-50 text-pf-text hover:text-pf-text text-sm font-medium px-6 py-2 rounded-full shadow-sm">
                    Sign in to your account
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">
            <section className="bg-white p-4 sm:p-6">
              <div className="flex items-end justify-between border-b border-gray-200 pb-3">
                <h1 className="text-2xl sm:text-3xl font-medium text-pf-text">Shopping Cart</h1>
                <span className="hidden sm:block text-sm text-pf-text-light">Price</span>
              </div>

              <ul>
                {items.map((item) => {
                  const lineTotal = item.price * item.quantity
                  const busy = updatingId === item.id
                  const changeQty = (qty) =>
                    isAuth ? handleServerQuantity(item.id, qty) : handleGuestQuantity(item.productId, qty)
                  return (
                    <li key={item.id} className={`flex gap-4 py-4 border-b border-gray-200 ${busy ? 'opacity-60' : ''}`}>
                      <div className="w-24 h-24 sm:w-36 sm:h-36 shrink-0 bg-gray-50">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-xs text-pf-text-light">No image</div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-3">
                          <h3 className="text-base sm:text-lg leading-snug text-pf-text line-clamp-2">{item.name}</h3>
                          <span className="font-bold text-pf-text whitespace-nowrap">{formatMoney(lineTotal)}</span>
                        </div>
                        <p className="text-xs text-pf-badge-green mt-1">In Stock</p>
                        {item.sku && <p className="text-xs text-pf-text-light mt-0.5">SKU: {item.sku}</p>}
                        {item.quantity > 1 && (
                          <p className="text-xs text-pf-text-light mt-0.5">{formatMoney(item.price)} each</p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm">
                          <div className="inline-flex items-center rounded-full border-2 border-pf-cta overflow-hidden">
                            <button
                              type="button"
                              className="w-8 h-7 flex items-center justify-center hover:bg-pf-cta/30 cursor-pointer disabled:cursor-not-allowed"
                              disabled={busy}
                              onClick={() => changeQty(item.quantity - 1)}
                              aria-label={item.quantity === 1 ? 'Remove item' : 'Decrease quantity'}
                            >
                              {item.quantity === 1 ? (
                                <TrashIcon size={14} />
                              ) : (
                                <span className="text-lg leading-none">−</span>
                              )}
                            </button>
                            <span className="w-8 text-center font-bold" aria-live="polite">{item.quantity}</span>
                            <button
                              type="button"
                              className="w-8 h-7 flex items-center justify-center hover:bg-pf-cta/30 cursor-pointer disabled:cursor-not-allowed"
                              disabled={busy}
                              onClick={() => changeQty(item.quantity + 1)}
                              aria-label="Increase quantity"
                            >
                              <span className="text-lg leading-none">+</span>
                            </button>
                          </div>
                          <span className="text-gray-300" aria-hidden="true">|</span>
                          <button
                            type="button"
                            className={linkCls}
                            disabled={busy}
                            onClick={() =>
                              isAuth ? handleServerRemove(item.id) : handleGuestRemove(item.productId)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>

              <p className="text-right text-lg pt-3 text-pf-text">
                Subtotal ({itemsLabel}): <span className="font-bold">{formatMoney(subtotal)}</span>
              </p>
            </section>

            <aside className="bg-white p-5 lg:sticky lg:top-24 space-y-4">
              {subtotal >= 50 ? (
                <p className="text-xs text-pf-badge-green">
                  <span className="font-bold">✓ Your order qualifies for FREE delivery.</span>
                </p>
              ) : (
                <p className="text-xs text-pf-text-light">
                  Add <span className="font-bold text-pf-deal-red">{formatMoney(50 - subtotal)}</span> more for FREE delivery.
                </p>
              )}
              <p className="text-lg text-pf-text">
                Subtotal ({itemsLabel}): <span className="font-bold">{formatMoney(subtotal)}</span>
              </p>
              {isAuth ? (
                <Link
                  to="/checkout"
                  className="block text-center w-full bg-pf-cta hover:bg-pf-cta-hover text-pf-text hover:text-pf-text text-sm font-medium py-2 rounded-full shadow-sm"
                >
                  Proceed to checkout
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    state={{ returnTo: '/cart' }}
                    className="block text-center w-full bg-pf-cta hover:bg-pf-cta-hover text-pf-text hover:text-pf-text text-sm font-medium py-2 rounded-full shadow-sm"
                  >
                    Sign in to checkout
                  </Link>
                  <p className="text-xs text-pf-text-light text-center">
                    New here?{' '}
                    <Link to="/register" className="text-pf-link hover:text-pf-link-hover hover:underline">
                      Create an account
                    </Link>
                  </p>
                </>
              )}
              <Link
                to="/products"
                className="block text-center w-full bg-white border border-gray-300 hover:bg-gray-50 text-pf-text hover:text-pf-text text-sm py-2 rounded-full shadow-sm"
              >
                Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </main>
    </StoreLayout>
  )
}
