import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import InputField from '../components/InputField.jsx'
import Button from '../components/Button.jsx'
import PasswordStrength from '../components/PasswordStrength.jsx'
import { LockIcon, SuccessIcon } from '../components/Icons.jsx'
import { useToast } from '../context/useToast.js'
import { getApiBaseUrl } from '../lib/api.js'

export default function ResetPassword() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [searchParams] = useSearchParams()

  const uid = searchParams.get('uid') || searchParams.get('user_id')
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const missingLink = !uid || !token

  useEffect(() => {
    if (missingLink) {
      showToast('Invalid or missing reset link. Please request a new one.', 'error')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missingLink])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!password) next.password = 'Password is required'
    else if (password.length < 8) next.password = 'At least 8 characters required'
    if (!confirmPassword) next.confirmPassword = 'Please confirm your password'
    else if (password !== confirmPassword) next.confirmPassword = 'Passwords do not match'
    setErrors(next)
    if (Object.keys(next).length > 0) return
    if (!uid || !token) return
    setLoading(true)
    try {
      const baseUrl = getApiBaseUrl()
      const response = await fetch(`${baseUrl}/api/auth/reset-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: uid,
          token,
          new_password: password,
          confirm_password: confirmPassword,
        }),
      })
      const data = await response.json()
      if (response.ok) {
        setSuccess(true)
        showToast('Password reset successfully!')
        setTimeout(() => navigate('/login'), 3000)
      } else {
        showToast(data.message || data.error || 'Failed to reset password', 'error')
      }
    } catch {
      showToast('Connection error. Please check that the server is running.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Set new password"
      subtitle="Must be at least 8 characters"
      quote='"A strong password is your first line of defense. Make it count."'
    >
      {success ? (
        <div className="success-state">
          <div className="success-icon">
            <SuccessIcon />
          </div>
          <h3>Password reset successful!</h3>
          <p>Your password has been updated. You'll be redirected to sign in shortly.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <InputField
            id="password"
            name="password"
            type="password"
            label="New password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setErrors((prev) => ({ ...prev, password: '' }))
            }}
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
            label="Confirm new password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              setErrors((prev) => ({ ...prev, confirmPassword: '' }))
            }}
            icon={<LockIcon />}
            error={errors.confirmPassword}
            required
            autoComplete="new-password"
            toggleable
          />
          <Button type="submit" loading={loading}>
            Reset password
          </Button>
        </form>
      )}
      <div className="auth-footer">
        <Link to="/login">Back to sign in</Link>
      </div>
    </AuthLayout>
  )
}
