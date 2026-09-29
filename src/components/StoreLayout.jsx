import TopNavBar from './TopNavBar.jsx'
import SubHeaderNav from './SubHeaderNav.jsx'
import StoreFooter from './StoreFooter.jsx'

// Shared shell for the customer-facing storefront pages.
export default function StoreLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-pf-bg text-pf-text">
      <TopNavBar />
      <SubHeaderNav />
      <div className="flex-1">{children}</div>
      <StoreFooter />
    </div>
  )
}
