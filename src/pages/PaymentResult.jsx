import { useEffect, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import StoreLayout from '../components/StoreLayout.jsx'
import { getAccessToken } from '../lib/api.js'
import { formatMoney } from '../lib/format.js'
import { FINAL_PAYMENT_STATUSES, getPayment } from '../lib/paymentsApi.js'

// The provider sends the customer back here (via the backend). Returning
// proves nothing: the result shown is the payment status the server has
// verified with JazzCash/Easypaisa, polled until it settles.
const POLL_MS = 3000
const POLL_LIMIT_MS = 2 * 60 * 1000

const PROVIDER_NAMES = { JAZZCASH: 'JazzCash', EASYPAISA: 'Easypaisa' }

const NOT_PAID_TEXT = {
  FAILED: 'Your payment was not successful.',
  CANCELLED: 'The payment was cancelled.',
  EXPIRED: 'The payment was not completed in time.',
  REFUNDED: 'This payment was refunded.',
}

function StatusIcon({ ok }) {
  return (
    <div className={`w-12 h-12 shrink-0 rounded-full border-2 flex items-center justify-center ${ok ? 'border-pf-badge-green text-pf-badge-green' : 'border-pf-deal-red text-pf-deal-red'}`}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {ok ? <polyline points="20 6 9 17 4 12" /> : <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>}
      </svg>
    </div>
  )
}

export default function PaymentResult() {
  const [params] = useSearchParams()
  const paymentId = params.get('payment_id') || ''
  const [payment, setPayment] = useState(null)
  const [error, setError] = useState(paymentId ? '' : 'We could not identify this payment.')
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (!paymentId || !getAccessToken()) return
    let cancelled = false
    let timer = null
    const started = Date.now()
    const poll = async () => {
      try {
        const data = await getPayment(paymentId)
        if (cancelled) return
        setPayment(data)
        if (FINAL_PAYMENT_STATUSES.includes(data.status)) return
      } catch (err) {
        if (cancelled) return
        // Network blips: keep polling; a missing payment is final.
        if (err.status === 404) {
          setError('Payment not found.')
          return
        }
      }
      if (Date.now() - started >= POLL_LIMIT_MS) {
        setTimedOut(true)
        return
      }
      timer = setTimeout(poll, POLL_MS)
    }
    poll()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [paymentId])

  if (!getAccessToken()) {
    return <Navigate to="/login" replace state={{ returnTo: `/payment/result?payment_id=${encodeURIComponent(paymentId)}` }} />
  }

  const status = payment?.status
  const provider = PROVIDER_NAMES[payment?.payment_method] || 'the payment provider'
  const orderLink = payment && `/order-success/${payment.order_id}`

  let body
  if (error) {
    body = <p role="alert" className="text-sm text-pf-deal-red">{error}</p>
  } else if (!payment || (!FINAL_PAYMENT_STATUSES.includes(status) && !timedOut)) {
    body = (
      <div className="flex items-center gap-4" role="status" aria-live="polite">
        <div className="w-12 h-12 shrink-0 rounded-full border-4 border-gray-200 border-t-[#1773b0] animate-spin" aria-hidden="true" />
        <div>
          <h1 className="text-xl font-semibold text-pf-text">Confirming your payment…</h1>
          <p className="mt-1 text-sm text-pf-text-light">We're checking with {provider}. Please don't close this page.</p>
        </div>
      </div>
    )
  } else if (status === 'PAID') {
    body = (
      <div className="flex items-start gap-4" role="status">
        <StatusIcon ok />
        <div>
          <p className="text-sm text-pf-text-light">Order {payment.order_id}</p>
          <h1 className="text-2xl font-semibold text-pf-text">Payment successful</h1>
          <p className="mt-1 text-sm text-pf-text">
            We received {formatMoney(payment.amount)} via {provider}. Your order is confirmed.
          </p>
        </div>
      </div>
    )
  } else if (timedOut) {
    body = (
      <div role="status">
        <h1 className="text-xl font-semibold text-pf-text">Your payment is still being processed</h1>
        <p className="mt-1 text-sm text-pf-text-light">
          {provider} hasn't confirmed it yet. If you completed the payment, your order will be confirmed automatically once
          it does — check your order for updates. Please don't pay again in the meantime.
        </p>
      </div>
    )
  } else {
    body = (
      <div className="flex items-start gap-4" role="alert">
        <StatusIcon ok={false} />
        <div>
          <p className="text-sm text-pf-text-light">Order {payment.order_id}</p>
          <h1 className="text-2xl font-semibold text-pf-text">Payment not completed</h1>
          <p className="mt-1 text-sm text-pf-text">{NOT_PAID_TEXT[status] || 'Your payment was not successful.'}</p>
          {status !== 'REFUNDED' && (
            <p className="mt-1 text-sm text-pf-text-light">Your order is saved — you can try paying again.</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <StoreLayout>
      <main className="mx-auto max-w-[700px] px-3 sm:px-4 py-8">
        <div className="bg-white p-6 sm:p-8 space-y-6">
          {body}
          <div className="flex flex-col sm:flex-row gap-3">
            {orderLink && (
              <Link
                to={orderLink}
                className="flex-1 text-center h-11 leading-[2.75rem] rounded-md bg-[#1773b0] hover:bg-[#145f91] text-white hover:text-white text-sm font-semibold"
              >
                {status && status !== 'PAID' && status !== 'REFUNDED' && FINAL_PAYMENT_STATUSES.includes(status) ? 'Try again' : 'View order'}
              </Link>
            )}
            <Link
              to="/products"
              className="flex-1 text-center bg-pf-cta hover:bg-pf-cta-hover text-pf-text hover:text-pf-text text-sm font-medium py-2.5 rounded-full shadow-sm"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </main>
    </StoreLayout>
  )
}
