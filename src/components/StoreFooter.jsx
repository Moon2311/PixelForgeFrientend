import { Link } from 'react-router-dom'
import { Logo } from './Icons.jsx'

const COLUMNS = [
  {
    title: 'Get to Know Us',
    links: ['About OKasha Electronics', 'Careers', 'Press Releases', 'Our Stores'],
  },
  {
    title: 'Shop With Us',
    links: ['Smartphones', 'Laptops', 'Audio', 'Wearables'],
  },
  {
    title: 'Payment',
    links: ['Business Card', 'Shop with Points', 'Reload Balance', 'Installment Plans'],
  },
  {
    title: 'Let Us Help You',
    links: ['Your Account', 'Your Orders', 'Shipping Rates', 'Returns & Warranty'],
  },
]

export default function StoreFooter() {
  return (
    <footer className="mt-10 text-white">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="w-full bg-[#37475A] hover:bg-[#485769] text-sm py-3.5 transition-colors cursor-pointer"
      >
        Back to top
      </button>

      <div className="bg-pf-navy-light">
        <div className="mx-auto max-w-6xl px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="font-bold mb-3 text-base">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((label) => (
                  <li key={label}>
                    <Link to="/products" className="text-gray-300 hover:text-white hover:underline">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-pf-navy border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <Link to="/" className="flex items-center gap-2 text-white hover:text-white">
            <Logo size={20} />
            <span className="font-bold text-sm">
              OKasha <span className="text-pf-orange">Electronics</span>
            </span>
          </Link>
          <p>&copy; {new Date().getFullYear()} OKasha Electronics. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
