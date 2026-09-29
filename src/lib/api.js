// The backend is a single Django modular monolith: auth, catalog, search and
// cart are all served from one host.
const DEFAULT_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Per-service overrides from the old microservice setup (ports 8001-8003).
const LEGACY_BASE_URL_KEYS = ['products_api_base_url', 'cart_api_base_url']
try {
  LEGACY_BASE_URL_KEYS.forEach((key) => localStorage.removeItem(key))
} catch {
  // storage unavailable
}

export function getApiBaseUrl() {
  const stored = localStorage.getItem('api_base_url')
  const valid =
    stored && /^https?:\/\/.+/i.test(stored) && !/:800[1-3](\/|$)/.test(stored)
      ? stored.replace(/\/+$/, '')
      : ''
  return (valid || DEFAULT_API_BASE_URL).replace(/\/+$/, '')
}

export function getAccessToken() {
  return localStorage.getItem('access_token') || ''
}

export function setAccessToken(token) {
  if (token) localStorage.setItem('access_token', token)
  else localStorage.removeItem('access_token')
}

export function authHeaders() {
  const token = getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function getUser() {
  const stored = localStorage.getItem('user')
  if (!stored) return null
  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export function isAdminUser() {
  const user = getUser()
  return Boolean(user && user.role === 'admin')
}

export function signOut() {
  // Tokens are stateless; this only ends the Django session server-side.
  fetch(`${getApiBaseUrl()}/api/auth/logout/`, {
    method: 'POST',
    credentials: 'include',
    headers: { ...authHeaders() },
  }).catch(() => {})
  localStorage.removeItem('user')
  localStorage.removeItem('access_token')
}
