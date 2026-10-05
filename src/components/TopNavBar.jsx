import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Logo, SearchIcon } from './Icons.jsx'
import { useToast } from '../context/useToast.js'
import { useCart } from '../context/CartContext.jsx'
import { signOut, getUser } from '../lib/api.js'
import { useSearch } from '../context/useSearch.js'

export default function TopNavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const showToast = useToast()
  const user = getUser()
  const { cartCount } = useCart()
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const { query, setQuery, commitSearch } = useSearch()

  const handleLogout = () => {
    signOut()
    showToast('Signed out. See you soon!')
    setShowAccountMenu(false)
    setTimeout(() => navigate('/'), 800)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    commitSearch()
    // Results are shown on the products page, so jump there from anywhere else.
    if (location.pathname !== '/products') navigate('/products')
  }

  const name = user?.first_name || user?.username || 'User'
  const firstName = name.split(' ')[0]

  return (
    <header className="bg-pf-navy text-white sticky top-0 z-50">
      <div className="flex flex-wrap md:flex-nowrap items-center gap-x-3 gap-y-2 px-3 md:px-4 py-2">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-1.5 shrink-0 text-white hover:text-white border border-transparent hover:border-white px-2 py-1 rounded-sm transition-colors"
        >
          <Logo size={26} />
          <span className="text-lg md:text-xl font-bold tracking-tight">
            OKasha <span className="text-pf-orange">Electronics</span>
          </span>
        </Link>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="order-last md:order-none basis-full md:basis-auto flex flex-1 h-10 rounded-md overflow-hidden bg-white focus-within:ring-3 focus-within:ring-pf-orange"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search OKasha Electronics"
            className="flex-1 min-w-0 px-3 text-sm text-pf-text bg-white placeholder:text-gray-500 focus:outline-none"
            aria-label="Search products"
          />
          <button
            type="submit"
            className="bg-pf-yellow hover:bg-pf-orange text-pf-navy px-4 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            aria-label="Search"
          >
            <SearchIcon size={20} />
          </button>
        </form>

        {/* Right Utility Section */}
        <div className="ml-auto flex items-center gap-1">
          {/* Account & Lists */}
          <div className="relative">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className="flex items-start gap-1 border border-transparent hover:border-white px-2 py-1 rounded-sm transition-colors text-xs leading-tight whitespace-nowrap cursor-pointer"
                >
                  <span>
                    <span className="text-gray-300 block">Hello, {firstName}</span>
                    <span className="font-bold text-sm flex items-center gap-0.5">
                      Account & Lists
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </span>
                </button>

                {showAccountMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowAccountMenu(false)} />
                    <div className="absolute right-0 top-full mt-1 w-64 bg-white text-pf-text rounded-md shadow-xl border border-gray-200 z-50 p-4">
                      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200">
                        <div className="w-10 h-10 rounded-full bg-pf-navy text-white flex items-center justify-center font-bold text-lg">
                          {firstName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{name}</p>
                          <p className="text-xs text-pf-text-light truncate">{user.email || ''}</p>
                        </div>
                      </div>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setShowAccountMenu(false)}
                          className="block text-sm text-pf-link hover:text-pf-link-hover hover:underline mb-2"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        to="/orders"
                        onClick={() => setShowAccountMenu(false)}
                        className="block text-sm text-pf-link hover:text-pf-link-hover hover:underline mb-2"
                      >
                        Your Orders
                      </Link>
                      <Link
                        to="/cart"
                        onClick={() => setShowAccountMenu(false)}
                        className="block text-sm text-pf-link hover:text-pf-link-hover hover:underline mb-2"
                      >
                        Your Cart
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="block w-full text-left text-sm text-pf-link hover:text-pf-link-hover hover:underline cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="flex items-start gap-1 border border-transparent hover:border-white px-2 py-1 rounded-sm transition-colors text-xs leading-tight whitespace-nowrap cursor-pointer"
              >
                <span>
                  <span className="text-gray-300 block">Hello, sign in</span>
                  <span className="font-bold text-sm">Account & Lists</span>
                </span>
              </button>
            )}
          </div>

          {/* Orders */}
          <Link
            to="/orders"
            className="hidden lg:flex items-start whitespace-nowrap gap-1 text-white hover:text-white border border-transparent hover:border-white px-2 py-1 rounded-sm transition-colors text-xs leading-tight whitespace-nowrap cursor-pointer"
          >
            <span>
              <span className="text-gray-300 block">Returns</span>
              <span className="font-bold text-sm">& Orders</span>
            </span>
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="flex items-center text-white hover:text-white border border-transparent hover:border-white px-2 py-1 rounded-sm transition-colors relative"
          >
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pf-orange text-pf-navy text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline font-bold text-sm ml-1">Cart</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
