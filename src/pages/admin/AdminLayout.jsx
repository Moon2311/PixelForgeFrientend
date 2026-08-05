import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import {
  AlertIcon,
  BackIcon,
  BoxIcon,
  GridIcon,
  LogsIcon,
  Logo,
} from '../../components/Icons.jsx'
import ThemeToggle from '../../components/ThemeToggle.jsx'
import { getUser, signOut } from '../../lib/api.js'
import { useToast } from '../../context/useToast.js'

export default function AdminLayout() {
  const navigate = useNavigate()
  const showToast = useToast()
  const user = getUser() || {}

  const handleLogout = () => {
    signOut()
    showToast('Signed out. See you soon!')
    setTimeout(() => navigate('/login'), 800)
  }

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <Link to="/admin/products" className="admin-brand">
          <Logo size={26} />
          <span>PixelForge Admin</span>
        </Link>
        <nav className="admin-nav">
          <NavLink
            to="/admin/products"
            end={false}
            className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
          >
            <BoxIcon />
            <span>Products</span>
          </NavLink>
          <NavLink
            to="/admin/inventory/logs"
            className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
          >
            <LogsIcon />
            <span>Inventory logs</span>
          </NavLink>
          <NavLink
            to="/admin/inventory/low-stock"
            className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
          >
            <AlertIcon />
            <span>Low stock alerts</span>
          </NavLink>
        </nav>
        <div className="admin-sidebar-footer">
          <Link to="/home" className="admin-store-link">
            <BackIcon size={16} />
            <span>Back to store</span>
          </Link>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-title">
            <GridIcon />
            <span>Inventory Management</span>
          </div>
          <div className="admin-topbar-actions">
            <span className="admin-user">
              {user.first_name || user.username}
              <span className="admin-role">admin</span>
            </span>
            <ThemeToggle />
            <Button type="button" variant="ghost" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
