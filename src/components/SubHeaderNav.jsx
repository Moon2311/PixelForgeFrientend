import { useState } from 'react'
import { Link } from 'react-router-dom'

const QUICK_LINKS = [
  "Today's Deals",
  'Customer Service',
  'Registry',
  'Gift Cards',
  'Sell',
  'Digital Art',
  'New Releases',
  'Free Shipping',
  'Brushes & Tools',
]

export default function SubHeaderNav() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <nav className="bg-pf-navy-light text-white text-sm">
        <div className="flex items-center gap-4 px-4 overflow-x-auto scrollbar-hide">
          {/* All / Hamburger Menu */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-1.5 border border-transparent hover:border-white px-2 py-2 rounded-sm transition-colors shrink-0 font-bold"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            All
          </button>

          {QUICK_LINKS.map((link) => (
            <Link
              key={link}
              to="/products"
              className="border border-transparent hover:border-white px-2 py-2 rounded-sm transition-colors whitespace-nowrap shrink-0"
            >
              {link}
            </Link>
          ))}
        </div>
      </nav>

      {/* Slide-out Drawer */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-80 bg-white text-pf-text z-50 shadow-2xl overflow-y-auto animate-slide-in">
            <div className="flex items-center justify-between bg-pf-navy-light text-white px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-pf-orange text-pf-navy flex items-center justify-center font-bold">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <span className="font-bold text-lg">Browse</span>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="text-white hover:text-pf-orange transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="py-2">
              <div className="px-5 py-3 text-xs font-bold text-pf-text-light uppercase tracking-wider border-b border-gray-100">
                Shop by Category
              </div>
              {['Digital Art', 'Brushes & Presets', 'Templates', 'Tutorials', 'Fonts & Typography', 'Icons & Illustrations', 'UI Kits', 'Stock Photos'].map((item) => (
                <Link
                  key={item}
                  to="/products"
                  onClick={() => setDrawerOpen(false)}
                  className="block px-5 py-2.5 text-sm hover:bg-gray-100 transition-colors"
                >
                  {item}
                </Link>
              ))}

              <div className="px-5 py-3 mt-2 text-xs font-bold text-pf-text-light uppercase tracking-wider border-b border-gray-100">
                Quick Links
              </div>
              {["Today's Deals", 'Customer Service', 'Gift Cards', 'Sell on OKasha Electronics'].map((item) => (
                <Link
                  key={item}
                  to="/products"
                  onClick={() => setDrawerOpen(false)}
                  className="block px-5 py-2.5 text-sm hover:bg-gray-100 transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}
