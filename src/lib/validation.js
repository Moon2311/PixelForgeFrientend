export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validateField(input, compareWith) {
  const { name, value, required } = input
  const trimmed = typeof value === 'string' ? value.trim() : value

  if (required && !trimmed) {
    return 'This field is required'
  }
  if (name === 'email' && trimmed && !validateEmail(trimmed)) {
    return 'Please enter a valid email'
  }
  if (name === 'confirmPassword' && compareWith && value !== compareWith) {
    return 'Passwords do not match'
  }
  if (name === 'password' && trimmed && trimmed.length < 8) {
    return 'At least 8 characters required'
  }
  return ''
}

export function passwordStrength(value) {
  let score = 0
  if (value.length >= 8) score++
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++
  if (/\d/.test(value)) score++
  if (/[^a-zA-Z0-9]/.test(value)) score++
  return score
}

export const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']
