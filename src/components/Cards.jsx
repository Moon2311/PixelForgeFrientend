import { Link } from 'react-router-dom'

export function FeatureCard({ title, image, cta, href = '/products' }) {
  return (
    <div className="bg-pf-card rounded-md p-5 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
      <h3 className="font-bold text-pf-text text-base mb-3">{title}</h3>
      <div className="flex-1 flex items-center justify-center mb-4 overflow-hidden rounded-md bg-gray-50">
        <div
          className="w-full h-48 bg-cover bg-center transition-transform duration-300 hover:scale-105"
          style={{ backgroundImage: `url(${image})` }}
        />
      </div>
      <Link
        to={href}
        className="text-pf-link text-sm hover:text-pf-link-hover hover:underline transition-colors"
      >
        {cta || 'See more'}
      </Link>
    </div>
  )
}

export function ImageGridCard({ title, items }) {
  return (
    <div className="bg-pf-card rounded-md p-5 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="font-bold text-pf-text text-base mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item, i) => (
          <Link key={i} to={item.href || '/products'} className="group block">
            <div className="bg-gray-50 rounded-md overflow-hidden mb-1.5 aspect-square">
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundImage: `url(${item.image})` }}
              />
            </div>
            <p className="text-xs text-pf-text font-medium leading-tight mb-0.5 line-clamp-2">{item.label}</p>
            {item.discount && (
              <span className="text-xs font-bold text-pf-deal-red">{item.discount}</span>
            )}
          </Link>
        ))}
      </div>
      <Link
        to="/products"
        className="block mt-3 text-pf-link text-sm hover:text-pf-link-hover hover:underline transition-colors"
      >
        See all deals
      </Link>
    </div>
  )
}

export function DealCard({ title, image, discount, originalPrice, salePrice, href = '/products' }) {
  return (
    <div className="bg-pf-card rounded-md p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-pf-text text-base">{title}</h3>
        {discount && (
          <span className="bg-pf-deal-red text-white text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ml-2">
            {discount}
          </span>
        )}
      </div>
      <Link to={href} className="block group">
        <div className="bg-gray-50 rounded-md overflow-hidden mb-3 aspect-square">
          <div
            className="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
            style={{ backgroundImage: `url(${image})` }}
          />
        </div>
      </Link>
      <div className="flex items-baseline gap-2">
        {salePrice && (
          <span className="text-lg font-bold text-pf-deal-red">{salePrice}</span>
        )}
        {originalPrice && (
          <span className="text-sm text-pf-text-light line-through">{originalPrice}</span>
        )}
      </div>
      <Link
        to={href}
        className="block mt-2 text-pf-link text-sm hover:text-pf-link-hover hover:underline transition-colors"
      >
        Shop now
      </Link>
    </div>
  )
}

export function QuickPickCard({ label, image, href = '/products' }) {
  return (
    <Link
      to={href}
      className="bg-pf-card rounded-md p-4 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] group block"
    >
      <div className="bg-gray-50 rounded-md overflow-hidden mb-3 aspect-square">
        <div
          className="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundImage: `url(${image})` }}
        />
      </div>
      <p className="text-sm font-medium text-pf-text text-center">{label}</p>
    </Link>
  )
}

export function SectionHeader({ title, href = '/products', ctaText = 'See more' }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-pf-text">{title}</h2>
      <Link
        to={href}
        className="text-sm text-pf-link hover:text-pf-link-hover hover:underline transition-colors font-medium"
      >
        {ctaText}
      </Link>
    </div>
  )
}
