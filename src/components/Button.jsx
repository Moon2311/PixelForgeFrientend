import { useState } from 'react'

export default function Button({
  type = 'button',
  variant = 'primary',
  size = '',
  className = '',
  loading = false,
  disabled = false,
  onClick,
  children,
}) {
  const [ripples, setRipples] = useState([])

  const handleClick = (e) => {
    if (loading || disabled) return
    const rect = e.currentTarget.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const id = `${Date.now()}-${Math.random()}`
    const ripple = {
      id,
      size,
      x: e.clientX - rect.left - size / 2,
      y: e.clientY - rect.top - size / 2,
    }
    setRipples((prev) => [...prev, ripple])
    onClick?.(e)
  }

  return (
    <button
      type={type}
      className={`btn btn-${variant}${size ? ` btn-${size}` : ''}${className ? ` ${className}` : ''}${loading ? ' loading' : ''}`}
      disabled={disabled || loading}
      onClick={handleClick}
    >
      <span className="btn-spinner" />
      <span className="btn-text">{children}</span>
      {ripples.map((r) => (
        <span
          key={r.id}
          className="btn-ripple"
          style={{
            width: r.size,
            height: r.size,
            left: r.x,
            top: r.y,
          }}
          onAnimationEnd={() =>
            setRipples((prev) => prev.filter((x) => x.id !== r.id))
          }
        />
      ))}
    </button>
  )
}
