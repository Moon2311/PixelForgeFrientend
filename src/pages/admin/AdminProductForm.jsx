import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import ImageUploader from '../../components/ImageUploader.jsx'
import { BackIcon } from '../../components/Icons.jsx'
import { useToast } from '../../context/useToast.js'
import {
  createProduct,
  getMeta,
  getProduct,
  updateProduct,
} from '../../lib/productsApi.js'

const EMPTY = {
  name: '',
  brand_name: '',
  category_name: '',
  sku: '',
  short_description: '',
  description: '',
  specifications: '',
  price: '',
  discount_price: '',
  cost_price: '',
  stock_quantity: '0',
  min_stock_alert: '0',
  weight: '',
  status: 'active',
  is_featured: false,
  color: '',
  size: '',
  tags: '',
}

function validate(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Product name is required'
  if (!form.brand_name.trim()) errors.brand_name = 'Brand is required'
  if (!form.category_name.trim()) errors.category_name = 'Category is required'
  if (!form.sku.trim()) errors.sku = 'SKU is required'
  if (form.price === '' || form.price === null || Number(form.price) <= 0) {
    errors.price = 'Price must be greater than zero'
  }
  if (Number(form.stock_quantity) < 0) errors.stock_quantity = 'Stock cannot be negative'
  if (Number(form.min_stock_alert) < 0) errors.min_stock_alert = 'Minimum stock alert cannot be negative'
  if (form.discount_price !== '' && Number(form.discount_price) < 0) {
    errors.discount_price = 'Discount price cannot be negative'
  }
  if (form.cost_price !== '' && Number(form.cost_price) < 0) {
    errors.cost_price = 'Cost price cannot be negative'
  }
  return errors
}

function Field({ label, required, error, children, hint }) {
  return (
    <div className={`admin-field${error ? ' has-error' : ''}`}>
      <label className="admin-label">
        {label}
        {required && <span className="required-star">*</span>}
      </label>
      {children}
      {error && <div className="field-error">{error}</div>}
      {hint && !error && <p className="field-hint">{hint}</p>}
    </div>
  )
}

