import { authHeaders, getCartApiBaseUrl } from './api.js'

const CART_API_BASE = getCartApiBaseUrl()

export class CartApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'CartApiError'
    this.status = status
    this.data = data
  }
}

async function request(path, { method = 'GET', body } = {}) {
  let response
  try {
    response = await fetch(`${CART_API_BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new CartApiError(
      `Could not reach the cart service. Check that cart-service is running.`,
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
    throw new CartApiError(
      result?.message || `Request failed (${response.status})`,
      response.status,
      result?.data,
    )
  }
  return result
}

export function getCart() {
  return request('/api/cart/')
}

export function addToCart(productId, quantity = 1) {
  return request('/api/cart/items/', {
    method: 'POST',
    body: { product_id: productId, quantity },
  })
}

export function updateCartItem(itemId, quantity) {
  return request(`/api/cart/items/${itemId}/`, {
    method: 'PATCH',
    body: { quantity },
  })
}

export function removeCartItem(itemId) {
  return request(`/api/cart/items/${itemId}/`, {
    method: 'DELETE',
  })
}

export function clearCart() {
  return request('/api/cart/', {
    method: 'DELETE',
  })
}
