import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import { EditIcon, EyeIcon, PlusIcon, TrashIcon } from '../../components/Icons.jsx'
import { useToast } from '../../context/useToast.js'
import {
  deleteProduct,
  getMeta,
  listProducts,
} from '../../lib/productsApi.js'

const PAGE_SIZE = 10

const SORTABLE = [
  { key: 'name', label: 'Product' },
  { key: 'brand', label: 'Brand' },
  { key: 'category', label: 'Category' },
  { key: 'sku', label: 'SKU' },
  { key: 'price', label: 'Price' },
  { key: 'stock_quantity', label: 'Stock' },
  { key: 'created_at', label: 'Created' },
]

function fmtPrice(value) {
  if (value === null || value === undefined || value === '') return '—'
  return `$${Number(value).toFixed(2)}`
}

function fmtDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function stockTier(product) {
  const qty = Number(product.stock_quantity) || 0
  const min = Number(product.min_stock_alert) || 0
  if (qty <= 0) return { label: 'Out of Stock', cls: 'oos' }
  if (min && qty <= min) return { label: 'Low Stock', cls: 'low' }
  return { label: 'In Stock', cls: 'in' }
}

function SortHeader({ col, sort, onSort }) {
  const active = sort && sort.replace('-', '') === col.key
  const dir = sort?.startsWith('-') ? 'desc' : 'asc'
  return (
    <th
      className={active ? 'sortable active' : 'sortable'}
      onClick={() => onSort(col.key)}
    >
      {col.label}
      {active && <span className="sort-arrow">{dir === 'asc' ? '↑' : '↓'}</span>}
    </th>
  )
}

export default function AdminProducts() {
  const navigate = useNavigate()
  const showToast = useToast()

  const [products, setProducts] = useState([])
  const [meta, setMeta] = useState({ categories: [], brands: [] })
  const [count, setCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [stockStatus, setStockStatus] = useState('')
  const [status, setStatus] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sort, setSort] = useState('-updated_at')

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    getMeta()
      .then((d) => setMeta(d))
      .catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    listProducts({
      page,
      page_size: PAGE_SIZE,
      search: debouncedSearch,
      category,
      brand,
      stock_status: stockStatus,
      status,
      min_price: minPrice,
      max_price: maxPrice,
      sort,
    })
      .then((d) => {
        if (cancelled) return
        setProducts(d.results || [])
        setCount(d.count || 0)
        setTotalPages(d.total_pages || 0)
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
  }, [page, debouncedSearch, category, brand, stockStatus, status, minPrice, maxPrice, sort])

  const handleSort = (key) => {
    setSort((prev) => {
      if (prev === key) return `-${key}`
      if (prev === `-${key}`) return key
      return key
    })
  }

  const resetFilters = () => {
    setSearch('')
    setDebouncedSearch('')
    setCategory('')
    setBrand('')
    setStockStatus('')
    setStatus('')
    setMinPrice('')
    setMaxPrice('')
    setSort('-updated_at')
    setPage(1)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteProduct(deleteTarget.id)
      showToast(`"${deleteTarget.name}" deleted`)
      setDeleteTarget(null)
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      if (products.length === 1 && page > 1) setPage((p) => p - 1)
      else setCount((c) => Math.max(0, c - 1))
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setDeleting(false)
    }
  }

  const hasFilters =
    debouncedSearch || category || brand || stockStatus || status || minPrice || maxPrice

  return (
    <div className="admin-products">
      <div className="admin-page-head">
        <div>
          <h1>Products</h1>
          <p>{loading ? 'Loading inventory…' : `${count} product${count === 1 ? '' : 's'} in inventory`}</p>
        </div>
        <Button onClick={() => navigate('/admin/products/new')}>
          <PlusIcon />
          <span>Add product</span>
        </Button>
      </div>

      <div className="admin-filters">
        <input
          className="admin-input admin-filter-search"
          type="search"
          placeholder="Search by name, brand or SKU…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
        <select
          className="admin-input"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value)
            setPage(1)
          }}
        >
          <option value="">All categories</option>
          {meta.categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className="admin-input"
          value={brand}
          onChange={(e) => {
            setBrand(e.target.value)
            setPage(1)
          }}
        >
          <option value="">All brands</option>
          {meta.brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <select
          className="admin-input"
          value={stockStatus}
          onChange={(e) => {
            setStockStatus(e.target.value)
            setPage(1)
          }}
        >
          <option value="">All stock</option>
          <option value="in_stock">In stock</option>
          <option value="low_stock">Low stock</option>
          <option value="out_of_stock">Out of stock</option>
        </select>
        <select
          className="admin-input"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <input
          className="admin-input admin-price"
          type="number"
          min="0"
          step="0.01"
          placeholder="Min price"
          value={minPrice}
          onChange={(e) => {
            setMinPrice(e.target.value)
            setPage(1)
          }}
        />
        <input
          className="admin-input admin-price"
          type="number"
          min="0"
          step="0.01"
          placeholder="Max price"
          value={maxPrice}
          onChange={(e) => {
            setMaxPrice(e.target.value)
            setPage(1)
          }}
        />
        {hasFilters && (
          <button type="button" className="admin-filter-clear" onClick={resetFilters}>
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="admin-loading">
          <span className="spinner" aria-hidden="true" />
          Loading products…
        </div>
      ) : error ? (
        <div className="admin-error">{error}</div>
      ) : products.length === 0 ? (
        <div className="admin-empty">
          <p>No products found.</p>
          {hasFilters && (
            <Button variant="ghost" onClick={resetFilters}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="th-img">Image</th>
                {SORTABLE.map((col) => (
                  <SortHeader key={col.key} col={col} sort={sort} onSort={handleSort} />
                ))}
                <th>Stock</th>
                <th>Status</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const tier = stockTier(p)
                return (
                  <tr key={p.id}>
                    <td>
                      <img
                        className="admin-thumb"
                        src={p.thumbnail || p.images?.[0] || ''}
                        alt=""
                        onError={(e) => {
                          e.currentTarget.style.visibility = 'hidden'
                        }}
                      />
                    </td>
                    <td className="admin-name">{p.name}</td>
                    <td>{p.brand_name}</td>
                    <td>{p.category_name}</td>
                    <td className="admin-sku">{p.sku}</td>
                    <td>{fmtPrice(p.price)}</td>
                    <td>{p.stock_quantity}</td>
                    <td>{fmtDate(p.created_at)}</td>
                    <td>
                      <span className={`stock-badge ${tier.cls}`}>{tier.label}</span>
                    </td>
                    <td>
                      <span className={`status-pill ${p.status}`}>{p.status}</span>
                    </td>
                    <td className="admin-actions">
                      <button
                        type="button"
                        className="icon-btn"
                        title="View"
                        onClick={() => navigate(`/admin/products/${p.id}`)}
                      >
                        <EyeIcon size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        title="Edit"
                        onClick={() => navigate(`/admin/products/${p.id}/edit`)}
                      >
                        <EditIcon size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn danger"
                        title="Delete"
                        onClick={() => setDeleteTarget(p)}
                      >
                        <TrashIcon size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="admin-pagination">
          <Button
            variant="ghost"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span>
            Page {page} of {totalPages}
          </span>
          <Button
            variant="ghost"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Are you sure you want to delete this product?"
        message={
          deleteTarget
            ? `"${deleteTarget.name}" will be permanently removed from your inventory.`
            : ''
        }
        confirmLabel="Delete"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
