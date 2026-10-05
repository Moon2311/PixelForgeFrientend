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

export function getRefreshToken() {
  return localStorage.getItem('refresh_token') || ''
}

export function setRefreshToken(token) {
  if (token) localStorage.setItem('refresh_token', token)
  else localStorage.removeItem('refresh_token')
}

export function authHeaders() {
  const token = getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function clearSession() {
  localStorage.removeItem('user')
  setAccessToken('')
  setRefreshToken('')
  window.dispatchEvent(new Event('auth-expired'))
  window.dispatchEvent(new Event('cart-updated'))
}

// One refresh at a time: concurrent 401s share the same request.
let refreshPromise = null

// Trade the refresh token for a new token pair. Resolves to true on success;
// on failure the session is cleared and the user has to log in again.
export function refreshAccessToken() {
  if (refreshPromise) return refreshPromise
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    clearSession()
    return Promise.resolve(false)
  }
  refreshPromise = fetch(`${getApiBaseUrl()}/api/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
    .then(async (response) => {
      if (!response.ok) {
        clearSession()
        return false
      }
      const result = await response.json()
      setAccessToken(result.data?.access_token)
      setRefreshToken(result.data?.refresh_token)
      return true
    })
    // Network error: keep the tokens so a later request can retry.
    .catch(() => false)
    .finally(() => {
      refreshPromise = null
    })
  return refreshPromise
}

// fetch() with the Bearer token attached. When the access token has expired
// (401), it is refreshed once and the request retried.
export async function authFetch(url, init = {}) {
  const send = () =>
    fetch(url, { ...init, headers: { ...init.headers, ...authHeaders() } })
  const response = await send()
  if (response.status !== 401 || !getAccessToken()) return response
  return (await refreshAccessToken()) ? send() : response
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
  setAccessToken('')
  setRefreshToken('')
}
