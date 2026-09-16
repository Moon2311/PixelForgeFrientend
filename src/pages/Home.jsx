import { Link } from 'react-router-dom'
import TopNavBar from '../components/TopNavBar.jsx'
import SubHeaderNav from '../components/SubHeaderNav.jsx'
import HeroBanner from '../components/HeroBanner.jsx'
import {
  FeatureCard,
  ImageGridCard,
  DealCard,
  QuickPickCard,
  SectionHeader,
} from '../components/Cards.jsx'
import { getUser } from '../lib/api.js'

const FEATURED_BRUSHES = [
  { label: 'Pixel Art Starter Kit', image: 'https://picsum.photos/seed/brush1/400/400', discount: '-30%' },
  { label: 'Pro Ink Brushes', image: 'https://picsum.photos/seed/brush2/400/400', discount: '-20%' },
  { label: 'Watercolor Effects', image: 'https://picsum.photos/seed/brush3/400/400', discount: '-15%' },
  { label: 'Halftone Patterns', image: 'https://picsum.photos/seed/brush4/400/400', discount: '-40%' },
]

const DEALS = [
  { label: 'Character Builder', image: 'https://picsum.photos/seed/deal1/400/400', discount: '-50%' },
  { label: 'Tilemap Toolkit', image: 'https://picsum.photos/seed/deal2/400/400', discount: '-35%' },
  { label: 'Animation Frames Pack', image: 'https://picsum.photos/seed/deal3/400/400', discount: '-25%' },
  { label: 'Color Palette Pro', image: 'https://picsum.photos/seed/deal4/400/400', discount: '-60%' },
]

const QUICK_PICKS = [
  { label: 'Digital Art', image: 'https://picsum.photos/seed/cat1/400/400' },
  { label: 'Brushes & Presets', image: 'https://picsum.photos/seed/cat2/400/400' },
  { label: 'Templates', image: 'https://picsum.photos/seed/cat3/400/400' },
  { label: 'Tutorials', image: 'https://picsum.photos/seed/cat4/400/400' },
  { label: 'Fonts', image: 'https://picsum.photos/seed/cat5/400/400' },
  { label: 'Icons', image: 'https://picsum.photos/seed/cat6/400/400' },
]

