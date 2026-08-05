import { Link, useNavigate } from 'react-router-dom'
import Button from './Button.jsx'
import SearchBar from './SearchBar.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import { Logo } from './Icons.jsx'
import { useToast } from '../context/useToast.js'
import { signOut } from '../lib/api.js'

export default function Navbar() {
  const navigate = useNavigate()
  const showToast = useToast()
  const stored = localStorage.getItem('user')
  const user = stored ? JSON.parse(stored) : null

  const handleLogout = () => {
    signOut()
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
