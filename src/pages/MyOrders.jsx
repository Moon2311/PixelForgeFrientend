import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import StoreLayout from '../components/StoreLayout.jsx'
import { getAccessToken } from '../lib/api.js'
import { formatMoney } from '../lib/format.js'
import { listMyOrders, ORDER_STATUS_LABELS, PAYABLE_ONLINE_METHODS, PAYMENT_LABELS } from '../lib/ordersApi.js'

const STATUS_COLOR = {
  cancelled: 'text-pf-deal-red',
  completed: 'text-pf-badge-green',
  shipped: 'text-pf-badge-green',
}

function fmtDate(value) {
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

function OrderCard({ order }) {
  const address = order.shipping_address
  return (
    <article className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <header className="bg-gray-50 border-b border-gray-200 px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-pf-text-light">
        <div>
          <p className="uppercase">Order placed</p>
          <p className="text-sm text-pf-text">{fmtDate(order.created_at)}</p>
        </div>
        <div>
          <p className="uppercase">Total</p>
          <p className="text-sm text-pf-text">{formatMoney(order.total)}</p>
        </div>
        <div>
          <p className="uppercase">{order.delivery_method === 'pickup' ? 'Delivery' : 'Ship to'}</p>
          <p className="text-sm text-pf-text truncate">
            {order.delivery_method === 'pickup'
              ? 'Store pickup'
              : address && `${address.first_name} ${address.last_name}, ${address.city}`}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="uppercase">Order #</p>
          <p className="text-sm text-pf-text">{order.number}</p>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className={`text-base font-bold ${STATUS_COLOR[order.status] || 'text-pf-text'}`}>
            {ORDER_STATUS_LABELS[order.status] || order.status}
          </p>
          <p className="text-xs text-pf-text-light">{PAYMENT_LABELS[order.payment_method] || order.payment_method}</p>
        </div>

        {order.status === 'awaiting_payment' && PAYABLE_ONLINE_METHODS.includes(order.payment_method) && (
          <Link
            to={`/order-success/${order.number}`}
            className="inline-flex items-center justify-center h-10 px-5 rounded-md bg-[#1773b0] hover:bg-[#145f91] text-white text-sm font-semibold"
          >
            Pay Now
          </Link>
        )}

        <ul className="space-y-3">
          {order.items.map((item) => (
            <li key={item.product_id} className="flex gap-3">
              <div className="w-16 h-16 shrink-0 rounded border border-gray-200 bg-white flex items-center justify-center overflow-hidden">
                {item.image_url ? (
                  <img src={item.image_url} alt="" className="max-w-full max-h-full object-contain" />
                ) : (
                  <span className="text-xs text-pf-text-light">No image</span>
                )}
              </div>
              <div className="flex-1 min-w-0 text-sm">
                <p className="text-pf-text font-medium line-clamp-2">{item.product_name}</p>
                <p className="text-pf-text-light">
                  Qty {item.quantity} × {formatMoney(item.unit_price)}
                </p>
              </div>
              <p className="text-sm font-medium whitespace-nowrap">{formatMoney(item.line_total)}</p>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

export default function MyOrders() {
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState('')
  const [loggedIn, setLoggedIn] = useState(() => Boolean(getAccessToken()))

  useEffect(() => {
    if (!loggedIn) return
    listMyOrders()
      .then((data) => setOrders(data || []))
      .catch((err) => {
        if (err.status === 401) setLoggedIn(false)
        else setError(err.message || 'Could not load your orders.')
      })
  }, [loggedIn])

  if (!loggedIn) {
    return <Navigate to="/login" replace state={{ returnTo: '/orders' }} />
  }

  return (
    <StoreLayout>
      <main className="mx-auto max-w-[900px] px-3 sm:px-4 py-8">
        <h1 className="text-2xl font-semibold text-pf-text mb-5">Your Orders</h1>

        {error ? (
          <p role="alert" className="text-sm text-pf-deal-red">{error}</p>
        ) : !orders ? (
          <div className="space-y-4" aria-busy="true" aria-label="Loading orders">
            {[0, 1].map((i) => (
              <div key={i} className="h-40 animate-pulse bg-gray-100 rounded-lg" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center space-y-3">
            <p className="text-pf-text">You haven't placed any orders yet.</p>
            <Link
              to="/products"
              className="inline-block bg-pf-cta hover:bg-pf-cta-hover text-pf-text hover:text-pf-text text-sm font-medium px-6 py-2 rounded-full shadow-sm"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            <p className="text-sm text-pf-text-light">
              {orders.length} order{orders.length === 1 ? '' : 's'} placed
            </p>
            {orders.map((order) => (
              <OrderCard key={order.number} order={order} />
            ))}
          </div>
        )}
      </main>
    </StoreLayout>
  )
}
