import { request } from './ordersApi.js'

// Order payment method -> the payments API's method name.
const PROVIDER = { jazzcash: 'JAZZCASH', easypaisa: 'EASYPAISA' }

// Start paying an order. The amount is taken from the order on the server.
// Calling it again while the attempt is open returns the same payment.
export function createPayment(orderNumber, method) {
  return request('/api/payments/create/', {
    method: 'POST',
    body: { order_id: orderNumber, payment_method: PROVIDER[method] || method },
  })
}

// The payment's verified status; the server re-checks open payments with
// the provider.
export function getPayment(paymentId) {
  return request(`/api/payments/${encodeURIComponent(paymentId)}/`)
}

export const FINAL_PAYMENT_STATUSES = ['PAID', 'FAILED', 'CANCELLED', 'EXPIRED', 'REFUNDED']

// Hand the browser to the provider: submit the checkout fields to its page.
export function redirectToProvider(checkout) {
  const form = document.createElement('form')
  form.method = checkout.method || 'POST'
  form.action = checkout.url
  Object.entries(checkout.fields || {}).forEach(([name, value]) => {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = value ?? ''
    form.appendChild(input)
  })
  document.body.appendChild(form)
  form.submit()
}

// Start (or resume) the payment and leave for the provider's page.
export async function payOrder(orderNumber, method) {
  const payment = await createPayment(orderNumber, method)
  redirectToProvider(payment.checkout)
  return payment
}
