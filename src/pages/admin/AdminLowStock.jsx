import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import { useToast } from '../../context/useToast.js'
import { getLowStockAlerts, resolveLowStockAlert } from '../../lib/productsApi.js'

function fmtDate(value) {
  return value ? new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) : '—'
}

export default function AdminLowStock() {
  const showToast = useToast()
  const [alerts, setAlerts] = useState([])
  const [showAll, setShowAll] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    getLowStockAlerts(showAll ? { all: 1 } : {})
      .then((d) => {
        if (!cancelled) setAlerts(d || [])
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
  }, [showAll])

  const handleResolve = async (alert) => {
    try {
      await resolveLowStockAlert(alert.id)
      setAlerts((prev) => prev.map((a) => (a.id === alert.id ? { ...a, resolved: true } : a)))
      showToast(`Alert for "${alert.product_name}" resolved`)
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  return (
    <div className="admin-low-stock">
      <div className="admin-page-head">
        <div>
          <h1>Low stock alerts</h1>
          <p>Products at or below their minimum stock threshold.</p>
        </div>
        <label className="admin-checkbox">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
          <span>Show resolved</span>
        </label>
      </div>

      {loading ? (
        <div className="admin-loading">
          <span className="spinner" aria-hidden="true" />
          Loading alerts…
        </div>
      ) : error ? (
        <div className="admin-error">{error}</div>
      ) : alerts.length === 0 ? (
        <div className="admin-empty">No low stock alerts — your inventory is healthy.</div>
      ) : (
        <div className="alert-grid">
          {alerts.map((a) => (
            <div className={`alert-card${a.resolved ? ' resolved' : ''}`} key={a.id}>
              <div className="alert-head">
                <Link to={`/admin/products/${a.product_id}`} className="alert-name">
                  {a.product_name || `#${a.product_id}`}
                </Link>
                <span className={`stock-badge ${a.resolved ? 'in' : 'low'}`}>
                  {a.resolved ? 'Resolved' : 'Low stock'}
                </span>
              </div>
              <div className="alert-meta">
                <span>SKU: {a.sku || '—'}</span>
                <span>
                  {a.quantity} ≤ {a.min_stock_alert} threshold
                </span>
                <span>Created {fmtDate(a.created_at)}</span>
              </div>
              {!a.resolved && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleResolve(a)}
                >
                  Mark resolved
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
