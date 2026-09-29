// Small presentational helpers shared by product cards and strips.
import { formatMoney } from '../lib/format.js'

// Amazon-style price: small "$", large whole part, superscript cents.
export function Price({ value, className = '' }) {
  const text = formatMoney(value)
  if (!text) return null
  const [whole, cents = '00'] = text.replace('$', '').split('.')
  return (
    <span className={`inline-flex items-start leading-none text-pf-text ${className}`}>
      <span className="text-xs mt-[0.2em]">$</span>
      <span className="text-[1.75em] font-medium">{whole}</span>
      <span className="text-xs mt-[0.2em]">{cents}</span>
    </span>
  )
}

export function Stars({ rating = 0, size = 16 }) {
  const value = Math.max(0, Math.min(5, Number(rating) || 0))
  return (
    <span className="relative inline-flex" aria-label={`${value.toFixed(1)} out of 5 stars`} role="img">
      <StarRow size={size} className="text-gray-300" />
      <span className="absolute inset-0 overflow-hidden" style={{ width: `${(value / 5) * 100}%` }}>
        <StarRow size={size} className="text-pf-star" />
      </span>
    </span>
  )
}

function StarRow({ size, className }) {
  return (
    <span className={`flex shrink-0 ${className}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  )
}
