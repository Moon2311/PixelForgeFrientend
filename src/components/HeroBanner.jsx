import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { categoryImage } from '../lib/catalog.js'

const SLIDES = [
  {
    id: 1,
    eyebrow: 'New arrivals',
    title: 'The latest smartphones, all in one place',
    subtitle: 'Flagship cameras, all-day batteries and blazing-fast chips.',
    cta: 'Shop smartphones',
    gradient: 'from-[#0f2027] via-[#203a43] to-[#2c5364]',
    image: categoryImage('Smartphones'),
  },
  {
    id: 2,
    eyebrow: 'Limited-time deal',
    title: 'Up to 30% off laptops',
    subtitle: 'Power through work and play with our best-selling notebooks.',
    cta: 'See laptop deals',
    gradient: 'from-[#232526] to-[#414345]',
    image: categoryImage('Laptops'),
  },
  {
    id: 3,
    eyebrow: 'Sound, perfected',
    title: 'Noise-cancelling headphones',
    subtitle: 'Immerse yourself in music with premium wireless audio.',
    cta: 'Shop audio',
    gradient: 'from-[#b45309] to-[#f59e0b]',
    image: categoryImage('Audio'),
  },
  {
    id: 4,
    eyebrow: 'Level up',
    title: 'Next-gen gaming is here',
    subtitle: 'Consoles, controllers and accessories for every player.',
    cta: 'Explore gaming',
    gradient: 'from-[#1e3a8a] to-[#6366f1]',
    image: categoryImage('Gaming'),
  },
]

export default function HeroBanner() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length)
  }, [])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)
  }, [])

  useEffect(() => {
    if (paused) return
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next, paused])

  return (
    <section
      className="relative w-full overflow-hidden h-[240px] sm:h-[400px] lg:h-[520px]"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {SLIDES.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-transform duration-700 ease-in-out bg-gradient-to-r ${slide.gradient}`}
          style={{ transform: `translateX(${(i - current) * 100}%)` }}
          aria-hidden={i !== current}
        >
          <div className="mx-auto max-w-[1500px] h-full flex items-start justify-between pt-6 sm:pt-12 lg:pt-14 px-12 md:px-20 gap-8">
            <div className="flex-1 max-w-2xl">
              <p className="text-pf-yellow text-xs sm:text-sm font-bold uppercase tracking-wider mb-2">
                {slide.eyebrow}
              </p>
              <h2 className="text-white text-2xl sm:text-3xl lg:text-[2.75rem] font-extrabold leading-tight mb-3">
                {slide.title}
              </h2>
              <p className="hidden sm:block text-white/85 text-base lg:text-lg mb-6">
                {slide.subtitle}
              </p>
              <Link
                to="/products"
                tabIndex={i === current ? 0 : -1}
                className="inline-block bg-pf-cta hover:bg-pf-cta-hover text-pf-text hover:text-pf-text font-medium text-sm px-6 py-2.5 rounded-full shadow-md"
              >
                {slide.cta}
              </Link>
            </div>
            <img
              src={slide.image}
              alt=""
              className="hidden md:block w-52 lg:w-64 shrink-0 aspect-square object-cover rounded-2xl shadow-2xl ring-4 ring-white/10 rotate-2"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={prev}
        className="absolute left-0 top-0 h-2/3 w-12 md:w-16 text-white/80 hover:text-white flex items-center justify-center z-10 cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
        aria-label="Previous slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        type="button"
        onClick={next}
        className="absolute right-0 top-0 h-2/3 w-12 md:w-16 text-white/80 hover:text-white flex items-center justify-center z-10 cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
        aria-label="Next slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Fade into the page background so the card row can overlap the banner. */}
      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-40 bg-gradient-to-t from-pf-bg via-pf-bg/60 to-transparent pointer-events-none" />

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10 sm:hidden">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all ${i === current ? 'w-5 bg-pf-text' : 'w-2 bg-pf-text/30'}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
