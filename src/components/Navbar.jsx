import { Link, useNavigate } from 'react-router-dom'
import Button from './Button.jsx'
import SearchBar from './SearchBar.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import { Logo } from './Icons.jsx'
import { useToast } from '../context/useToast.js'
import { useCart } from '../context/CartContext.jsx'
import { signOut, getUser } from '../lib/api.js'

export default function Navbar() {
  const navigate = useNavigate()
  const showToast = useToast()
  const user = getUser()
  const { cartCount } = useCart()

  const handleLogout = () => {
    signOut()
    showToast('Signed out. See you soon!')
    setTimeout(() => navigate('/'), 800)
  }

  const name = user?.first_name || user?.username || 'A'
  const firstName = name.split(' ')[0]

  return (
    <header className="navbar">
      <button type="button" className="navbar-brand" onClick={() => navigate('/')}>
        <Logo size={26} />
        <span>OKasha Electronics</span>
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
        {user ? (
          <>
            <span className="navbar-user">
              <span className="navbar-avatar">{firstName.charAt(0)}</span>
              <span className="navbar-meta">
                <strong>{name}</strong>
                <span>{user.email || ''}</span>
              </span>
            </span>
            <ThemeToggle />
            <Button type="button" variant="ghost" onClick={handleLogout}>
              Sign out
            </Button>
          </>
        ) : (
          <>
            <ThemeToggle />
            <Button type="button" variant="ghost" onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button type="button" variant="primary" size="sm" onClick={() => navigate('/register')}>
              Register
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
