import { Link } from 'react-router-dom'
import StoreLayout from '../components/StoreLayout.jsx'
import HeroBanner from '../components/HeroBanner.jsx'
import ProductStrip from '../components/ProductStrip.jsx'
import {
  FeatureCard,
  ImageGridCard,
  DealCard,
  QuickPickCard,
  SectionHeader,
  SignInCard,
} from '../components/Cards.jsx'
import { getUser } from '../lib/api.js'
import { CATEGORIES, categoryImage } from '../lib/catalog.js'
import { discountPercent } from '../lib/format.js'

const pickDeals = (list) =>
  list
    .filter((p) => discountPercent(p) > 0)
    .sort((a, b) => discountPercent(b) - discountPercent(a))

const pickTopRated = (list) =>
  [...list].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))

const byLabels = (labels) => CATEGORIES.filter((c) => labels.includes(c.label))

export default function Home() {
  const user = getUser()
  const name = user?.first_name || user?.username || ''
  const firstName = name.split(' ')[0]

  return (
    <StoreLayout>
      <main className="mx-auto max-w-[1500px]">
        <HeroBanner />

        {/* Card row overlapping the bottom of the hero */}
        <div className="relative z-10 mt-3 sm:-mt-40 lg:-mt-56 px-3 sm:px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <ImageGridCard
            title={firstName ? `Picked for you, ${firstName}` : 'Shop by category'}
            items={byLabels(['Smartphones', 'Laptops', 'Tablets', 'Audio'])}
            cta="Explore all categories"
          />
          <DealCard
            title="Deal of the day"
            image={categoryImage('Laptops')}
            discount="Up to 30% off"
            originalPrice="$1,499.00"
            salePrice="$1,049.00"
          />
          <ImageGridCard
            title="Gear up for game night"
            items={byLabels(['Gaming', 'TV & Home', 'Audio', 'Wearables'])}
            cta="Shop entertainment"
          />
          {user ? (
            <FeatureCard
              title="New in wearables"
              image={categoryImage('Wearables')}
              cta="Shop smartwatches"
            />
          ) : (
            <SignInCard />
          )}
        </div>

        <div className="px-3 sm:px-4 mt-5 space-y-5">
          <ProductStrip title="Today's deals" pick={pickDeals} />

          <section className="bg-pf-card p-5 shadow-sm">
            <SectionHeader title="Shop by category" ctaText="See all" />
            <div className="grid grid-cols-4 lg:grid-cols-8 gap-x-3 gap-y-5">
              {CATEGORIES.map((cat) => (
                <QuickPickCard key={cat.label} {...cat} />
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <FeatureCard title="Capture every moment" image={categoryImage('Cameras')} cta="Shop cameras" />
            <FeatureCard title="Work from anywhere" image={categoryImage('Tablets')} cta="Shop tablets" />
            <FeatureCard title="Big-screen upgrades" image={categoryImage('TV & Home')} cta="Shop TVs" />
            <FeatureCard title="Wireless freedom" image={categoryImage('Audio')} cta="Shop headphones" />
          </div>

          <ProductStrip title="Top rated by customers" pick={pickTopRated} />

          <section className="bg-gradient-to-r from-pf-navy to-pf-navy-light p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-white text-xl font-bold mb-1">Free delivery on orders over $50</h3>
              <p className="text-gray-300 text-sm">
                Plus 30-day returns and a 1-year warranty on every device.
              </p>
            </div>
            <Link
              to="/products"
              className="self-start sm:self-auto bg-pf-cta hover:bg-pf-cta-hover text-pf-text hover:text-pf-text font-medium px-6 py-2.5 rounded-full shrink-0"
            >
              Start shopping
            </Link>
          </section>
        </div>
      </main>
    </StoreLayout>
  )
}
