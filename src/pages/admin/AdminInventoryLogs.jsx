import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getInventoryLogs } from '../../lib/productsApi.js'

function fmtDate(value) {
  return value ? new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) : '—'
}

const ACTIONS = [
  { value: '', label: 'All actions' },
  { value: 'create', label: 'Created' },
  { value: 'update', label: 'Updated' },
  { value: 'delete', label: 'Deleted' },
  { value: 'increase', label: 'Stock increased' },
  { value: 'decrease', label: 'Stock decreased' },
  { value: 'set', label: 'Stock set' },
]

export default function AdminInventoryLogs() {
  const [logs, setLogs] = useState([])
  const [action, setAction] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    getInventoryLogs({ action })
      .then((d) => {
        if (!cancelled) setLogs(d || [])
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
  }, [action])

  return (
    <div className="admin-logs">
      <div className="admin-page-head">
        <div>
          <h1>Inventory movement logs</h1>
          <p>Every create, update, delete and stock change.</p>
        </div>
        <select
          className="admin-input"
          style={{ width: 'auto' }}
          value={action}
          onChange={(e) => setAction(e.target.value)}
        >
          {ACTIONS.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="admin-loading">
          <span className="spinner" aria-hidden="true" />
          Loading logs…
        </div>
      ) : error ? (
        <div className="admin-error">{error}</div>
      ) : logs.length === 0 ? (
        <div className="admin-empty">No inventory movements recorded yet.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Action</th>
                <th>Before</th>
                <th>After</th>
                <th>Change</th>
                <th>Actor</th>
                <th>Note</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="admin-name">
                    <Link to={`/admin/products/${log.product_id}`}>{log.product_name || `#${log.product_id}`}</Link>
                  </td>
                  <td className="admin-sku">{log.sku}</td>
                  <td>
                    <span className={`history-action ${log.action}`}>{log.action_label}</span>
                  </td>
                  <td>{log.quantity_before}</td>
                  <td>{log.quantity_after}</td>
                  <td>
                    <span className={log.quantity_change > 0 ? 'qty-up' : log.quantity_change < 0 ? 'qty-down' : ''}>
                      {log.quantity_change > 0 ? `+${log.quantity_change}` : log.quantity_change}
                    </span>
                  </td>
                  <td>{log.actor || '—'}</td>
                  <td>{log.note || '—'}</td>
                  <td>{fmtDate(log.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
