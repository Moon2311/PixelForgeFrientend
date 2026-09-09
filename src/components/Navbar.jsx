import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from './Button.jsx'
import SearchBar from './SearchBar.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import { Logo } from './Icons.jsx'
import { useToast } from '../context/useToast.js'
import { signOut, getAccessToken } from '../lib/api.js'
import { getCart } from '../lib/cartApi.js'

export default function Navbar() {
  const navigate = useNavigate()
  const showToast = useToast()
  const stored = localStorage.getItem('user')
  const user = stored ? JSON.parse(stored) : null
  const [cartCount, setCartCount] = useState(0)

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
      // silently ignore — cart may not be available
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
    setTimeout(() => navigate('/login'), 800)
  }

  const name = user?.first_name || user?.username || 'A'
  const firstName = name.split(' ')[0]

  return (
    <header className="navbar">
      <button type="button" className="navbar-brand" onClick={() => navigate('/home')}>
        <Logo size={26} />
        <span>PixelForge</span>
      </button>

      <SearchBar className="navbar-search" />

      <div className="navbar-actions">
        {user?.role === 'admin' && (
          <Link to="/admin" className="navbar-admin-link">
            Admin
          </Link>
        )}
        <Link to="/cart" className="navbar-cart-link" title="View Cart">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
          {cartCount > 0 && <span className="navbar-cart-badge">{cartCount}</span>}
        </Link>
        <span className="navbar-user">
          <span className="navbar-avatar">{firstName.charAt(0)}</span>
          <span className="navbar-meta">
            <strong>{name}</strong>
            <span>{user?.email || ''}</span>
          </span>
        </span>
        <ThemeToggle />
        <Button type="button" variant="ghost" onClick={handleLogout}>
          Sign out
        </Button>
      </div>
    </header>
  )
}
