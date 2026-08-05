import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import InputField from '../components/InputField.jsx'
import Button from '../components/Button.jsx'
import { EmailIcon, SuccessIcon } from '../components/Icons.jsx'
import { useToast } from '../context/useToast.js'
import { getApiBaseUrl } from '../lib/api.js'
import { validateEmail } from '../lib/validation.js'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const showToast = useToast()

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !validateEmail(email)) {
      setError('Please enter a valid email')
      return
    }
    setError('')
    setLoading(true)

    try {
      const baseUrl = getApiBaseUrl()
      const response = await fetch(`${baseUrl}/api/auth/forgot-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      if (response.ok) {
        const { user_id: userId, token } = data.data || {}
        if (userId && token) {
          showToast('Reset link generated. Redirecting...')
          setTimeout(() => {
            navigate(`/reset-password?uid=${userId}&token=${encodeURIComponent(token)}`)
          }, 1200)
        } else {
          setSuccess(true)
          showToast('Reset link sent! Check your email.')
        }
      } else {
        showToast(data.message || data.error || 'Failed to send reset link', 'error')
      }
    } catch {
      showToast('Connection error. Please check that the server is running.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="No worries — enter your email and we'll send you a reset link"
      quote='"Security and simplicity — we&apos;ll have you back to creating in no time."'
    >
      {success ? (
        <div className="success-state">
          <div className="success-icon">
            <SuccessIcon />
          </div>
          <h3>Check your email</h3>
          <p>If your email is registered, we've sent a password reset link. It should arrive in a few moments.</p>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setSuccess(false)
              setEmail('')
            }}
          >
            Send another link
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <InputField
            id="email"
            name="email"
            type="email"
            label="Email address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError('')
            }}
            icon={<EmailIcon />}
            error={error}
            required
            autoComplete="email"
          />
          <Button type="submit" loading={loading}>
            Send reset link
          </Button>
        </form>
      )}
      <div className="auth-footer">
        <Link to="/login">Back to sign in</Link>
      </div>
    </AuthLayout>
  )
}
