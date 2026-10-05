import { authFetch, getApiBaseUrl } from './api.js'

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function request(path, { method = 'GET', headers = {}, body } = {}) {
  let response
  try {
    response = await authFetch(`${getApiBaseUrl()}${path}`, {
      method,
      headers: { ...headers },
      body,
    })
  } catch {
    throw new ApiError(
      `Could not reach the products API at ${getApiBaseUrl()}. Check that the PixelForge backend is running on port 8000.`,
      0,
    )
  }

  let result = null
  try {
    result = await response.json()
  } catch {
    result = null
  }

  if (!response.ok) {
    throw new ApiError(
      result?.message || `Request failed (${response.status})`,
      response.status,
      result?.data,
    )
  }
  return result?.data
}

export function queryString(params) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') qs.set(key, value)
  })
  const query = qs.toString()
  return query ? `?${query}` : ''
}

export function listProducts(params = {}) {
  return request(`/api/products/${queryString(params)}`)
}

export function getProduct(id) {
  return request(`/api/products/${id}/`)
}

export function getMeta() {
  return request('/api/products/meta/')
}

export function createProduct(formData) {
  return request('/api/products/', {
    method: 'POST',
    body: formData,
  })
}

export function updateProduct(id, formData) {
  return request(`/api/products/${id}/`, {
    method: 'PUT',
    body: formData,
  })
}

export function deleteProduct(id) {
  return request(`/api/products/${id}/`, {
    method: 'DELETE',
  })
}

export function updateStock(id, payload) {
  return request(`/api/products/${id}/stock/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function getStockHistory(id) {
  return request(`/api/products/${id}/stock/history/`, {
  })
}

export function getInventoryLogs(params = {}) {
  return request(`/api/products/inventory/logs/${queryString(params)}`, {
  })
}

export function getLowStockAlerts(params = {}) {
  return request(`/api/products/inventory/low-stock/${queryString(params)}`, {
  })
}

export function resolveLowStockAlert(id) {
  return request(`/api/products/inventory/low-stock/${id}/resolve/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  })
}
