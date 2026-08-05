import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import { BackIcon, EditIcon } from '../../components/Icons.jsx'
import { useToast } from '../../context/useToast.js'
import { getProduct, getStockHistory, updateStock } from '../../lib/productsApi.js'

function fmtMoney(value) {
  if (value === null || value === undefined || value === '') return '—'
  return `$${Number(value).toFixed(2)}`
}

function fmtDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const showToast = useToast()

  const [product, setProduct] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [galleryIndex, setGalleryIndex] = useState(0)

  const [qty, setQty] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoading(true)
      try {
        const [p, h] = await Promise.all([getProduct(id), getStockHistory(id)])
        setProduct(p)
        setHistory(h || [])
        setQty(String(p.stock_quantity ?? 0))
        setError('')
      } catch (err) {
        setError(err.message)
      } finally {
        if (showLoading) setLoading(false)
      }
    },
    [id],
  )

  useEffect(() => {
    load()
  }, [load])

  const applyStock = async (newQty, reason) => {
    const next = Math.max(0, Number(newQty))
    const prevQty = product.stock_quantity
    setSaving(true)
    try {
      setProduct((prev) => ({ ...prev, stock_quantity: next }))
      const updated = await updateStock(id, {
        stock_quantity: next,
        note: reason || note,
      })
      setProduct(updated)
      showToast('Stock updated successfully')
      setNote('')
      await load(false)
    } catch (err) {
      setProduct((prev) => ({ ...prev, stock_quantity: prevQty }))
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const applyDelta = (delta) => {
    const next = Math.max(0, (Number(product.stock_quantity) || 0) + delta)
    setQty(String(next))
    applyStock(next, `${delta > 0 ? 'Increase' : 'Decrease'} by ${Math.abs(delta)}`)
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <span className="spinner" aria-hidden="true" />
        Loading product…
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="admin-error">
        {error || 'Product not found.'}
        <div style={{ marginTop: '1rem' }}>
          <Button variant="ghost" onClick={() => navigate('/admin/products')}>
            Back to products
          </Button>
        </div>
      </div>
    )
  }

  const images = product.images?.length ? product.images : product.thumbnail ? [product.thumbnail] : []
  const qtyNum = Number(product.stock_quantity) || 0
  const minAlert = Number(product.min_stock_alert) || 0

  return (
    <div className="admin-product-detail">
      <div className="admin-page-head">
        <div>
          <button type="button" className="admin-back" onClick={() => navigate('/admin/products')}>
            <BackIcon size={16} />
            <span>Back to products</span>
          </button>
          <h1>{product.name}</h1>
          <p>
            <span className={`status-pill ${product.status}`}>{product.status}</span>
            {product.is_featured && <span className="featured-pill">Featured</span>}
          </p>
        </div>
        <Button onClick={() => navigate(`/admin/products/${product.id}/edit`)}>
          <EditIcon size={16} />
          <span>Edit product</span>
        </Button>
      </div>

      <div className="admin-detail-grid">
        <section className="admin-card">
          <h2 className="admin-section-title">Images</h2>
          {images.length > 0 ? (
            <>
              <div className="detail-gallery">
                <img src={images[galleryIndex]} alt={product.name} />
              </div>
              {images.length > 1 && (
                <div className="detail-thumbs">
                  {images.map((src, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`detail-thumb${i === galleryIndex ? ' active' : ''}`}
                      onClick={() => setGalleryIndex(i)}
                    >
                      <img src={src} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="detail-empty">No images uploaded.</p>
          )}

          <h2 className="admin-section-title">Inventory</h2>
          <div className="stock-stat-row">
            <div className="stock-stat">
              <span className="stock-stat-value">{product.stock_quantity}</span>
              <span className="stock-stat-label">Units in stock</span>
            </div>
            <div className="stock-stat">
              <span className="stock-stat-value">{minAlert}</span>
              <span className="stock-stat-label">Low stock threshold</span>
            </div>
            <div className="stock-stat">
              <span
                className={`stock-stat-value ${qtyNum === 0 ? 'text-danger' : qtyNum <= minAlert ? 'text-warn' : 'text-ok'}`}
              >
                {qtyNum === 0 ? 'Out of stock' : qtyNum <= minAlert ? 'Low stock' : 'In stock'}
              </span>
              <span className="stock-stat-label">Status</span>
            </div>
          </div>

          <div className="stock-adjust">
            <label className="admin-label">Adjust stock</label>
            <div className="stock-adjust-row">
              <div className="stock-stepper">
                <button type="button" onClick={() => setQty(String(Math.max(0, (Number(qty) || 0) - 1)))}>
                  −
                </button>
                <input
                  type="number"
                  min="0"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                />
                <button type="button" onClick={() => setQty(String((Number(qty) || 0) + 1))}>
                  +
                </button>
              </div>
              <Button loading={saving} onClick={() => applyStock(qty)}>
                Set stock
              </Button>
            </div>
            <div className="stock-quick">
              <Button variant="ghost" size="sm" onClick={() => applyDelta(1)}>
                +1
              </Button>
              <Button variant="ghost" size="sm" onClick={() => applyDelta(10)}>
                +10
              </Button>
              <Button variant="ghost" size="sm" onClick={() => applyDelta(-1)}>
                −1
              </Button>
              <Button variant="ghost" size="sm" onClick={() => applyDelta(-10)}>
                −10
              </Button>
            </div>
            <input
              className="admin-input"
              placeholder="Note for this adjustment (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <h2 className="admin-section-title">Stock history</h2>
          {history.length === 0 ? (
            <p className="detail-empty">No stock movements recorded.</p>
          ) : (
            <div className="history-list">
              {history.slice(0, 12).map((h) => (
                <div className="history-item" key={h.id}>
                  <div className="history-main">
                    <span className={`history-action ${h.action}`}>{h.action_label}</span>
                    <span className="history-qty">
                      {h.quantity_before} → {h.quantity_after}
                      {h.quantity_change !== 0 && (
                        <span className={h.quantity_change > 0 ? 'qty-up' : 'qty-down'}>
                          {h.quantity_change > 0 ? ` +${h.quantity_change}` : ` ${h.quantity_change}`}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="history-meta">
                    {h.note && <span className="history-note">“{h.note}”</span>}
                    <span>{h.actor || 'admin'}</span>
                    <span>{fmtDate(h.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="admin-card">
          <h2 className="admin-section-title">Details</h2>
          <dl className="detail-list">
            <div><dt>SKU</dt><dd>{product.sku || '—'}</dd></div>
            <div><dt>Brand</dt><dd>{product.brand_name || '—'}</dd></div>
            <div><dt>Category</dt><dd>{product.category_name || '—'}</dd></div>
            <div><dt>Price</dt><dd>{fmtMoney(product.price)}</dd></div>
            <div><dt>Discount price</dt><dd>{fmtMoney(product.discount_price)}</dd></div>
            <div><dt>Cost price</dt><dd>{fmtMoney(product.cost_price)}</dd></div>
            <div><dt>Color</dt><dd>{product.color || '—'}</dd></div>
            <div><dt>Size / variant</dt><dd>{product.size || '—'}</dd></div>
            <div><dt>Weight</dt><dd>{product.weight ? `${product.weight} kg` : '—'}</dd></div>
            <div><dt>Tags</dt><dd>{Array.isArray(product.tags) ? product.tags.join(', ') : product.tags || '—'}</dd></div>
            <div><dt>Created</dt><dd>{fmtDate(product.created_at)}</dd></div>
            <div><dt>Last updated</dt><dd>{fmtDate(product.updated_at)}</dd></div>
          </dl>

          <h2 className="admin-section-title">Description</h2>
          <p className="detail-text">{product.short_description || '—'}</p>
          <p className="detail-text detail-long">{product.description || '—'}</p>

          <h2 className="admin-section-title">Specifications</h2>
          <p className="detail-text detail-long">{product.specifications || '—'}</p>
        </section>
      </div>
    </div>
  )
}