export default function Home() {
  const user = getUser()
  const name = user?.first_name || user?.username || 'Artist'
  const firstName = name.split(' ')[0]

  return (
    <div className="min-h-screen bg-pf-bg">
      <TopNavBar />
      <SubHeaderNav />

      {/* Welcome Banner */}
      <div className="bg-pf-navy-light text-white px-4 py-2.5">
        <p className="text-sm">
          {user ? (
            <>Welcome back, <span className="font-bold">{firstName}</span>! Check out today's deals and new releases.</>
          ) : (
            <>Welcome to <span className="font-bold">OKasha Electronics</span>! Browse today's deals and new releases. <Link to="/login" className="underline hover:text-pf-orange transition-colors">Sign in</Link> for the full experience.</>
          )}
        </p>
      </div>

      {/* Main Content */}
      <main className="px-4 py-6">
        {/* Hero Banner Carousel */}
        <HeroBanner />

        {/* Quick Picks Row */}
        <div className="mt-6">
          <SectionHeader title="Shop by Category" href="/products" />
          <div className="grid grid-cols-6 gap-4">
            {QUICK_PICKS.map((pick) => (
              <QuickPickCard key={pick.label} {...pick} />
            ))}
          </div>
        </div>

        {/* 4-Column Card Grid */}
        <div className="mt-6 grid grid-cols-4 gap-4">
          {/* Card 1: Featured Feature Card */}
          <FeatureCard
            title="Trending This Week"
            image="https://picsum.photos/seed/featured/800/400"
            cta="Explore trending tools"
            href="/products"
          />

          {/* Card 2: 2x2 Image Grid */}
          <ImageGridCard
            title="Best Selling Brushes"
            items={FEATURED_BRUSHES}
          />

          {/* Card 3: Deal Card */}
          <DealCard
            title="Today's Deals"
            image="https://picsum.photos/seed/maindeal/800/800"
            discount="Up to 50% off"
            originalPrice="$49.99"
            salePrice="$24.99"
            href="/products"
          />

          {/* Card 4: Another Feature Card */}
          <FeatureCard
            title="New Arrivals"
            image="https://picsum.photos/seed/newarrivals/800/400"
            cta="Shop new releases"
            href="/products"
          />
        </div>

        {/* Second Row of Cards */}
        <div className="mt-4 grid grid-cols-4 gap-4">
          {/* Deal Card */}
          <DealCard
            title="Flash Sale"
            image="https://picsum.photos/seed/flashsale/800/800"
            discount="-40%"
            originalPrice="$39.99"
            salePrice="$23.99"
            href="/products"
          />

          {/* 2x2 Grid */}
          <ImageGridCard
            title="Top Picks for You"
            items={DEALS}
          />

          {/* Feature Card */}
          <FeatureCard
            title="Premium Templates"
            image="https://picsum.photos/seed/templates/800/400"
            cta="Browse templates"
            href="/products"
          />

          {/* Deal Card */}
          <DealCard
            title="Staff Picks"
            image="https://picsum.photos/seed/staffpicks/800/800"
            discount="-30%"
            originalPrice="$59.99"
            salePrice="$41.99"
            href="/products"
          />
        </div>

        {/* Banner CTA */}
        <div className="mt-6 bg-gradient-to-r from-pf-navy to-pf-navy-light rounded-md p-6 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-white text-xl font-bold mb-1">Ready to create something amazing?</h3>
            <p className="text-gray-300 text-sm">
              Get access to thousands of premium brushes, templates, and tools.
            </p>
          </div>
          <Link
            to="/products"
            className="bg-pf-orange hover:bg-pf-orange-hover text-pf-navy font-bold px-6 py-2.5 rounded-full transition-all hover:scale-105 shrink-0 shadow-lg"
          >
            Start Creating
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-pf-navy-light text-white mt-8">
        <div className="px-4 py-6">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-full bg-pf-navy-light/80 hover:bg-pf-navy-light text-gray-300 text-sm py-3 mb-6 rounded-md transition-colors"
          >
            Back to top
          </button>
          <div className="grid grid-cols-4 gap-6 text-sm">
            <div>
              <h4 className="font-bold mb-3">Get to Know Us</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/products" className="hover:underline">About OKasha Electronics</Link></li>
                <li><Link to="/products" className="hover:underline">Careers</Link></li>
                <li><Link to="/products" className="hover:underline">Press Releases</Link></li>
                <li><Link to="/products" className="hover:underline">OKasha Electronics Science</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Make Money with Us</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/products" className="hover:underline">Sell on OKasha Electronics</Link></li>
                <li><Link to="/products" className="hover:underline">Affiliate Program</Link></li>
                <li><Link to="/products" className="hover:underline">Advertise</Link></li>
                <li><Link to="/products" className="hover:underline">Self-Publish</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Payment</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/products" className="hover:underline">Business Card</Link></li>
                <li><Link to="/products" className="hover:underline">Shop with Points</Link></li>
                <li><Link to="/products" className="hover:underline">Reload Balance</Link></li>
                <li><Link to="/products" className="hover:underline">Currency Converter</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Let Us Help You</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/products" className="hover:underline">Your Account</Link></li>
                <li><Link to="/products" className="hover:underline">Your Orders</Link></li>
                <li><Link to="/products" className="hover:underline">Shipping Rates</Link></li>
                <li><Link to="/products" className="hover:underline">Help</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-600 mt-6 pt-6 text-center text-gray-400 text-xs">
            &copy; {new Date().getFullYear()} OKasha Electronics. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
