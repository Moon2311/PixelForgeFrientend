import StoreFooter from './StoreFooter.jsx'

// Shared shell for the customer-facing storefront pages.
// `background` lets a page replace the default grey canvas (e.g. all-white).
export default function StoreLayout({ children, background = 'bg-pf-bg' }) {
  return (
    <div className={`min-h-screen flex flex-col ${background} text-pf-text`}>
      <div className="flex-1">{children}</div>
      <StoreFooter />
    </div>
  )
}
