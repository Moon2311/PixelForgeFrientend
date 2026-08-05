import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { GridIcon, CartIcon, HistoryIcon } from '../components/Icons.jsx'
import ProductGrid from '../components/ProductGrid.jsx'

const SECTIONS = [
  { key: 'products', label: 'Products', icon: GridIcon },
  { key: 'cart', label: 'Cart', icon: CartIcon },
  { key: 'history', label: 'History', icon: HistoryIcon },
]

export default function Home() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [view, setView] = useState('products')

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) {
      navigate('/login', { replace: true })
      return
    }
    setUser(JSON.parse(stored))
  }, [navigate])

  if (!user) return null

  const name = user.first_name || user.username || 'Artist'
  const firstName = name.split(' ')[0]

  return (
    <div className="home-page">
      <div className="home-wrap">
        <Navbar />

        <div className="home-layout">
          <main className="home-main">
            {view === 'products' && (
              <>
                <div className="home-hero">
                  <h2>Welcome back, {firstName}!</h2>
                  <p>Create stunning pixel art with powerful tools and an intuitive interface.</p>
                </div>
                <ProductGrid />
              </>
            )}

            {view === 'cart' && (
              <div className="home-card">
                <h2>Your cart</h2>
                <p>Your cart is empty.</p>
                <p className="home-muted">Cart functionality is not generated yet.</p>
              </div>
            )}

            {view === 'history' && (
              <div className="home-card">
                <h2>Purchase history</h2>
                <p>No purchases yet.</p>
                <p className="home-muted">Products you buy in the past will appear here.</p>
              </div>
            )}
          </main>

          <aside className="home-sidebar">
            <nav className="sidebar-nav">
              {SECTIONS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  className={`sidebar-item${view === key ? ' active' : ''}`}
                  onClick={() => setView(key)}
                >
                  <Icon />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </aside>
        </div>
      </div>
    </div>
  )
}
