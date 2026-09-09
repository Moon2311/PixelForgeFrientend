import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import { EyeIcon, PackageIcon, PlusIcon, SearchIcon } from '../../components/Icons.jsx'
import { useToast } from '../../context/useToast.js'
import { getMeta, listProducts, updateStock } from '../../lib/productsApi.js'

const PAGE_SIZE = 15

function stockTier(stock, threshold) {
  const qty = Number(stock) || 0
  const min = Number(threshold) || 0
  if (qty <= 0) return { label: 'Out of Stock', cls: 'oos' }
  if (min && qty <= min) return { label: 'Low Stock', cls: 'low' }
  return { label: 'In Stock', cls: 'in' }
}

function timeAgo(dateStr) {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

const REASONS = [
  'New Shipment',
  'Purchase Order',
  'Stock Correction',
  'Returned Item',
  'Damaged Stock Adjustment',
  'Initial Inventory',
  'Other',
]

function StatCard({ icon, value, label, color, loading }) {
  return (
    <div className="inv-stat-card">
      <div className={`inv-stat-icon inv-stat-${color}`}>
        {icon}
      </div>
      <div className="inv-stat-body">
        {loading ? (
          <div className="inv-skeleton inv-skeleton-lg" />
        ) : (
          <span className="inv-stat-value">{value}</span>
        )}
        <span className="inv-stat-label">{label}</span>
      </div>
    </div>
  )
}

function SkeletonTable({ rows = 5 }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>Current Stock</th>
            <th>Threshold</th>
            <th>Status</th>
            <th>Updated</th>
            <th className="th-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              <td><div className="inv-skeleton inv-skeleton-row" /></td>
              <td><div className="inv-skeleton inv-skeleton-sm" /></td>
              <td><div className="inv-skeleton inv-skeleton-sm" /></td>
              <td><div className="inv-skeleton inv-skeleton-sm" /></td>
              <td><div className="inv-skeleton inv-skeleton-badge" /></td>
              <td><div className="inv-skeleton inv-skeleton-sm" /></td>
              <td><div className="inv-skeleton inv-skeleton-sm" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function QuickUpdateInline({ product, onSave, onCancel }) {
  const [qty, setQty] = useState(String(product.stock_quantity ?? 0))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const val = Number(qty)
  const invalid = isNaN(val) || val < 0

  const handleSubmit = async () => {
    if (invalid) { setError('Enter a valid quantity (0 or more)'); return }
    setError('')
    setSaving(true)
    try {
      const updated = await updateStock(product.id, { stock_quantity: val, note: 'Quick stock update' })
      onSave(updated)
    } catch (err) {
      setError(err.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <tr className="inv-inline-edit">
      <td colSpan={7}>
        <div className="inv-inline-card">
          <div className="inv-inline-head">
            <span className="inv-inline-name">{product.name}</span>
            <span className="inv-inline-current">
              Current: <strong>{product.stock_quantity}</strong> units
            </span>
          </div>
          <div className="inv-inline-body">
            <div className="stock-stepper">
              <button type="button" onClick={() => setQty(String(Math.max(0, (Number(qty) || 0) - 1)))}>−</button>
              <input ref={inputRef} type="number" min="0" value={qty} onChange={(e) => setQty(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />
              <button type="button" onClick={() => setQty(String((Number(qty) || 0) + 1))}>+</button>
            </div>
            <div className="stock-quick">
              <Button variant="ghost" size="sm" onClick={() => setQty(String(Math.max(0, (Number(qty) || 0) - 10)))}>−10</Button>
              <Button variant="ghost" size="sm" onClick={() => setQty(String(Math.max(0, (Number(qty) || 0) - 1)))}>−1</Button>
              <Button variant="ghost" size="sm" onClick={() => setQty(String((Number(qty) || 0) + 1))}>+1</Button>
              <Button variant="ghost" size="sm" onClick={() => setQty(String((Number(qty) || 0) + 10))}>+10</Button>
            </div>
          </div>
          {error && <div className="field-error" style={{ marginTop: '0.4rem' }}>{error}</div>}
          <div className="inv-inline-actions">
            <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>Cancel</Button>
            <Button size="sm" loading={saving} onClick={handleSubmit}>Update Stock</Button>
          </div>
        </div>
      </td>
    </tr>
  )
}

function ProductSearchInput({ onSelect }) {
  const [term, setTerm] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [open, setOpen] = useState(false)
  const timerRef = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const search = useCallback((q) => {
    clearTimeout(timerRef.current)
    if (!q.trim()) { setResults([]); return }
    timerRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const d = await listProducts({ search: q, page_size: 8 })
        setResults(d.results || [])
        setOpen(true)
      } catch { setResults([]) }
      finally { setSearching(false) }
    }, 300)
  }, [])

  return (
    <div className="inv-product-search" ref={wrapRef}>
      <div className="admin-field">
        <label className="admin-label">Product <span className="required-star">*</span></label>
        <div className="inv-search-input-wrap">
          <SearchIcon size={16} />
          <input
            className="admin-input"
            type="search"
            placeholder="Search by name, SKU, or manufacturer part number…"
            value={term}
            onChange={(e) => { setTerm(e.target.value); search(e.target.value) }}
            onFocus={() => results.length > 0 && setOpen(true)}
          />
          {searching && <span className="spinner" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: 14, height: 14 }} />}
        </div>
      </div>
      {open && results.length > 0 && (
        <div className="inv-search-dropdown">
          {results.map((p) => (
            <button key={p.id} type="button" className="inv-search-item" onClick={() => { onSelect(p); setTerm(p.name); setOpen(false) }}>
              <img className="inv-search-thumb" src={p.thumbnail || p.images?.[0] || ''} alt="" onError={(e) => { e.currentTarget.style.display = 'none' }} />
              <div className="inv-search-info">
                <span className="inv-search-name">{p.name}</span>
                <span className="inv-search-meta">{p.sku || 'No SKU'}</span>
              </div>
              <span className={`stock-badge ${stockTier(p.stock_quantity, p.min_stock_alert).cls}`}>
                {stockTier(p.stock_quantity, p.min_stock_alert).label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminInventory() {
  const navigate = useNavigate()
  const showToast = useToast()

  const [products, setProducts] = useState([])
  const [meta, setMeta] = useState({ categories: [], brands: [] })
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [stats, setStats] = useState({ total: 0, inStock: 0, lowStock: 0, outOfStock: 0 })
  const [statsLoading, setStatsLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [category, setCategory] = useState('')
  const [stockStatus, setStockStatus] = useState('')
  const [sort, setSort] = useState('-updated_at')

  const [editingId, setEditingId] = useState(null)

  // Add Inventory modal
  const [addOpen, setAddOpen] = useState(false)
  const [addProduct, setAddProduct] = useState(null)
  const [addMode, setAddMode] = useState('add')
  const [addQty, setAddQty] = useState('')
  const [addReason, setAddReason] = useState('')
  const [addNote, setAddNote] = useState('')
  const [addSaving, setAddSaving] = useState(false)
  const [addError, setAddError] = useState('')

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  // Fetch meta
  useEffect(() => { getMeta().then(setMeta).catch(() => {}) }, [])

  // Fetch stats (all products, no pagination)
  useEffect(() => {
    let cancelled = false
    setStatsLoading(true)
    Promise.all([
      listProducts({ page_size: 1, stock_status: '' }),
      listProducts({ page_size: 1, stock_status: 'in_stock' }),
      listProducts({ page_size: 1, stock_status: 'low_stock' }),
      listProducts({ page_size: 1, stock_status: 'out_of_stock' }),
    ])
      .then(([all, ins, low, oos]) => {
        if (cancelled) return
        setStats({ total: all.count || 0, inStock: ins.count || 0, lowStock: low.count || 0, outOfStock: oos.count || 0 })
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setStatsLoading(false) })
    return () => { cancelled = true }
  }, [])

  // Fetch products
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    listProducts({
      page,
      page_size: PAGE_SIZE,
      search: debouncedSearch,
      category,
      stock_status: stockStatus,
      sort,
    })
      .then((d) => {
        if (cancelled) return
        setProducts(d.results || [])
        setTotalPages(d.total_pages || 0)
      })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [page, debouncedSearch, category, stockStatus, sort])

  const resetFilters = () => {
    setSearch(''); setDebouncedSearch(''); setCategory(''); setStockStatus(''); setSort('-updated_at'); setPage(1)
  }
  const hasFilters = debouncedSearch || category || stockStatus

  // Quick update handlers
  const handleQuickSave = (updated) => {
    setEditingId(null)
    setProducts((prev) => prev.map((p) => p.id === updated.id ? { ...p, ...updated } : p))
    showToast('Stock updated successfully')
  }

  // Add Inventory modal
  const openAddModal = () => { setAddOpen(true); setAddProduct(null); setAddMode('add'); setAddQty(''); setAddReason(''); setAddNote(''); setAddError('') }
  const closeAddModal = () => { setAddOpen(false); setAddProduct(null); setAddError('') }

  const computedNewStock = () => {
    if (!addProduct || !addQty) return null
    const current = Number(addProduct.stock_quantity) || 0
    const qty = Number(addQty)
    if (isNaN(qty) || qty < 0) return null
    return addMode === 'add' ? current + qty : qty
  }

  const handleAddSubmit = async () => {
    if (!addProduct) { setAddError('Please select a product'); return }
    const qty = Number(addQty)
    if (isNaN(qty) || qty < 0) { setAddError('Enter a valid quantity'); return }
    const payload = addMode === 'add'
      ? { delta: qty, note: addNote || addReason || 'Inventory added' }
      : { stock_quantity: qty, note: addNote || addReason || 'Stock set' }
    setAddSaving(true)
    setAddError('')
    try {
      const updated = await updateStock(addProduct.id, payload)
      setProducts((prev) => prev.map((p) => p.id === updated.id ? { ...p, ...updated } : p))
      showToast(`Inventory updated for "${addProduct.name}"`)
      closeAddModal()
    } catch (err) {
      setAddError(err.message || 'Unable to update inventory')
    } finally {
      setAddSaving(false)
    }
  }

  return (
    <div className="admin-inventory">
      {/* Header */}
      <div className="admin-page-head">
        <div>
          <h1>Inventory Management</h1>
          <p>Monitor stock levels, update inventory, and keep your products available.</p>
        </div>
        <div className="inv-head-actions">
          <Button onClick={openAddModal}>
            <PlusIcon />
            <span>Add Inventory</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="inv-stats-grid">
        <StatCard
          icon={<PackageIcon size={22} />}
          value={stats.total.toLocaleString()}
          label="Total Products"
          color="blue"
          loading={statsLoading}
        />
        <StatCard
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          }
          value={stats.inStock.toLocaleString()}
          label="In Stock"
          color="green"
          loading={statsLoading}
        />
        <StatCard
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          }
          value={stats.lowStock.toLocaleString()}
          label="Low Stock"
          color="yellow"
          loading={statsLoading}
        />
        <StatCard
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          }
          value={stats.outOfStock.toLocaleString()}
          label="Out of Stock"
          color="red"
          loading={statsLoading}
        />
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <input
          className="admin-input admin-filter-search"
          type="search"
          placeholder="Search products, SKU, manufacturer part number…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        />
        <select className="admin-input" value={stockStatus} onChange={(e) => { setStockStatus(e.target.value); setPage(1) }}>
          <option value="">All stock</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
        <select className="admin-input" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1) }}>
          <option value="">All categories</option>
          {(meta.categories || []).map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="admin-input" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1) }}>
          <option value="-updated_at">Recently Updated</option>
          <option value="name">Product Name A–Z</option>
          <option value="-name">Product Name Z–A</option>
          <option value="stock_quantity">Stock: Low to High</option>
          <option value="-stock_quantity">Stock: High to Low</option>
        </select>
        {hasFilters && (
          <button type="button" className="admin-filter-clear" onClick={resetFilters}>Clear Filters</button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <SkeletonTable />
      ) : error ? (
        <div className="admin-error">{error}</div>
      ) : products.length === 0 ? (
        <div className="admin-empty">
          <PackageIcon size={40} />
          <p style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '0.5rem' }}>No inventory found</p>
          <p style={{ color: 'var(--text-muted)' }}>
            {hasFilters ? 'Try changing your search or filters.' : 'Products matching your filters will appear here.'}
          </p>
          {hasFilters ? (
            <Button variant="ghost" onClick={resetFilters}>Clear Filters</Button>
          ) : (
            <Button variant="ghost" onClick={() => navigate('/admin/products')}>View Products</Button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="admin-table-wrap inv-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Current Stock</th>
                  <th>Threshold</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th className="th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  if (editingId === p.id) {
                    return <QuickUpdateInline key={p.id} product={p} onSave={handleQuickSave} onCancel={() => setEditingId(null)} />
                  }
                  const tier = stockTier(p.stock_quantity, p.min_stock_alert)
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="inv-product-cell">
                          <img
                            className="admin-thumb"
                            src={p.thumbnail || p.images?.[0] || ''}
                            alt=""
                            onError={(e) => { e.currentTarget.style.visibility = 'hidden' }}
                          />
                          <span className="admin-name">{p.name}</span>
                        </div>
                      </td>
                      <td className="admin-sku">{p.sku || '—'}</td>
                      <td>
                        <span className="inv-stock-qty">{p.stock_quantity ?? 0} units</span>
                      </td>
                      <td>{p.min_stock_alert ?? 0}</td>
                      <td>
                        <span className={`stock-badge ${tier.cls}`}>{tier.label}</span>
                      </td>
                      <td>{timeAgo(p.updated_at)}</td>
                      <td className="admin-actions">
                        <button type="button" className="icon-btn" title="Update Stock" onClick={() => setEditingId(p.id)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="1 4 1 10 7 10" />
                            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                          </svg>
                        </button>
                        <button type="button" className="icon-btn" title="View Product" onClick={() => navigate(`/admin/products/${p.id}`)}>
                          <EyeIcon size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="inv-mobile-cards">
            {products.map((p) => {
              const tier = stockTier(p.stock_quantity, p.min_stock_alert)
              return (
                <div key={p.id} className="inv-mobile-card">
                  <div className="inv-mobile-card-head">
                    <img className="admin-thumb" src={p.thumbnail || p.images?.[0] || ''} alt="" onError={(e) => { e.currentTarget.style.visibility = 'hidden' }} />
                    <div className="inv-mobile-card-info">
                      <span className="admin-name">{p.name}</span>
                      <span className="admin-sku">{p.sku || '—'}</span>
                    </div>
                    <span className={`stock-badge ${tier.cls}`}>{tier.label}</span>
                  </div>
                  <div className="inv-mobile-card-body">
                    <div className="inv-mobile-stat">
                      <span className="inv-mobile-stat-label">Stock</span>
                      <span className="inv-mobile-stat-value">{p.stock_quantity ?? 0}</span>
                    </div>
                    <div className="inv-mobile-stat">
                      <span className="inv-mobile-stat-label">Threshold</span>
                      <span className="inv-mobile-stat-value">{p.min_stock_alert ?? 0}</span>
                    </div>
                    <div className="inv-mobile-stat">
                      <span className="inv-mobile-stat-label">Updated</span>
                      <span className="inv-mobile-stat-value">{timeAgo(p.updated_at)}</span>
                    </div>
                  </div>
                  <div className="inv-mobile-card-actions">
                    <Button size="sm" onClick={() => setEditingId(p.id)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                      </svg>
                      Update
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/products/${p.id}`)}>
                      <EyeIcon size={14} />
                      View
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </Button>
          <span>Page {page} of {totalPages}</span>
          <Button variant="ghost" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            Next
          </Button>
        </div>
      )}

      {/* Add Inventory Modal */}
      {addOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) closeAddModal() }}>
          <div className="modal inv-add-modal">
            <div className="inv-modal-head">
              <div className="inv-modal-icon">
                <PlusIcon size={24} />
              </div>
              <div>
                <h3>Add Inventory</h3>
                <p>Increase or update the stock quantity for a product.</p>
              </div>
            </div>

            <ProductSearchInput onSelect={(p) => { setAddProduct(p); setAddQty(''); setAddError('') }} />

            {addProduct && (
              <div className="inv-add-product-info">
                <img className="inv-add-thumb" src={addProduct.thumbnail || addProduct.images?.[0] || ''} alt="" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                <div className="inv-add-detail">
                  <span className="inv-add-name">{addProduct.name}</span>
                  <span className="admin-sku">{addProduct.sku || 'No SKU'}</span>
                  <span className="inv-add-stock">
                    Current Stock: <strong>{addProduct.stock_quantity ?? 0} units</strong>
                    <span className={`stock-badge ${stockTier(addProduct.stock_quantity, addProduct.min_stock_alert).cls}`} style={{ marginLeft: '0.5rem' }}>
                      {stockTier(addProduct.stock_quantity, addProduct.min_stock_alert).label}
                    </span>
                  </span>
                </div>
              </div>
            )}

            <div className="admin-field">
              <label className="admin-label">Inventory Action</label>
              <div className="inv-action-toggle">
                <button type="button" className={`inv-action-btn${addMode === 'add' ? ' active' : ''}`} onClick={() => setAddMode('add')}>Add Stock</button>
                <button type="button" className={`inv-action-btn${addMode === 'set' ? ' active' : ''}`} onClick={() => setAddMode('set')}>Set Stock</button>
              </div>
            </div>

            <div className="admin-field">
              <label className="admin-label">
                {addMode === 'add' ? 'Quantity to Add' : 'New Stock Quantity'}
                <span className="required-star">*</span>
              </label>
              <div className="stock-stepper">
                <button type="button" onClick={() => setAddQty(String(Math.max(0, (Number(addQty) || 0) - 1)))}>−</button>
                <input type="number" min="0" value={addQty} onChange={(e) => setAddQty(e.target.value)} placeholder="0" />
                <button type="button" onClick={() => setAddQty(String((Number(addQty) || 0) + 1))}>+</button>
              </div>
            </div>

            <div className="admin-field">
              <label className="admin-label">Reason</label>
              <select className="admin-input" value={addReason} onChange={(e) => setAddReason(e.target.value)}>
                <option value="">Select a reason…</option>
                {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="admin-field">
              <label className="admin-label">Notes</label>
              <textarea className="admin-input admin-textarea" placeholder="Enter additional notes…" value={addNote} onChange={(e) => setAddNote(e.target.value)} rows={2} />
            </div>

            {addProduct && addQty && computedNewStock() !== null && (
              <div className="inv-confirm-summary">
                <div className="inv-confirm-row">
                  <span>Current Stock</span>
                  <strong>{addProduct.stock_quantity ?? 0}</strong>
                </div>
                <div className="inv-confirm-row">
                  <span>{addMode === 'add' ? 'Adjustment' : 'New Stock'}</span>
                  <strong className={addMode === 'add' ? 'text-ok' : ''}>
                    {addMode === 'add' ? `+${Number(addQty)}` : computedNewStock()}
                  </strong>
                </div>
                <div className="inv-confirm-row inv-confirm-total">
                  <span>New Stock</span>
                  <strong>{computedNewStock()}</strong>
                </div>
              </div>
            )}

            {addError && <div className="field-error" style={{ marginBottom: '0.75rem' }}>{addError}</div>}

            <div className="modal-actions" style={{ marginTop: '1rem' }}>
              <Button variant="ghost" onClick={closeAddModal} disabled={addSaving}>Cancel</Button>
              <Button loading={addSaving} onClick={handleAddSubmit}>Update Inventory</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
