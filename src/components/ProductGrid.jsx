import { useEffect, useState } from 'react'
import ProductCard from './ProductCard.jsx'
import { useSearch } from '../context/useSearch.js'
import { getProductsApiBaseUrl } from '../lib/api.js'
import '../styles/products.css'

function buildUrl(baseUrl, term) {
  if (!term) return `${baseUrl}/api/products/`
  const params = new URLSearchParams({
    name: term,
    brand: term,
    specification: term,
  })
  return `${baseUrl}/api/products/?${params.toString()}`
}

export default function ProductGrid() {
  const { term } = useSearch()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const baseUrl = getProductsApiBaseUrl()

    setLoading(true)
    setError('')

    fetch(buildUrl(baseUrl, term), { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        if (!controller.signal.aborted) setProducts(data?.data?.results || [])
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setError(
          `Could not reach the products API at ${baseUrl}. Check that the product-service is running on port 8002.`,
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [term])

  if (loading) {
    return (
      <p className="products-status products-loading">
        <span className="spinner" aria-hidden="true" />
        {term ? `Searching for “${term}”…` : 'Loading products…'}
      </p>
    )
  }

  if (error) return <p className="products-status products-error">{error}</p>

  if (products.length === 0) {
    return (
      <p className="products-status">
        {term ? `No products found for “${term}”.` : 'No products found.'}
      </p>
    )
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