export default function AdminProductForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const showToast = useToast()

  const [form, setForm] = useState(EMPTY)
  const [images, setImages] = useState([])
  const [meta, setMeta] = useState({ categories: [], brands: [] })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getMeta()
      .then((d) => setMeta(d))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!isEdit) return
    let cancelled = false
    getProduct(id)
      .then((p) => {
        if (cancelled) return
        setForm({
          name: p.name || '',
          brand_name: p.brand_name || '',
          category_name: p.category_name || '',
          sku: p.sku || '',
          short_description: p.short_description || '',
          description: p.description || '',
          specifications: p.specifications || '',
          price: p.price ?? '',
          discount_price: p.discount_price ?? '',
          cost_price: p.cost_price ?? '',
          stock_quantity: p.stock_quantity ?? 0,
          min_stock_alert: p.min_stock_alert ?? 0,
          weight: p.weight ?? '',
          status: p.status || 'active',
          is_featured: Boolean(p.is_featured),
          color: p.color || '',
          size: p.size || '',
          tags: Array.isArray(p.tags) ? p.tags.join(', ') : p.tags || '',
        })
        setImages(p.images || (p.thumbnail ? [p.thumbnail] : []))
      })
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id, isEdit, showToast])

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => (prev[key] ? { ...prev, [key]: '' } : prev))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const next = validate(form)
    setErrors(next)
    if (Object.keys(next).length > 0) return

    const fd = new FormData()
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'is_featured') return
      if (value === '' || value === null || value === undefined) return
      fd.append(key, value)
    })
    fd.append('is_featured', form.is_featured ? 'true' : 'false')
    images.forEach((img) => fd.append('images', typeof img === 'string' ? img : img))

    setSaving(true)
    try {
      if (isEdit) {
        await updateProduct(id, fd)
        showToast('Product updated successfully')
      } else {
        await createProduct(fd)
        showToast('Product created successfully')
      }
      navigate('/admin/products')
    } catch (err) {
      if (err.data && typeof err.data === 'object') {
        setErrors(err.data)
      }
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <span className="spinner" aria-hidden="true" />
        Loading product…
      </div>
    )
  }

  return (
    <div className="admin-form-page">
      <div className="admin-page-head">
        <div>
          <button type="button" className="admin-back" onClick={() => navigate('/admin/products')}>
            <BackIcon size={16} />
            <span>Back to products</span>
          </button>
          <h1>{isEdit ? `Edit "${form.name || 'product'}"` : 'Add product'}</h1>
          <p>{isEdit ? 'Update the product details below.' : 'Fill in the details to create a new product.'}</p>
        </div>
      </div>

      <form className="admin-form" onSubmit={handleSubmit} noValidate>
        <div className="admin-form-grid">
          <Field label="Product name" required error={errors.name}>
            <input
              className="admin-input"
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. iPhone 15 Pro"
            />
          </Field>
          <Field label="SKU" required error={errors.sku}>
            <input
              className="admin-input"
              value={form.sku}
              onChange={set('sku')}
              placeholder="e.g. IPH15P-256-BLK"
            />
          </Field>
          <Field label="Brand" required error={errors.brand_name}>
            <input
              className="admin-input"
              value={form.brand_name}
              onChange={set('brand_name')}
              list="brand-options"
              placeholder="e.g. Apple"
            />
            <datalist id="brand-options">
              {meta.brands.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </Field>
          <Field label="Category" required error={errors.category_name}>
            <input
              className="admin-input"
              value={form.category_name}
              onChange={set('category_name')}
              list="category-options"
              placeholder="e.g. Smartphones"
            />
            <datalist id="category-options">
              {meta.categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field label="Price ($)" required error={errors.price}>
            <input
              className="admin-input"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={set('price')}
              placeholder="0.00"
            />
          </Field>
          <Field label="Discount price ($)" error={errors.discount_price}>
            <input
              className="admin-input"
              type="number"
              min="0"
              step="0.01"
              value={form.discount_price}
              onChange={set('discount_price')}
              placeholder="Optional"
            />
          </Field>
          <Field label="Cost price ($)" error={errors.cost_price}>
            <input
              className="admin-input"
              type="number"
              min="0"
              step="0.01"
              value={form.cost_price}
              onChange={set('cost_price')}
              placeholder="Optional"
            />
          </Field>
          <Field label="Weight (kg)" error={errors.weight}>
            <input
              className="admin-input"
              type="number"
              min="0"
              step="0.001"
              value={form.weight}
              onChange={set('weight')}
              placeholder="Optional"
            />
          </Field>
          <Field label="Stock quantity" error={errors.stock_quantity}>
            <input
              className="admin-input"
              type="number"
              min="0"
              step="1"
              value={form.stock_quantity}
              onChange={set('stock_quantity')}
            />
          </Field>
          <Field label="Minimum stock alert" error={errors.min_stock_alert} hint="Alerts are triggered when stock drops to this level.">
            <input
              className="admin-input"
              type="number"
              min="0"
              step="1"
              value={form.min_stock_alert}
              onChange={set('min_stock_alert')}
            />
          </Field>
          <Field label="Status">
            <select className="admin-input" value={form.status} onChange={set('status')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>
          <Field label="Featured product">
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={set('is_featured')}
              />
              <span>Show as featured</span>
            </label>
          </Field>
          <Field label="Color">
            <input className="admin-input" value={form.color} onChange={set('color')} placeholder="e.g. Black" />
          </Field>
          <Field label="Size / variant">
            <input className="admin-input" value={form.size} onChange={set('size')} placeholder="e.g. 256GB" />
          </Field>
          <Field label="Tags" hint="Comma-separated, e.g. smartphone, 5G">
            <input className="admin-input" value={form.tags} onChange={set('tags')} placeholder="smartphone, 5G" />
          </Field>
          <Field label="Short description">
            <input
              className="admin-input"
              value={form.short_description}
              onChange={set('short_description')}
              placeholder="One-line summary shown on product cards"
            />
          </Field>
          <Field label="Specifications">
            <textarea
              className="admin-input admin-textarea"
              rows={4}
              value={form.specifications}
              onChange={set('specifications')}
              placeholder="Chip, camera, display, connectivity…"
            />
          </Field>
          <Field label="Description">
            <textarea
              className="admin-input admin-textarea"
              rows={5}
              value={form.description}
              onChange={set('description')}
              placeholder="Full product description"
            />
          </Field>
        </div>

        <div className="admin-field">
          <label className="admin-label">Product images</label>
          <ImageUploader
            images={images}
            onChange={setImages}
            error={errors.images}
          />
        </div>

        <div className="admin-form-actions">
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/products')}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {isEdit ? 'Save changes' : 'Create product'}
          </Button>
        </div>
      </form>
    </div>
  )
}
