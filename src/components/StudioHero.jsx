import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listProducts } from '../lib/productsApi.js'
import { formatMoney } from '../lib/format.js'

const MAX_ITEMS = 6
const EASE = 'cubic-bezier(0.25, 1, 0.5, 1)'

const unsplash = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=480&h=480&q=70`

// Shown while the API loads or when it is offline / has no featured products.
// Mock items have no real product page, so they link to the catalog instead.
const FALLBACK = [
  { id: 'demo-phone', name: 'Flagship Smartphone Pro', price: 999, category: 'Smartphones', image: unsplash('photo-1511707171634-5f897ff02aa9') },
  { id: 'demo-laptop', name: 'UltraSlim 14" Laptop', price: 1299, category: 'Laptops', image: unsplash('photo-1496181133206-80ce9b88a853') },
  { id: 'demo-audio', name: 'Noise-Cancelling Headphones', price: 349, category: 'Audio', image: unsplash('photo-1505740420928-5e560c06d30e') },
  { id: 'demo-watch', name: 'Smartwatch Series X', price: 399, category: 'Wearables', image: unsplash('photo-1523275335684-37898b6baf30') },
  { id: 'demo-vr', name: 'Immersive VR Headset', price: 499, category: 'Gaming', image: unsplash('photo-1622979135225-d2ba269cf1ac') },
  { id: 'demo-tablet', name: 'Pro Tablet 11"', price: 799, category: 'Tablets', image: unsplash('photo-1544244015-0df4b3ffc6b0') },
].map((p) => ({ ...p, href: '/products' }))

function toStageItem(product) {
  return {
    id: product.id,
    name: product.name,
    price: product.discount_price || product.price,
    category: product.category_name || product.category || '',
    image: product.images?.[0] || product.thumbnail || product.image || '',
    href: `/products/${product.id}`,
  }
}

// Transform for item `i` given the active (hovered/focused) index.
function stageTransform(i, active) {
  if (active === null) return 'translate3d(0, 0, 0) scale(1)'
  if (i === active) return 'translate3d(0, -24px, 50px) scale(1.06)'
  return `translate3d(${i < active ? -20 : 20}px, 0, 0) scale(1)`
}

// Soft spotlight + side fills shared by the studio-style storefront pages.
export function StudioLights() {
  return (
    <>
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[900px] max-w-[160vw] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,153,0,0.10),transparent_65%)]" />
      <div className="pointer-events-none absolute top-1/3 -left-32 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(35,47,62,0.06),transparent_70%)]" />
      <div className="pointer-events-none absolute top-1/4 -right-32 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(35,47,62,0.06),transparent_70%)]" />
    </>
  )
}

export default function StudioHero() {
  const [items, setItems] = useState(FALLBACK)
  const [active, setActive] = useState(null)

  useEffect(() => {
    let cancelled = false
    listProducts({ featured: 'true', page_size: MAX_ITEMS })
      .then((data) => {
        const results = (data?.results || []).map(toStageItem).filter((p) => p.image)
        if (!cancelled && results.length > 0) setItems(results)
      })
      .catch(() => {
        // Keep the fallback lineup.
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="relative overflow-hidden bg-white">
      <StudioLights />

      <div className="relative mx-auto max-w-[1500px] px-4 pt-10 sm:pt-14 lg:pt-16 pb-8 sm:pb-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-block rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-pf-text-light">
            OKasha Electronics Studio Showcase
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-pf-text leading-[1.1]">
            Next-Generation Technology, Curated for You.
          </h1>
          <p className="mt-4 text-sm sm:text-base text-pf-text-light">
            Smartphones, laptops, audio, wearables and gaming gear, hand-picked from the latest releases.
          </p>
        </div>

        {/* Stage */}
        <div className="relative mt-10 sm:mt-14">
          <ul
            className="flex gap-4 sm:gap-5 lg:gap-6 overflow-x-auto md:overflow-visible scrollbar-hide snap-x snap-mandatory md:snap-none md:justify-center px-1 pt-8 pb-6 -mx-4 md:mx-0 [perspective:1200px]"
            onMouseLeave={() => setActive(null)}
          >
            {items.map((item, i) => (
              <StageItem
                key={item.id}
                item={item}
                isActive={active === i}
                transform={stageTransform(i, active)}
                onActivate={() => setActive(i)}
                onDeactivate={() => setActive((cur) => (cur === i ? null : cur))}
                first={i === 0}
                last={i === items.length - 1}
              />
            ))}
          </ul>

          {/* Floor reflection divider */}
          <div className="mx-auto h-px w-full max-w-5xl bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          <div className="mx-auto h-10 w-full max-w-4xl bg-gradient-to-b from-gray-100/80 to-transparent blur-sm" />
        </div>
      </div>
    </section>
  )
}

function StageItem({ item, isActive, transform, onActivate, onDeactivate, first, last }) {
  return (
    <li
      className={`group relative shrink-0 snap-center w-[62vw] max-w-[220px] sm:w-52 md:w-[15%] md:max-w-[210px] md:min-w-[140px] ${first ? 'ml-4 md:ml-0' : ''} ${last ? 'mr-4 md:mr-0' : ''}`}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onBlur={onDeactivate}
      style={{ zIndex: isActive ? 20 : 1 }}
    >
      <div
        className="transform-gpu will-change-transform [transform-style:preserve-3d] motion-reduce:!transition-none"
        style={{ transform, transition: `transform 600ms ${EASE}` }}
      >
        {/* Product card */}
        <div
          className={`relative rounded-2xl bg-gradient-to-b from-white to-gray-50 border border-gray-100 px-4 pt-5 pb-4 transition-shadow duration-500 ${
            isActive ? 'shadow-[0_30px_60px_-20px_rgba(15,17,17,0.35)]' : 'shadow-[0_6px_18px_-10px_rgba(15,17,17,0.18)]'
          }`}
        >
          {item.category && (
            <p className="text-[10px] font-semibold uppercase tracking-widest text-pf-text-light">
              {item.category}
            </p>
          )}
          <div className="mt-2 aspect-square overflow-hidden rounded-xl bg-white">
            <img
              src={item.image}
              alt={item.name}
              width="480"
              height="480"
              decoding="async"
              className="h-full w-full object-cover mix-blend-multiply"
            />
          </div>
          <h3 className="mt-3 text-sm font-medium leading-snug text-pf-text line-clamp-2 min-h-[2.5em]">
            {item.name}
          </h3>
          <p className="mt-1 text-sm font-bold text-pf-text">{formatMoney(item.price)}</p>

          {/* Overlay action: always visible on touch screens, slides in on hover/focus elsewhere */}
          <div className="overflow-hidden">
            <Link
              to={item.href}
              className={`mt-3 block rounded-full bg-pf-cta hover:bg-pf-cta-hover text-center text-sm font-medium text-pf-text hover:text-pf-text py-2 transition-all duration-500 focus-visible:outline-2 focus-visible:outline-pf-orange ${
                isActive
                  ? 'opacity-100 translate-y-0'
                  : '[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:translate-y-3'
              }`}
              style={{ transitionTimingFunction: EASE }}
              aria-label={`View details for ${item.name}`}
            >
              View Details
            </Link>
          </div>
        </div>

        {/* Matte pedestal */}
        <div className="mx-auto mt-3 h-3 w-4/5 rounded-[50%] bg-gradient-to-b from-gray-200 to-gray-300 shadow-[0_8px_14px_-6px_rgba(0,0,0,0.25)]" />
      </div>
    </li>
  )
}
