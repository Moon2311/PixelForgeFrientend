import StoreLayout from '../components/StoreLayout.jsx'
import ProductGrid from '../components/ProductGrid.jsx'

export default function Products() {
  return (
    <StoreLayout>
      <main className="mx-auto max-w-[1500px] px-3 sm:px-4 py-5">
        <h1 className="text-2xl font-bold text-pf-text mb-1">Shop electronics</h1>
        <p className="text-sm text-pf-text-light mb-4">
          Phones, laptops, audio and more — with fast delivery and easy returns.
        </p>
        <ProductGrid />
      </main>
    </StoreLayout>
  )
}
