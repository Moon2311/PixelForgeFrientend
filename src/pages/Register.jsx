import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import InputField from '../components/InputField.jsx'
import Button from '../components/Button.jsx'
import PasswordStrength from '../components/PasswordStrength.jsx'
import { EmailIcon, LockIcon, UserIcon, UsernameIcon, GoogleIcon, GithubIcon } from '../components/Icons.jsx'
import { useToast } from '../context/useToast.js'
import { getApiBaseUrl } from '../lib/api.js'
import { validateEmail } from '../lib/validation.js'

export default function Register() {
  const navigate = useNavigate()
  const showToast = useToast()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [terms, setTerms] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const setFieldError = (field) => (e) => {
    const setter = {
      fullName: setFullName,
      email: setEmail,
      username: setUsername,
      password: setPassword,
      confirmPassword: setConfirmPassword,
    }[field]
    setter(e.target.value)
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!fullName.trim()) next.fullName = 'Full name is required'
    if (!email || !validateEmail(email)) next.email = 'Please enter a valid email'
    if (!password) next.password = 'Password is required'
    else if (password.length < 8) next.password = 'At least 8 characters required'
    if (!confirmPassword) next.confirmPassword = 'Please confirm your password'
    else if (password !== confirmPassword) next.confirmPassword = 'Passwords do not match'
    if (!terms) showToast('Please agree to the Terms of Service and Privacy Policy', 'error')
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setLoading(true)
    try {
      const baseUrl = getApiBaseUrl()
      const nameParts = fullName.trim().split(/\s+/)
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(' ')

      const response = await fetch(`${baseUrl}/api/auth/register/buyer/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          username: username || email.split('@')[0],
          password,
          confirm_password: confirmPassword,
        }),
      })
      const data = await response.json()
      if (response.ok) {
        showToast('Account created! Redirecting to login...')
        setTimeout(() => navigate('/login'), 2000)
      } else {
        const FIELD_MAP = { confirm_password: 'confirmPassword', non_field_errors: 'form' }
        const fieldErrors = {}
        let fallback = ''

        if (data && typeof data === 'object' && !Array.isArray(data)) {
          Object.entries(data).forEach(([field, err]) => {
            const first = Array.isArray(err) ? err[0] : err
            if (typeof first !== 'string') return
            if (FIELD_MAP[field] === 'form') fallback = first
            else fieldErrors[FIELD_MAP[field] || field] = first
          })
        }

        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors)
          if (fallback) showToast(fallback, 'error')
        } else {
          showToast(
            data.message || data.error || fallback || 'Registration failed. Please try again.',
            'error',
          )
        }
      }
    } catch {
      showToast('Connection error. Please check that the server is running.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start building your pixel art portfolio"
      quote='"Start your pixel art journey today — it&apos;s free and takes only a minute."'
    >
      <form onSubmit={handleSubmit} noValidate>
        <InputField
          id="fullName"
          name="fullName"
          type="text"
          label="Full name"
          value={fullName}
          onChange={setFieldError('fullName')}
          icon={<UserIcon />}
          error={errors.fullName}
          required
          autoComplete="name"
        />
        <InputField
          id="email"
          name="email"
          type="email"
          label="Email address"
          value={email}
          onChange={setFieldError('email')}
          icon={<EmailIcon />}
          error={errors.email}
          required
          autoComplete="email"
        />
        <InputField
          id="username"
          name="username"
          type="text"
          label="Username (optional)"
          value={username}
          onChange={setFieldError('username')}
          icon={<UsernameIcon />}
          error={errors.username}
          autoComplete="username"
        />
        <InputField
          id="password"
          name="password"
          type="password"
          label="Password"
          value={password}
          onChange={setFieldError('password')}
          icon={<LockIcon />}
          error={errors.password}
          required
          autoComplete="new-password"
          toggleable
        />
        {password && <PasswordStrength value={password} />}
        <InputField
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm password"
          value={confirmPassword}
          onChange={setFieldError('confirmPassword')}
          icon={<LockIcon />}
          error={errors.confirmPassword}
          required
          autoComplete="new-password"
          toggleable
        />
        <div className="terms-group">
          <input
            type="checkbox"
            id="terms"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
          />
          <label htmlFor="terms">
            I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
          </label>
        </div>
        <Button type="submit" loading={loading}>
          Create account
        </Button>
      </form>
      <div className="divider">or continue with</div>
      <div className="social-buttons">
        <Button variant="social" onClick={() => showToast('Google sign-up coming soon', 'info')}>
          <GoogleIcon />
          <span>Google</span>
        </Button>
        <Button variant="social" onClick={() => showToast('GitHub sign-up coming soon', 'info')}>
          <GithubIcon />
          <span>GitHub</span>
        </Button>
      </div>
      <div className="auth-footer">
        Already have an account? <Link to="/login">Sign in</Link>
      </div>
    </AuthLayout>
  )
}
