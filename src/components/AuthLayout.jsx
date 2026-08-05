import { Logo } from './Icons.jsx'
import ThemeToggle from './ThemeToggle.jsx'

export default function AuthLayout({ title, subtitle, quote, children }) {
  return (
    <div className="auth-page">
      <ThemeToggle />
      <div className="auth-left">
        <div className="blob" />
        <div className="blob" />
        <div className="blob" />
        <div className="auth-brand">
          <div className="auth-brand-logo">
            <Logo size={32} />
          </div>
          <h1>PixelForge</h1>
          <p>Create stunning pixel art with powerful tools and an intuitive interface.</p>
          <div className="brand-quote">
            <p>{quote}</p>
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <div className="mobile-logo">
              <Logo size={24} />
            </div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
