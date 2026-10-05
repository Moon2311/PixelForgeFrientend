import { useEffect, useState } from 'react'
import ProductCard from './ProductCard.jsx'
import { useSearch } from '../context/useSearch.js'
import { getApiBaseUrl } from '../lib/api.js'

const GRID = 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4'
const PAGE_SIZE = 20
const PAGE_BUTTON =
  'h-9 px-4 rounded-md border border-gray-300 bg-white text-sm text-pf-text hover:bg-gray-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50'

function buildUrl(baseUrl, term, page) {
  const params = new URLSearchParams({ page, page_size: PAGE_SIZE })
  if (term) {
    params.set('name', term)
    params.set('brand', term)
    params.set('specification', term)
  }
  return `${baseUrl}/api/products/?${params.toString()}`
}

export default function ProductGrid() {
  const { term, clearSearch } = useSearch()
  const [products, setProducts] = useState([])
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // A new search starts again from the first page.
  const [searchedTerm, setSearchedTerm] = useState(term)
  if (term !== searchedTerm) {
    setSearchedTerm(term)
    setPage(1)
  }

  useEffect(() => {
    const controller = new AbortController()
    const baseUrl = getApiBaseUrl()

    setLoading(true)
    setError('')

    fetch(buildUrl(baseUrl, term, page), { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        if (controller.signal.aborted) return
        setProducts(data?.data?.results || [])
        setCount(data?.data?.count || 0)
        setTotalPages(data?.data?.total_pages || 0)
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setError(
          `Could not reach the products API at ${baseUrl}. Check that the PixelForge backend is running on port 8000.`,
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [term, page])

  const goToPage = (next) => {
    setPage(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className={GRID} aria-busy="true" aria-label={term ? `Searching for ${term}` : 'Loading products'}>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-3 w-1/3 bg-gray-200 rounded" />
              <div className="h-4 w-4/5 bg-gray-200 rounded" />
              <div className="h-4 w-1/2 bg-gray-200 rounded" />
              <div className="h-8 w-full bg-gray-200 rounded-full mt-4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-lg p-6 text-sm">
        <p className="font-bold text-pf-deal-red mb-1">We couldn’t load products</p>
        <p className="text-pf-text-light">{error}</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm">
        <p className="text-pf-text">
          {count} result{count !== 1 ? 's' : ''}
          {term && (
            <>
              {' '}for <span className="font-bold text-pf-link-hover">“{term}”</span>
            </>
          )}
        </p>
        {term && (
          <button
            type="button"
            onClick={clearSearch}
            className="text-pf-link hover:text-pf-link-hover hover:underline cursor-pointer"
          >
            Clear search
          </button>
        )}
      </div>

      {products.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
          <h2 className="text-lg font-bold text-pf-text mb-1">No results found</h2>
          <p className="text-sm text-pf-text-light">
            Try checking your spelling or using more general terms.
          </p>
        </div>
      ) : (
        <div className={GRID}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-6 flex items-center justify-center gap-3 text-sm">
          <button type="button" className={PAGE_BUTTON} disabled={page <= 1} onClick={() => goToPage(page - 1)}>
            Previous
          </button>
          <span className="text-pf-text-light">
            Page {page} of {totalPages}
          </span>
          <button type="button" className={PAGE_BUTTON} disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>
            Next
          </button>
        </nav>
      )}
    </>
  )
}
