// Price formatting helpers for storefront components.

export function formatMoney(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return ''
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export function discountPercent(product) {
  const price = Number(product.price)
  const sale = Number(product.discount_price)
  if (!product.discount_price || !price || sale >= price) return 0
  return Math.round((1 - sale / price) * 100)
}
