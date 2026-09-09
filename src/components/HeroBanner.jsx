import { useState, useEffect, useCallback } from 'react'

const SLIDES = [
  {
    id: 1,
    title: 'Create Stunning Pixel Art',
    subtitle: 'Professional brushes, infinite canvases, and powerful tools.',
    cta: 'Explore Tools',
    gradient: 'from-[#667eea] to-[#764ba2]',
    accent: '#FF9900',
  },
  {
    id: 2,
    title: 'Up to 50% Off Pro Brushes',
    subtitle: 'Limited time sale on premium brush packs for all skill levels.',
    cta: 'Shop Now',
    gradient: 'from-[#f093fb] to-[#f5576c]',
    accent: '#FF9900',
  },
  {
    id: 3,
    title: 'New: AI-Powered Templates',
    subtitle: 'Generate pixel art bases with our new AI template engine.',
    cta: 'Try Free',
    gradient: 'from-[#4facfe] to-[#00f2fe]',
    accent: '#FF9900',
  },
  {
    id: 4,
    title: 'Join 50K+ Artists',
    subtitle: 'Share your creations, get feedback, and grow your portfolio.',
    cta: 'Join Now',
    gradient: 'from-[#43e97b] to-[#38f9d7]',
    accent: '#FF9900',
  },
]

export default function HeroBanner() {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length)
  }, [])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  return (
    <div className="relative w-full overflow-hidden rounded-md" style={{ aspectRatio: '3/1' }}>
      {/* Slides */}
      {SLIDES.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-transform duration-500 ease-in-out bg-gradient-to-r ${slide.gradient}`}
          style={{ transform: `translateX(${(i - current) * 100}%)` }}
        >
          <div className="flex flex-col justify-center h-full px-8 md:px-16 max-w-2xl">
            <h2 className="text-white text-2xl md:text-4xl font-extrabold leading-tight mb-3 drop-shadow-lg">
              {slide.title}
            </h2>
            <p className="text-white/90 text-sm md:text-lg mb-5 leading-relaxed drop-shadow">
              {slide.subtitle}
            </p>
            <button
              type="button"
              className="self-start bg-pf-orange hover:bg-pf-orange-hover text-pf-navy font-bold text-sm md:text-base px-6 py-2.5 rounded-full transition-all hover:scale-105 shadow-lg"
            >
              {slide.cta}
            </button>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        type="button"
        onClick={prev}
        className="absolute left-0 top-0 bottom-0 w-12 md:w-16 bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors z-10"
        aria-label="Previous slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        type="button"
        onClick={next}
        className="absolute right-0 top-0 bottom-0 w-12 md:w-16 bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors z-10"
        aria-label="Next slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i === current ? 'bg-pf-orange scale-125' : 'bg-white/60 hover:bg-white/90'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Fade overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-pf-bg to-transparent pointer-events-none" />
    </div>
  )
}
