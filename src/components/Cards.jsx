import { Link } from 'react-router-dom'

const CARD = 'bg-pf-card p-5 flex flex-col h-full shadow-sm'
const CARD_LINK =
  'mt-auto pt-3 text-sm text-pf-link hover:text-pf-link-hover hover:underline'

function Thumb({ src, alt, className = '' }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`w-full h-full object-cover transition-transform duration-300 ${className}`}
    />
  )
}

export function FeatureCard({ title, image, cta, href = '/products' }) {
  return (
    <div className={CARD}>
      <h3 className="font-bold text-pf-text text-xl leading-snug mb-3">{title}</h3>
      <Link to={href} className="group block overflow-hidden bg-gray-50 aspect-square">
        <Thumb src={image} alt={title} className="group-hover:scale-105" />
      </Link>
      <Link to={href} className={CARD_LINK}>
        {cta || 'See more'}
      </Link>
    </div>
  )
}

export function ImageGridCard({ title, items, cta = 'See more', href = '/products' }) {
  return (
    <div className={CARD}>
      <h3 className="font-bold text-pf-text text-xl leading-snug mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {items.map((item) => (
          <Link
            key={item.label}
            to={item.href || '/products'}
            className="group block text-pf-text hover:text-pf-text"
          >
            <div className="bg-gray-50 overflow-hidden mb-1.5 aspect-square">
              <Thumb src={item.image} alt={item.label} className="group-hover:scale-105" />
            </div>
            <p className="text-xs leading-tight line-clamp-2">{item.label}</p>
            {item.discount && (
              <span className="text-xs font-bold text-pf-deal-red">{item.discount}</span>
            )}
          </Link>
        ))}
      </div>
      <Link to={href} className={CARD_LINK}>
        {cta}
      </Link>
    </div>
  )
}

export function DealCard({ title, image, discount, originalPrice, salePrice, href = '/products' }) {
  return (
    <div className={CARD}>
      <h3 className="font-bold text-pf-text text-xl leading-snug mb-3">{title}</h3>
      <Link to={href} className="group block overflow-hidden bg-gray-50 aspect-square mb-3">
        <Thumb src={image} alt={title} className="group-hover:scale-105" />
      </Link>
      <div className="flex items-center gap-2 flex-wrap">
        {discount && (
          <span className="bg-pf-deal-red text-white text-xs font-bold px-2 py-1 rounded-sm">
            {discount}
          </span>
        )}
        <span className="text-xs font-bold text-pf-deal-red">Limited time deal</span>
      </div>
      <div className="flex items-baseline gap-2 mt-1">
        {salePrice && <span className="text-lg font-medium text-pf-text">{salePrice}</span>}
        {originalPrice && (
          <span className="text-xs text-pf-text-light">
            List: <span className="line-through">{originalPrice}</span>
          </span>
        )}
      </div>
      <Link to={href} className={CARD_LINK}>
        Shop now
      </Link>
    </div>
  )
}

// Sign-in prompt shown to guests in the card row (mirrors Amazon's home layout).
export function SignInCard() {
  return (
    <div className={`${CARD} justify-between`}>
      <div>
        <h3 className="font-bold text-pf-text text-xl leading-snug mb-2">
          Sign in for the best experience
        </h3>
        <p className="text-sm text-pf-text-light">
          Track orders, save your cart across devices and check out faster.
        </p>
      </div>
      <div className="mt-5 space-y-3">
        <Link
          to="/login"
          className="block w-full text-center bg-pf-cta hover:bg-pf-cta-hover text-pf-text hover:text-pf-text text-sm font-medium py-2 rounded-lg shadow-sm"
        >
          Sign in securely
        </Link>
        <p className="text-xs text-pf-text-light">
          New customer?{' '}
          <Link to="/register" className="text-pf-link hover:text-pf-link-hover hover:underline">
            Start here.
          </Link>
        </p>
      </div>
    </div>
  )
}

export function QuickPickCard({ label, image, href = '/products' }) {
  return (
    <Link to={href} className="group block text-center text-pf-text hover:text-pf-text">
      <div className="mx-auto aspect-square w-full max-w-36 rounded-full overflow-hidden bg-white shadow-sm ring-1 ring-black/5 group-hover:ring-2 group-hover:ring-pf-orange transition">
        <Thumb src={image} alt={label} className="group-hover:scale-110" />
      </div>
      <p className="mt-2 text-sm font-medium">{label}</p>
    </Link>
  )
}

export function SectionHeader({ title, href = '/products', ctaText = 'See more' }) {
  return (
    <div className="flex items-baseline gap-4 mb-4">
      <h2 className="text-xl font-bold text-pf-text">{title}</h2>
      {href && (
        <Link
          to={href}
          className="text-sm text-pf-link hover:text-pf-link-hover hover:underline"
        >
          {ctaText}
        </Link>
      )}
    </div>
  )
}
