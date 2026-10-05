import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import StoreLayout from '../components/StoreLayout.jsx'
import { getAccessToken } from '../lib/api.js'
import { formatMoney } from '../lib/format.js'
import { getCheckoutOptions, getOrder, ONLINE_PAYMENT_METHODS, PAYABLE_ONLINE_METHODS, PAYMENT_LABELS } from '../lib/ordersApi.js'
import { payOrder } from '../lib/paymentsApi.js'

const PAYMENT_NOTE = {
  cod: 'Please keep the exact amount ready. You will pay in cash when your order is delivered.',
  bank_deposit: 'Your order will be confirmed once your bank deposit is received.',
  jazzcash: 'Paid online with JazzCash.',
  easypaisa: 'Paid online with Easypaisa.',
}

// An order awaiting payment (online or bank deposit): pick JazzCash or
// Easypaisa and go to the provider. Safe to press again; the server reuses
// an open payment.
function PayNowPanel({ order }) {
  const [methods, setMethods] = useState(null)
  const [method, setMethod] = useState(order.payment_method)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getCheckoutOptions()
      .then((options) => {
        const online = options.payment_methods.filter((m) => ONLINE_PAYMENT_METHODS.includes(m.code))
        setMethods(online)
        setMethod((current) => (online.some((m) => m.code === current) ? current : online[0]?.code))
      })
      .catch(() => setMethods([]))
  }, [])

  const pay = async () => {
    if (busy || !method) return
    setBusy(true)
    setError('')
    try {
      await payOrder(order.number, method)
    } catch (err) {
      setError(err.message || 'Could not start the payment. Please try again.')
      setBusy(false)
    }
  }

  return (
    <div className="rounded-md border border-[#1773b0] bg-blue-50/40 p-4 text-sm space-y-3">
      <div>
        <p className="font-semibold">{order.payment_method === 'bank_deposit' ? 'Pay online instead' : 'Payment pending'}</p>
        <p className="text-pf-text-light">
          {order.payment_method === 'bank_deposit'
            ? 'Skip the bank deposit and pay now with JazzCash or Easypaisa.'
            : 'Your order will be confirmed once the payment is completed.'}
        </p>
      </div>
      {methods === null ? (
        <div className="h-10 animate-pulse rounded bg-gray-100" aria-busy="true" />
      ) : methods.length === 0 ? (
        <p className="text-pf-deal-red">Online payment isn't available right now. Please try again later.</p>
      ) : (
        <>
          <fieldset className="space-y-2">
            <legend className="sr-only">Payment method</legend>
            {methods.map((m) => (
              <label key={m.code} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="pay-method" value={m.code} checked={method === m.code} onChange={() => setMethod(m.code)} />
                {m.name}
              </label>
            ))}
          </fieldset>
          <button
            type="button"
            onClick={pay}
            disabled={busy}
            aria-busy={busy}
            className="w-full h-11 rounded-md bg-[#1773b0] hover:bg-[#145f91] text-white font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Redirecting to payment…' : 'Pay Now'}
          </button>
        </>
      )}
      {error && <p role="alert" className="text-pf-deal-red">{error}</p>}
    </div>
  )
}

export default function OrderSuccess() {
  const { number } = useParams()
  const location = useLocation()
  const passed = location.state?.order
  const [order, setOrder] = useState(passed?.number === number ? passed : null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (order || !getAccessToken()) return
    getOrder(number)
      .then(setOrder)
      .catch((err) => setError(err.message || 'Could not load your order.'))
  }, [number, order])

  if (!getAccessToken()) {
    return <Navigate to="/login" replace state={{ returnTo: `/order-success/${number}` }} />
  }

  const address = order?.shipping_address
  const name = (address || order?.billing_address)?.first_name
  const awaitingPayment =
    order && order.status === 'awaiting_payment' && PAYABLE_ONLINE_METHODS.includes(order.payment_method)
  const awaitingOnlinePayment = awaitingPayment && ONLINE_PAYMENT_METHODS.includes(order.payment_method)

  return (
    <StoreLayout>
      <main className="mx-auto max-w-[700px] px-3 sm:px-4 py-8">
        <div className="bg-white p-6 sm:p-8 space-y-6">
          {error ? (
            <p role="alert" className="text-sm text-pf-deal-red">{error}</p>
          ) : !order ? (
            <div className="h-24 animate-pulse bg-gray-100 rounded" aria-busy="true" aria-label="Loading order" />
          ) : (
            <>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 shrink-0 rounded-full border-2 border-pf-badge-green text-pf-badge-green flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-pf-text-light">Order {order.number}</p>
                  <h1 className="text-2xl font-semibold text-pf-text">Thank you{name ? `, ${name}` : ''}!</h1>
                  <p className="mt-1 text-sm text-pf-text">
                    {awaitingOnlinePayment ? 'Your order has been placed. Complete your payment to confirm it.' : 'Your order has been placed.'}
                  </p>
                </div>
              </div>

              {awaitingPayment && <PayNowPanel order={order} />}

              <div className="rounded-md border border-gray-200 p-4 text-sm space-y-1">
                <p className="font-semibold">{PAYMENT_LABELS[order.payment_method] || order.payment_method}</p>
                {!awaitingOnlinePayment && <p className="text-pf-text-light">{PAYMENT_NOTE[order.payment_method]}</p>}
                <p className="pt-2 font-semibold">{order.delivery_method === 'pickup' ? 'Store pickup' : 'Shipping to'}</p>
                {address && (
                  <p className="text-pf-text-light">
                    {address.first_name} {address.last_name}, {address.address1}
                    {address.address2 ? `, ${address.address2}` : ''}, {address.city}
                    {address.postal_code ? ` ${address.postal_code}` : ''}, {address.country}
                  </p>
                )}
              </div>

              <ul className="divide-y divide-gray-200 border-y border-gray-200">
                {order.items.map((item) => (
                  <li key={item.product_id} className="flex justify-between gap-4 py-3 text-sm">
                    <span className="text-pf-text">
                      {item.product_name} <span className="text-pf-text-light">× {item.quantity}</span>
                    </span>
                    <span className="whitespace-nowrap">{formatMoney(item.line_total)}</span>
                  </li>
                ))}
              </ul>

              <dl className="text-sm space-y-1">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd>{formatMoney(order.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Shipping</dt>
                  <dd>{Number(order.shipping_total) === 0 ? 'FREE' : formatMoney(order.shipping_total)}</dd>
                </div>
                <div className="flex justify-between text-base font-semibold pt-1">
                  <dt>Total</dt>
                  <dd>{formatMoney(order.total)}</dd>
                </div>
              </dl>
            </>
          )}

          <Link
            to="/products"
            className="block text-center w-full bg-pf-cta hover:bg-pf-cta-hover text-pf-text hover:text-pf-text text-sm font-medium py-2 rounded-full shadow-sm"
          >
            Continue shopping
          </Link>
        </div>
      </main>
    </StoreLayout>
  )
}
