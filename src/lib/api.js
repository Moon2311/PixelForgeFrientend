const DEFAULT_API_BASE_URL = 'http://localhost:8001'
const DEFAULT_PRODUCTS_API_BASE_URL = 'http://localhost:8002'

export function getApiBaseUrl() {
  const stored = localStorage.getItem('api_base_url')
  const valid =
    stored && /^https?:\/\/.+/i.test(stored) ? stored.replace(/\/+$/, '') : ''
  return valid || DEFAULT_API_BASE_URL
}

export function getProductsApiBaseUrl() {
  const stored = localStorage.getItem('products_api_base_url')
  const valid =
    stored && /^https?:\/\/.+/i.test(stored) ? stored.replace(/\/+$/, '') : ''
  return valid || DEFAULT_PRODUCTS_API_BASE_URL
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
  localStorage.removeItem('user')
  localStorage.removeItem('access_token')
}
