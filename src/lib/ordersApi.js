import { authFetch, getApiBaseUrl } from './api.js'
import { queryString } from './productsApi.js'

export class OrderApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'OrderApiError'
    this.status = status
    this.data = data
  }
}

export async function request(path, { method = 'GET', body } = {}) {
  let response
  try {
    response = await authFetch(`${getApiBaseUrl()}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new OrderApiError(
      `Could not reach the server at ${getApiBaseUrl()}. Check your connection and try again.`,
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
    throw new OrderApiError(
      result?.message || `Request failed (${response.status})`,
      response.status,
      result?.data,
    )
  }
  return result?.data
}

export function getCheckoutOptions() {
  return request('/api/orders/checkout-options/')
}

export function placeOrder(payload) {
  return request('/api/orders/', { method: 'POST', body: payload })
}

export function getOrder(number) {
  return request(`/api/orders/${encodeURIComponent(number)}/`)
}

export function listMyOrders() {
  return request('/api/orders/')
}

// Admin: all orders with their buyers. Filters: user_id, status, q.
export function adminListOrders(params = {}) {
  return request(`/api/orders/admin/orders/${queryString(params)}`)
}

// Admin: who bought a product, plus units sold and revenue.
export function getProductSales(productId) {
  return request(`/api/orders/admin/products/${productId}/sales/`)
}

export const ORDER_STATUS_LABELS = {
  pending: 'Pending',
  awaiting_payment: 'Awaiting payment',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const PAYMENT_LABELS = {
  cod: 'Cash on Delivery (COD)',
  bank_deposit: 'Bank Deposit',
  jazzcash: 'JazzCash',
  easypaisa: 'Easypaisa',
}

// Order payment methods paid online through /api/payments/.
export const ONLINE_PAYMENT_METHODS = ['jazzcash', 'easypaisa']

// Orders with these methods can still be paid online while awaiting payment.
export const PAYABLE_ONLINE_METHODS = ['bank_deposit', ...ONLINE_PAYMENT_METHODS]
