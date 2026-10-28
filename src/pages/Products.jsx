import { useState } from 'react'
import { Link } from 'react-router-dom'
import StoreLayout from '../components/StoreLayout.jsx'
import ProductGrid from '../components/ProductGrid.jsx'
import { StudioLights } from '../components/StudioHero.jsx'
import { CartIcon, HistoryIcon, SearchIcon, UserIcon } from '../components/Icons.jsx'
import { useSearch } from '../context/useSearch.js'
import { useCart } from '../context/CartContext.jsx'
import { useToast } from '../context/useToast.js'
import { getUser, signOut } from '../lib/api.js'

export default function Products() {
  return (
    <StoreLayout background="bg-white">
      <main className="relative overflow-hidden bg-white">
        <StudioLights />

        <div className="relative mx-auto max-w-[1500px] px-4 pt-8 sm:pt-12 pb-10">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
            <span className="inline-block rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-pf-text-light">
              OKasha Electronics Catalog
            </span>
            <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-pf-text leading-[1.1]">
              Shop All Electronics
            </h1>
            <p className="mt-4 text-sm sm:text-base text-pf-text-light">
              Phones, laptops, audio and more, with fast delivery and easy returns.
            </p>

            <CatalogToolbar />
          </div>

          <ProductGrid />

          {/* Floor reflection divider */}
          <div className="mx-auto mt-12 h-px w-full max-w-5xl bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
        </div>
      </main>
    </StoreLayout>
  )
}

const TOOLBAR_BUTTON =
  'relative flex h-12 shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 sm:px-5 text-sm font-medium text-pf-text hover:text-pf-text hover:border-gray-300 shadow-[0_6px_18px_-10px_rgba(15,17,17,0.18)] transition-colors'

// Search box with the cart, order-history and account buttons beside it.
function CatalogToolbar() {
  const { query, setQuery, commitSearch } = useSearch()
  const { cartCount } = useCart()

  const handleSearch = (e) => {
    e.preventDefault()
    commitSearch()
  }

  return (
    <div className="mt-8 flex items-center gap-3">
      <form
        onSubmit={handleSearch}
        role="search"
        className="flex flex-1 min-w-0 h-12 rounded-full border border-gray-200 bg-white shadow-[0_6px_18px_-10px_rgba(15,17,17,0.18)] focus-within:border-pf-orange focus-within:ring-3 focus-within:ring-pf-orange/20 transition-shadow"
      >
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search OKasha Electronics"
          aria-label="Search products"
          className="flex-1 min-w-0 bg-transparent pl-5 pr-2 text-sm text-pf-text placeholder:text-gray-500 focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Search"
          className="m-1 flex w-11 shrink-0 items-center justify-center rounded-full bg-pf-cta hover:bg-pf-cta-hover text-pf-text transition-colors cursor-pointer"
        >
          <SearchIcon size={18} />
        </button>
      </form>

      <Link
        to="/cart"
        aria-label={`Cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
        className={TOOLBAR_BUTTON}
      >
        <CartIcon />
        <span className="hidden sm:inline">Cart</span>
        {cartCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-pf-orange px-1 text-xs font-bold text-pf-navy">
            {cartCount}
          </span>
        )}
      </Link>

      <Link to="/orders" aria-label="Your order history" className={TOOLBAR_BUTTON}>
        <HistoryIcon />
        <span className="hidden sm:inline">Orders</span>
      </Link>

      <AccountMenu />
    </div>
  )
}

// "Sign in" for guests; name + dropdown with Sign out for signed-in users.
function AccountMenu() {
  const showToast = useToast()
  const [user, setUser] = useState(getUser)
  const [open, setOpen] = useState(false)

  if (!user) {
    return (
      <Link to="/login" state={{ returnTo: '/products' }} aria-label="Sign in" className={TOOLBAR_BUTTON}>
        <UserIcon />
        <span className="hidden sm:inline">Sign in</span>
      </Link>
    )
  }

  const name = user.first_name || user.username || 'Account'
  const firstName = name.split(' ')[0]

  const handleSignOut = () => {
    signOut()
    setOpen(false)
    setUser(null)
    window.dispatchEvent(new Event('cart-updated'))
    showToast('Signed out. See you soon!')
  }

  return (
    <div className="relative shrink-0" onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${name}`}
        className={`${TOOLBAR_BUTTON} cursor-pointer`}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pf-navy text-xs font-bold text-white">
          {firstName.charAt(0).toUpperCase()}
        </span>
        <span className="hidden sm:inline max-w-[8rem] truncate">{firstName}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-gray-100 bg-white p-2 text-left shadow-[0_24px_48px_-16px_rgba(15,17,17,0.3)]"
          >
            <div className="px-3 py-2 border-b border-gray-100 mb-1">
              <p className="text-sm font-bold text-pf-text truncate">{name}</p>
              {user.email && <p className="text-xs text-pf-text-light truncate">{user.email}</p>}
            </div>
            {user.role === 'admin' && (
              <Link
                to="/admin"
                role="menuitem"
                className="block rounded-lg px-3 py-2 text-sm text-pf-text hover:text-pf-text hover:bg-gray-50"
              >
                Admin Dashboard
              </Link>
            )}
            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-pf-deal-red hover:bg-red-50 cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}
