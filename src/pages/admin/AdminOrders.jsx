import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { formatMoney } from '../../lib/format.js'
import { adminListOrders, ORDER_STATUS_LABELS, PAYMENT_LABELS } from '../../lib/ordersApi.js'
import CustomerCell from './CustomerCell.jsx'

function fmtDate(value) {
  return value ? new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) : '—'
}

export default function AdminOrders() {
  const [params, setParams] = useSearchParams()
  const userId = params.get('user_id') || ''
  const status = params.get('status') || ''
  const query = params.get('q') || ''
  const [search, setSearch] = useState(query)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const setParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  // Search as you type, once typing pauses.
  useEffect(() => {
    if (search.trim() === query) return
    const timer = setTimeout(() => setParam('q', search.trim()), 350)
    return () => clearTimeout(timer)
  })

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    adminListOrders({ user_id: userId, status, q: query })
      .then((d) => {
        if (!cancelled) setData(d)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [userId, status, query])

  const customer = data?.customer
  const orders = data?.orders || []

  return (
    <div className="admin-orders">
      <div className="admin-page-head">
        <div>
          <h1>{customer ? `Orders by ${customer.name || `User #${customer.id}`}` : 'Orders'}</h1>
          <p>{customer ? customer.email : 'Every order placed in the store, with who bought what.'}</p>
        </div>
      </div>

      {customer && (
        <div className="admin-card order-customer-card">
          <div className="stock-stat-row">
            <div className="stock-stat">
              <span className="stock-stat-value">{customer.orders}</span>
              <span className="stock-stat-label">Orders</span>
            </div>
            <div className="stock-stat">
              <span className="stock-stat-value">{formatMoney(customer.spent)}</span>
              <span className="stock-stat-label">Total spent</span>
            </div>
            <div className="stock-stat">
              <span className="stock-stat-value">{customer.username || '—'}</span>
              <span className="stock-stat-label">Username</span>
            </div>
          </div>
          <p className="order-note">Cancelled orders are not counted in the totals.</p>
        </div>
      )}

      <div className="admin-filters">
        <input
          className="admin-input admin-filter-search"
          type="search"
          placeholder="Search order #, customer name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="admin-input" style={{ width: 'auto' }} value={status} onChange={(e) => setParam('status', e.target.value)}>
          <option value="">All statuses</option>
          {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {(userId || status || query) && (
          <button
            type="button"
            className="admin-filter-clear"
            onClick={() => {
              setSearch('')
              setParams({}, { replace: true })
            }}
          >
            Show all orders
          </button>
        )}
      </div>

      {loading && !data ? (
        <div className="admin-loading">
          <span className="spinner" aria-hidden="true" />
          Loading orders…
        </div>
      ) : error ? (
        <div className="admin-error">{error}</div>
      ) : orders.length === 0 ? (
        <div className="admin-empty">No orders found.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Products</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.number}>
                  <td className="admin-sku">{order.number}</td>
                  <td>{fmtDate(order.created_at)}</td>
                  <td>
                    <CustomerCell customer={order.customer} contact={order.contact} />
                  </td>
                  <td>
                    <ul className="order-items">
                      {order.items.map((item) => (
                        <li key={item.product_id}>
                          <Link to={`/admin/products/${item.product_id}`}>{item.product_name}</Link>
                          <span className="order-qty"> × {item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>{PAYMENT_LABELS[order.payment_method] || order.payment_method}</td>
                  <td>{formatMoney(order.total)}</td>
                  <td>
                    <span className={`status-pill order-${order.status}`}>
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
