import Navbar from '../components/Navbar.jsx'
import ProductGrid from '../components/ProductGrid.jsx'
import '../styles/products.css'

export default function Products() {
  return (
    <div className="products-page">
      <Navbar />
      <header className="products-header">
        <h1>Shop</h1>
        <p>Browse our pixel-perfect products</p>
      </header>
      <ProductGrid />
    </div>
  )
}
