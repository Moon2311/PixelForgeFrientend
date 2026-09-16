import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import InputField from '../components/InputField.jsx'
import Button from '../components/Button.jsx'
import { EmailIcon, LockIcon, GoogleIcon, GithubIcon } from '../components/Icons.jsx'
import { useToast } from '../context/useToast.js'
import { useCart } from '../context/CartContext.jsx'
import { getApiBaseUrl, setAccessToken } from '../lib/api.js'
import { addToCart } from '../lib/cartApi.js'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const showToast = useToast()
  const { mergeGuestCartToServer } = useCart()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const remembered = localStorage.getItem('remembered_email')
    if (remembered) {
      setEmail(remembered)
      setRemember(true)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!email) next.email = 'Email or username is required'
    if (!password) next.password = 'Password is required'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setLoading(true)
    try {
      const baseUrl = getApiBaseUrl()
      const response = await fetch(`${baseUrl}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      })
      const result = await response.json()
      if (response.ok) {
        const user = result.data?.user || result.data
        const token = result.data?.access_token
        localStorage.setItem('user', JSON.stringify(user))
        setAccessToken(token)
        if (remember) {
          localStorage.setItem('remembered_email', email)
        } else {
          localStorage.removeItem('remembered_email')
        }
        showToast('Welcome back! Redirecting...')

        // Merge guest cart into server cart
        await mergeGuestCartToServer()

        // Resolve pending action (e.g., add-to-cart that triggered the login)
        const pending = sessionStorage.getItem('pending_action')
        if (pending) {
          try {
            const action = JSON.parse(pending)
            if (action.type === 'add_to_cart' && action.productId) {
              await addToCart(action.productId, 1)
              window.dispatchEvent(new Event('cart-updated'))
            }
          } catch {
            // best-effort
          }
          sessionStorage.removeItem('pending_action')
        }

        const returnTo = location.state?.returnTo
        const dest = user?.role === 'admin' && !returnTo ? '/admin' : returnTo || '/'
        setTimeout(() => navigate(dest, { replace: true }), 1000)
      } else {
        showToast(result.message || result.error || 'Invalid email or password', 'error')
      }
    } catch {
      showToast(`Connection error. Could not reach ${getApiBaseUrl()}. Check that the server is running.`, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
      quote='"The best tool for pixel artists who demand precision and creative freedom."'
    >
      <form onSubmit={handleSubmit} noValidate>
        <InputField
          id="email"
          name="email"
          type="text"
          label="Email or username"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setErrors((prev) => ({ ...prev, email: '' }))
          }}
          icon={<EmailIcon />}
          error={errors.email}
          required
          autoComplete="username"
        />
        <InputField
          id="password"
          name="password"
          type="password"
          label="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setErrors((prev) => ({ ...prev, password: '' }))
          }}
          icon={<LockIcon />}
          error={errors.password}
          required
          autoComplete="current-password"
          toggleable
        />
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>Remember me</span>
          </label>
          <Link to="/forgot-password" className="forgot-link">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" loading={loading}>
          Sign in
        </Button>
      </form>
      <div className="divider">or continue with</div>
      <div className="social-buttons">
        <Button variant="social" onClick={() => showToast('Google sign-in coming soon', 'info')}>
          <GoogleIcon />
          <span>Google</span>
        </Button>
        <Button variant="social" onClick={() => showToast('GitHub sign-in coming soon', 'info')}>
          <GithubIcon />
          <span>GitHub</span>
        </Button>
      </div>
      <div className="auth-footer">
        Don&apos;t have an account? <Link to="/register">Create one</Link>
      </div>
      <div className="auth-footer" style={{ marginTop: '-0.25rem' }}>
        <Link to={sessionStorage.getItem('last_public_path') || '/'} className="guest-link">
          Continue as guest
        </Link>
      </div>
    </AuthLayout>
  )
}
