import { authHeaders, getProductsApiBaseUrl } from './api.js'

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
    response = await fetch(`${getProductsApiBaseUrl()}${path}`, {
      method,
      headers: { ...headers },
      body,
    })
  } catch {
    throw new ApiError(
      `Could not reach the products API at ${getProductsApiBaseUrl()}. Check that the product-service is running on port 8002.`,
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

function queryString(params) {
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
    headers: { ...authHeaders() },
    body: formData,
  })
}

export function updateProduct(id, formData) {
  return request(`/api/products/${id}/`, {
    method: 'PUT',
    headers: { ...authHeaders() },
    body: formData,
  })
}

export function deleteProduct(id) {
  return request(`/api/products/${id}/`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  })
}

export function updateStock(id, payload) {
  return request(`/api/products/${id}/stock/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  })
}

export function getStockHistory(id) {
  return request(`/api/products/${id}/stock/history/`, {
    headers: { ...authHeaders() },
  })
}

export function getInventoryLogs(params = {}) {
  return request(`/api/products/inventory/logs/${queryString(params)}`, {
    headers: { ...authHeaders() },
  })
}

export function getLowStockAlerts(params = {}) {
  return request(`/api/products/inventory/low-stock/${queryString(params)}`, {
    headers: { ...authHeaders() },
  })
}

export function resolveLowStockAlert(id) {
  return request(`/api/products/inventory/low-stock/${id}/resolve/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: '{}',
  })
}
