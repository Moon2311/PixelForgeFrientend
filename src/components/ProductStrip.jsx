import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listProducts } from '../lib/productsApi.js'
import { Price, Stars } from './ProductBits.jsx'
import { discountPercent } from '../lib/format.js'

// Horizontally scrolling row of products. `params` filter/sort the API list;
// only the first `limit` products are fetched.
export default function ProductStrip({ title, params, limit = 12 }) {
  const [products, setProducts] = useState(null)

  useEffect(() => {
    let cancelled = false
    listProducts({ ...params, page_size: limit })
      .then((data) => {
        if (!cancelled) setProducts(data?.results || [])
      })
      .catch(() => {
        if (!cancelled) setProducts([])
      })
    return () => {
      cancelled = true
    }
  }, [params, limit])

  const items = products

  // Hide the whole section when the API is unavailable or nothing matches.
  if (items && items.length === 0) return null

  return (
    <section className="bg-pf-card p-5 shadow-sm">
      <div className="flex items-baseline gap-4 mb-3">
        <h2 className="text-xl font-bold text-pf-text">{title}</h2>
        <Link to="/products" className="text-sm text-pf-link hover:text-pf-link-hover hover:underline">
          See all
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1 snap-x">
        {items
          ? items.map((product) => <StripItem key={product.id} product={product} />)
          : Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="w-40 sm:w-48 shrink-0 animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="h-3 w-2/3 bg-gray-200 rounded mt-3" />
              </div>
            ))}
      </div>
    </section>
  )
}

function StripItem({ product }) {
  const discount = discountPercent(product)
  const image = product.images?.[0] || product.thumbnail
  return (
    <Link
      to="/products"
      className="group w-40 sm:w-48 shrink-0 snap-start text-pf-text hover:text-pf-text"
    >
      <div className="aspect-square bg-gray-50 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-pf-text-light">No image</div>
        )}
      </div>
      {discount > 0 && (
        <div className="flex items-center gap-2 mt-2">
          <span className="bg-pf-deal-red text-white text-xs font-bold px-1.5 py-0.5 rounded-sm">
            {discount}% off
          </span>
          <span className="text-xs font-bold text-pf-deal-red">Deal</span>
        </div>
      )}
      <Price value={product.discount_price || product.price} className="text-sm mt-1" />
      <p className="text-sm leading-snug line-clamp-2 mt-0.5 group-hover:text-pf-link-hover">
        {product.name}
      </p>
      {product.rating != null && <Stars rating={product.rating} size={13} />}
    </Link>
  )
}
