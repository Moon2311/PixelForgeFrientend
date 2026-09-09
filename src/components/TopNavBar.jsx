import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo, SearchIcon } from './Icons.jsx'
import { useToast } from '../context/useToast.js'
import { signOut, getAccessToken } from '../lib/api.js'
import { getCart } from '../lib/cartApi.js'
import { useSearch } from '../context/useSearch.js'

export default function TopNavBar() {
  const navigate = useNavigate()
  const showToast = useToast()
  const stored = localStorage.getItem('user')
  const user = stored ? JSON.parse(stored) : null
  const [cartCount, setCartCount] = useState(0)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const { query, setQuery, commitSearch } = useSearch()
  const [category, setCategory] = useState('All')

  const categories = ['All', 'Digital Art', 'Brushes', 'Templates', 'Tutorials', 'Fonts', 'Icons']

  const fetchCartCount = useCallback(async () => {
    if (!getAccessToken()) {
      setCartCount(0)
      return
    }
    try {
      const result = await getCart()
      const items = result?.data?.items || []
      const total = items.reduce((sum, item) => sum + item.quantity, 0)
      setCartCount(total)
    } catch {
      // silently ignore
    }
  }, [])

  useEffect(() => {
    fetchCartCount()
    const handler = () => fetchCartCount()
    window.addEventListener('cart-updated', handler)
    return () => window.removeEventListener('cart-updated', handler)
  }, [fetchCartCount])

  const handleLogout = () => {
    signOut()
    setCartCount(0)
    showToast('Signed out. See you soon!')
    setShowAccountMenu(false)
    setTimeout(() => navigate('/login'), 800)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    commitSearch()
  }

  const name = user?.first_name || user?.username || 'User'
  const firstName = name.split(' ')[0]

  return (
    <header className="bg-pf-navy text-white sticky top-0 z-50">
      <div className="flex items-center gap-3 px-4 py-2 max-w-[1500px] mx-auto">
        {/* Brand Logo */}
        <Link
          to="/home"
          className="flex items-center gap-1.5 shrink-0 border border-transparent hover:border-white px-2 py-1 rounded-sm transition-colors"
        >
          <Logo size={26} />
          <span className="text-xl font-bold tracking-tight hidden sm:block">
            Pixel<span className="text-pf-orange">Forge</span>
          </span>
        </Link>

        {/* Delivery/Location Selector */}
        <button
          type="button"
          className="hidden md:flex items-start gap-1 border border-transparent hover:border-white px-2 py-1 rounded-sm transition-colors text-xs leading-tight"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>
            <span className="text-gray-300 block">Deliver to</span>
            <span className="font-bold text-sm">Pakistan</span>
          </span>
        </button>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex flex-1 h-10 rounded-md overflow-hidden">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-gray-100 text-pf-text text-xs px-2 border-r border-gray-300 cursor-pointer hover:bg-gray-200 focus:outline-none shrink-0 rounded-l-md hidden sm:block"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search PixelForge"
            className="flex-1 px-3 text-sm text-pf-text focus:outline-none"
            aria-label="Search products"
          />
          <button
            type="submit"
            className="bg-pf-orange hover:bg-pf-orange-hover px-3 flex items-center justify-center transition-colors shrink-0"
            aria-label="Search"
          >
            <SearchIcon size={20} />
          </button>
        </form>

        {/* Right Utility Section */}
        <div className="flex items-center gap-1">
          {/* Language */}
          <button
            type="button"
            className="hidden lg:flex items-center gap-1 border border-transparent hover:border-white px-2 py-1 rounded-sm transition-colors text-xs"
          >
            <span className="font-bold">EN</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Account & Lists */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="flex items-start gap-1 border border-transparent hover:border-white px-2 py-1 rounded-sm transition-colors text-xs leading-tight"
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
                      <p className="text-xs text-pf-text-light truncate">{user?.email || ''}</p>
                    </div>
                  </div>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setShowAccountMenu(false)}
                      className="block text-sm text-pf-link hover:text-pf-link-hover hover:underline mb-2"
                    >
                      Admin Dashboard
                    </Link>
                  )}
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
          </div>

          {/* Orders */}
          <Link
            to="/home"
            className="hidden md:flex items-start gap-1 border border-transparent hover:border-white px-2 py-1 rounded-sm transition-colors text-xs leading-tight"
          >
            <span>
              <span className="text-gray-300 block">Returns</span>
              <span className="font-bold text-sm">& Orders</span>
            </span>
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="flex items-center border border-transparent hover:border-white px-2 py-1 rounded-sm transition-colors relative"
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
            <span className="font-bold text-sm ml-1 hidden md:block">Cart</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
