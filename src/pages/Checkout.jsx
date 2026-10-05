import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '../components/Icons.jsx'
import AddressForm from '../components/checkout/AddressForm.jsx'
import { EMPTY_ADDRESS } from '../components/checkout/address.js'
import OrderSummary from '../components/checkout/OrderSummary.jsx'
import { Checkbox, ChoiceList, Section, TextField } from '../components/checkout/fields.jsx'
import { useToast } from '../context/useToast.js'
import { getAccessToken } from '../lib/api.js'
import { getCart } from '../lib/cartApi.js'
import { formatMoney } from '../lib/format.js'
import { getCheckoutOptions, ONLINE_PAYMENT_METHODS, PAYMENT_LABELS, placeOrder } from '../lib/ordersApi.js'
import { payOrder } from '../lib/paymentsApi.js'
import { getProduct } from '../lib/productsApi.js'
import { validateEmail, validatePhone } from '../lib/validation.js'

// "Save this information for next time" keeps contact and addresses here.
const SAVED_INFO_KEY = 'checkout_info'
// Form kept across a forced re-login so nothing typed is lost.
const DRAFT_KEY = 'checkout_draft'

const DEFAULT_FORM = {
  contact: '',
  marketing: false,
  delivery: 'ship',
  shipping: EMPTY_ADDRESS,
  shippingMethod: '',
  payment: 'cod',
  billingSame: true,
  billing: EMPTY_ADDRESS,
  save: false,
}

function readJson(storage, key) {
  try {
    return JSON.parse(storage.getItem(key)) || null
  } catch {
    return null
  }
}

function initialForm() {
  const draft = readJson(sessionStorage, DRAFT_KEY)
  if (draft) {
    sessionStorage.removeItem(DRAFT_KEY)
    return { ...DEFAULT_FORM, ...draft }
  }
  const saved = readJson(localStorage, SAVED_INFO_KEY)
  return saved ? { ...DEFAULT_FORM, ...saved, save: true } : DEFAULT_FORM
}

const ADDRESS_REQUIRED = {
  first_name: 'Enter a first name',
  last_name: 'Enter a last name',
  address1: 'Enter an address',
  city: 'Enter a city',
  phone: 'Enter a phone number',
}

function validateAddress(prefix, address, errors) {
  Object.entries(ADDRESS_REQUIRED).forEach(([field, message]) => {
    if (!address[field].trim()) errors[`${prefix}-${field}`] = message
  })
  if (address.phone.trim() && !validatePhone(address.phone)) {
    errors[`${prefix}-phone`] = 'Enter a valid phone number'
  }
}

function needsBillingForm(form) {
  return form.delivery === 'pickup' || !form.billingSame
}

function validateForm(form) {
  const errors = {}
  const contact = form.contact.trim()
  if (!contact) errors.contact = 'Enter an email or phone number'
  else if (contact.includes('@') ? !validateEmail(contact) : !validatePhone(contact)) {
    errors.contact = 'Enter a valid email or mobile phone number'
  }
  if (form.delivery === 'ship') {
    validateAddress('shipping', form.shipping, errors)
    if (!form.shippingMethod) errors.shippingMethod = 'Choose a shipping method'
  }
  if (needsBillingForm(form)) validateAddress('billing', form.billing, errors)
  return errors
}

// Backend validation errors -> the same keys the form uses.
function serverFieldErrors(data) {
  const errors = {}
  Object.entries(data || {}).forEach(([key, value]) => {
    if (key === 'shipping_address' || key === 'billing_address') {
      const prefix = key.split('_')[0]
      if (Array.isArray(value)) errors[`${prefix}-address1`] = value[0]
      else Object.entries(value).forEach(([field, msgs]) => (errors[`${prefix}-${field}`] = msgs[0]))
    } else if (key === 'contact') {
      errors.contact = value[0]
    }
  })
  return errors
}

const PROBLEM_TEXT = {
  out_of_stock: (p) => (p.available ? `Only ${p.available} left in stock` : 'Out of stock'),
  price_changed: (p) => `Price changed to ${formatMoney(p.price)}`,
  unavailable: () => 'No longer available',
}

async function loadCartLines() {
  const cart = await getCart()
  const items = cart?.data?.items || []
  // A product deleted since it was added comes back as null.
  const products = await Promise.all(
    items.map((item) => getProduct(item.product_id).catch((err) => (err.status === 404 ? null : Promise.reject(err)))),
  )
  return items.map((item, i) => {
    const product = products[i] || { name: `Product #${item.product_id}`, price: 0, stock_quantity: 0 }
    const price = Number(product.discount_price || product.price) || 0
    return {
      productId: item.product_id,
      quantity: item.quantity,
      name: product.name,
      imageUrl: product.images?.[0] || product.thumbnail || '',
      variant: [product.color, product.size].filter(Boolean).join(' / '),
      price,
      lineTotal: price * item.quantity,
      stock: Number(product.stock_quantity) || 0,
    }
  })
}

const cents = (amount) => Math.round(Number(amount) * 100)

function TruckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-gray-500">
      <path d="M1 3h15v13H1z" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  )
}

function StoreIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-gray-500">
      <path d="M3 9l1-5h16l1 5" />
      <path d="M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V9z" />
      <path d="M5 13v8h14v-8" />
    </svg>
  )
}

export default function Checkout() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [lines, setLines] = useState(null)
  const [options, setOptions] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [problems, setProblems] = useState([])
  const [placing, setPlacing] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const submitting = useRef(false)

  const goToLogin = useCallback(() => {
    navigate('/login', { replace: true, state: { returnTo: '/checkout' } })
  }, [navigate])

  const load = useCallback(async () => {
    try {
      const [cartLines, checkoutOptions] = await Promise.all([loadCartLines(), getCheckoutOptions()])
      if (cartLines.length === 0) {
        showToast('Your cart is empty.', 'error')
        navigate('/cart', { replace: true })
        return
      }
      setLines(cartLines)
      setOptions(checkoutOptions)
      // Default to the first shipping method the store offers, and drop a
      // payment method that is no longer offered.
      setForm((f) => ({
        ...f,
        shippingMethod: checkoutOptions.shipping_methods.some((m) => m.code === f.shippingMethod)
          ? f.shippingMethod
          : checkoutOptions.shipping_methods[0]?.code || '',
        payment: checkoutOptions.payment_methods.some((m) => m.code === f.payment)
          ? f.payment
          : checkoutOptions.payment_methods[0]?.code || 'cod',
      }))
    } catch (err) {
      if (err.status === 401) {
        showToast('Your session expired. Please log in again.', 'error')
        goToLogin()
        return
      }
      setLoadError(err.message || 'Could not load checkout.')
    }
  }, [navigate, showToast, goToLogin])

  useEffect(() => {
    if (!getAccessToken()) {
      goToLogin()
      return
    }
    load()
  }, [load, goToLogin])

  // Apply a form change and clear the error of the field that was edited.
  const update = (patch, errorKey = Object.keys(patch)[0]) => {
    setForm((f) => ({ ...f, ...patch }))
    setErrors((prev) => {
      if (!(errorKey in prev)) return prev
      const { [errorKey]: _cleared, ...rest } = prev
      return rest
    })
  }

  const shippingMethod = options?.shipping_methods.find((m) => m.code === form.shippingMethod)
  const subtotalCents = (lines || []).reduce((sum, l) => sum + cents(l.price) * l.quantity, 0)
  const shippingCents = form.delivery === 'ship' && shippingMethod ? cents(shippingMethod.price) : 0
  const totalCents = subtotalCents + shippingCents
  const itemCount = (lines || []).reduce((sum, l) => sum + l.quantity, 0)

  const linesWithProblems = (lines || []).map((line) => {
    const problem = problems.find((p) => p.product_id === line.productId)
    if (problem) return { ...line, problem: PROBLEM_TEXT[problem.reason]?.(problem) }
    if (line.quantity > line.stock) return { ...line, problem: PROBLEM_TEXT.out_of_stock({ available: line.stock }) }
    return line
  })

  const applyDiscount = async () => {
    // The backend has no discount/coupon API yet.
    throw new Error("Discount codes aren't available yet.")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting.current) return

    const formErrors = validateForm(form)
    setErrors(formErrors)
    const firstInvalid = Object.keys(formErrors)[0]
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus()
      showToast('Please fix the highlighted fields.', 'error')
      return
    }
    const short = lines.find((l) => l.quantity > l.stock)
    if (short) {
      showToast(`${short.name}: ${PROBLEM_TEXT.out_of_stock({ available: short.stock })}. Please update your cart.`, 'error')
      return
    }

    submitting.current = true
    setPlacing(true)
    setProblems([])
    const ship = form.delivery === 'ship'
    // Set once the browser is on its way to the payment provider.
    let leaving = false
    try {
      const order = await placeOrder({
        contact: form.contact.trim(),
        marketing_opt_in: form.marketing,
        delivery_method: form.delivery,
        shipping_address: ship ? form.shipping : null,
        shipping_method: ship ? form.shippingMethod : '',
        billing_same_as_shipping: ship && form.billingSame,
        billing_address: needsBillingForm(form) ? form.billing : null,
        payment_method: form.payment,
        discount_code: '',
        items: lines.map((l) => ({ product_id: l.productId, quantity: l.quantity, unit_price: l.price.toFixed(2) })),
        total: (totalCents / 100).toFixed(2),
      })

      try {
        if (form.save) {
          const { contact, marketing, delivery, shipping, billingSame, billing } = form
          localStorage.setItem(SAVED_INFO_KEY, JSON.stringify({ contact, marketing, delivery, shipping, billingSame, billing }))
        } else {
          localStorage.removeItem(SAVED_INFO_KEY)
        }
      } catch {
        // storage unavailable
      }
      // The server emptied the cart; refresh the header count.
      window.dispatchEvent(new Event('cart-updated'))
      if (ONLINE_PAYMENT_METHODS.includes(order.payment_method)) {
        try {
          await payOrder(order.number, order.payment_method)
          leaving = true
          return
        } catch (payErr) {
          // The order exists; the customer can retry paying from its page.
          showToast(`Order ${order.number} was placed, but the payment couldn't be started. ${payErr.message || ''}`.trim(), 'error')
        }
      }
      navigate(`/order-success/${order.number}`, { replace: true, state: { order } })
    } catch (err) {
      if (err.status === 401) {
        try {
          const { save: _save, ...draft } = form
          sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
        } catch {
          // storage unavailable
        }
        showToast('Your session expired. Please log in again.', 'error')
        goToLogin()
        return
      }
      if (err.status === 400) setErrors(serverFieldErrors(err.data))
      if (err.status === 409) {
        setProblems(err.data?.problems || [])
        // Show current prices and stock; the form is kept as typed.
        loadCartLines().then(setLines).catch(() => {})
      }
      showToast(err.message || 'Could not place your order. Please try again.', 'error')
    } finally {
      if (!leaving) {
        submitting.current = false
        setPlacing(false)
      }
    }
  }

  const header = (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1.5 text-pf-text hover:text-pf-text">
          <Logo size={26} />
          <span className="text-lg sm:text-xl font-bold tracking-tight">
            OKasha <span className="text-pf-orange">Electronics</span>
          </span>
        </Link>
        <Link to="/cart" className="text-[#1773b0] hover:text-[#145f91]" aria-label="Back to cart">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </Link>
      </div>
    </header>
  )

  if (loadError) {
    return (
      <div className="min-h-screen bg-white text-pf-text">
        {header}
        <div className="mx-auto max-w-md px-4 py-16 text-center space-y-4" role="alert">
          <p className="text-sm">{loadError}</p>
          <div className="flex justify-center gap-3">
            <button type="button" onClick={() => { setLoadError(''); load() }} className="h-11 px-5 rounded-md bg-[#1773b0] hover:bg-[#145f91] text-white text-sm font-semibold cursor-pointer">
              Try again
            </button>
            <Link to="/cart" className="h-11 px-5 rounded-md border border-gray-300 text-sm font-semibold text-pf-text hover:text-pf-text flex items-center">
              Back to cart
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!lines || !options) {
    return (
      <div className="min-h-screen bg-white text-pf-text">
        {header}
        <div className="mx-auto max-w-[600px] px-4 py-10 space-y-4 animate-pulse" aria-busy="true" aria-label="Loading checkout">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 rounded-md bg-gray-100" />
          ))}
        </div>
      </div>
    )
  }

  const pickupContent = (
    <div className="space-y-1">
      <p className="font-semibold">Store pickup</p>
      {options.pickup_location ? (
        <p className="whitespace-pre-line text-pf-text-light">{options.pickup_location}</p>
      ) : (
        <p className="text-pf-text-light">We'll contact you when your order is ready for pickup.</p>
      )}
    </div>
  )

  const bankInstructions = options.payment_methods.find((m) => m.code === 'bank_deposit')?.instructions
  const paymentContent = {
    cod: <p className="text-center">You can place an order with "Cash On Delivery" payment method!</p>,
    bank_deposit: (
      <div className="space-y-2">
        {bankInstructions && <p className="whitespace-pre-line">{bankInstructions}</p>}
        <p className="text-pf-text-light">Your order will be confirmed once your bank deposit is received.</p>
      </div>
    ),
    ...Object.fromEntries(
      ONLINE_PAYMENT_METHODS.map((code) => [
        code,
        <p key={code} className="text-center">
          After clicking “Pay Now”, you will be redirected to {PAYMENT_LABELS[code]} to complete your payment securely.
        </p>,
      ]),
    ),
  }
  const payOnline = ONLINE_PAYMENT_METHODS.includes(form.payment)

  return (
    <div className="min-h-screen bg-white text-pf-text">
      {header}
      <div className="flex flex-col lg:grid lg:grid-cols-[65fr_35fr] lg:min-h-[calc(100vh-4rem)]">
        {/* Order summary: collapsible on small screens, right column on desktop. */}
        <aside className="order-first lg:order-none lg:col-start-2 lg:row-start-1 bg-[#f5f5f5] border-b lg:border-b-0 lg:border-l border-gray-200" aria-label="Order summary">
          <button
            type="button"
            onClick={() => setSummaryOpen((open) => !open)}
            aria-expanded={summaryOpen}
            aria-controls="order-summary-content"
            className="lg:hidden w-full flex items-center justify-between px-4 sm:px-6 py-4 text-sm text-[#1773b0] cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              {summaryOpen ? 'Hide order summary' : 'Show order summary'}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={summaryOpen ? 'rotate-180' : ''}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
            <span className="text-lg font-semibold text-pf-text">{formatMoney(totalCents / 100)}</span>
          </button>
          <div
            id="order-summary-content"
            className={`${summaryOpen ? 'block' : 'hidden'} lg:block px-4 sm:px-6 pb-6 lg:p-10 lg:sticky lg:top-0`}
          >
            <div className="max-w-[600px] mx-auto lg:mx-0 lg:max-w-[420px]">
              <OrderSummary
                lines={linesWithProblems}
                subtotal={subtotalCents / 100}
                shipping={shippingCents / 100}
                total={totalCents / 100}
                itemCount={itemCount}
                onApplyDiscount={applyDiscount}
              />
            </div>
          </div>
        </aside>

        <main className="lg:col-start-1 lg:row-start-1 px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
          <form noValidate onSubmit={handleSubmit} className="max-w-[600px] mx-auto lg:mr-0 lg:ml-auto space-y-8">
            {problems.length > 0 && (
              <div role="alert" className="rounded-md border border-pf-deal-red bg-red-50 px-4 py-3 text-sm">
                <p className="font-semibold text-pf-deal-red">Some items in your cart need attention</p>
                <ul className="mt-1 list-disc pl-5 text-pf-text">
                  {problems.map((p, i) => (
                    <li key={i}>
                      {p.name || 'A product'}: {PROBLEM_TEXT[p.reason]?.(p)}
                    </li>
                  ))}
                </ul>
                <Link to="/cart" className="mt-2 inline-block text-[#1773b0] underline">
                  Return to cart
                </Link>
              </div>
            )}

            <Section title="Contact">
              <TextField
                id="contact"
                label="Email or mobile phone number"
                value={form.contact}
                onChange={(contact) => update({ contact })}
                error={errors.contact}
                autoComplete="email"
              />
              <Checkbox
                id="marketing"
                label="Email me with news and offers"
                checked={form.marketing}
                onChange={(marketing) => update({ marketing })}
              />
            </Section>

            <Section title="Delivery">
              <ChoiceList
                name="delivery"
                legend="Delivery method"
                value={form.delivery}
                onChange={(delivery) => update({ delivery })}
                options={[
                  { value: 'ship', label: 'Ship', aside: <TruckIcon /> },
                  { value: 'pickup', label: 'Pickup', aside: <StoreIcon />, content: pickupContent },
                ]}
              />
              {form.delivery === 'ship' && (
                <AddressForm
                  prefix="shipping"
                  value={form.shipping}
                  onChange={(shipping, field) => update({ shipping }, `shipping-${field}`)}
                  errors={errors}
                />
              )}
              <Checkbox
                id="save-info"
                label="Save this information for next time"
                checked={form.save}
                onChange={(save) => update({ save })}
              />
            </Section>

            {form.delivery === 'ship' && (
              <Section title="Shipping method">
                <ChoiceList
                  name="shipping-method"
                  legend="Shipping method"
                  value={form.shippingMethod}
                  onChange={(shippingMethod) => update({ shippingMethod })}
                  options={options.shipping_methods.map((method) => ({
                    value: method.code,
                    label: method.name,
                    aside: (
                      <span className="text-sm font-semibold">
                        {Number(method.price) === 0 ? 'FREE' : formatMoney(method.price)}
                      </span>
                    ),
                  }))}
                />
                {errors.shippingMethod && <p className="text-xs text-pf-deal-red">{errors.shippingMethod}</p>}
              </Section>
            )}

            <Section title="Payment">
              <p className="-mt-2 text-sm text-pf-text-light">All transactions are secure and encrypted.</p>
              <ChoiceList
                name="payment"
                legend="Payment method"
                value={form.payment}
                onChange={(payment) => update({ payment })}
                options={options.payment_methods.map((method) => ({
                  value: method.code,
                  label: method.name,
                  content: paymentContent[method.code],
                }))}
              />
            </Section>

            <Section title="Billing address">
              {form.delivery === 'ship' ? (
                <ChoiceList
                  name="billing"
                  legend="Billing address"
                  value={form.billingSame ? 'same' : 'different'}
                  onChange={(choice) => update({ billingSame: choice === 'same' })}
                  options={[
                    { value: 'same', label: 'Same as shipping address' },
                    {
                      value: 'different',
                      label: 'Use a different billing address',
                      content: (
                        <AddressForm prefix="billing" value={form.billing} onChange={(billing, field) => update({ billing }, `billing-${field}`)} errors={errors} />
                      ),
                    },
                  ]}
                />
              ) : (
                <AddressForm prefix="billing" value={form.billing} onChange={(billing, field) => update({ billing }, `billing-${field}`)} errors={errors} />
              )}
            </Section>

            <button
              type="submit"
              disabled={placing}
              aria-busy={placing}
              className="w-full h-14 rounded-md bg-[#1773b0] hover:bg-[#145f91] text-white text-lg font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1773b0]"
            >
              {placing ? (payOnline ? 'Redirecting to payment…' : 'Placing order…') : payOnline ? 'Pay Now' : 'Place Order'}
            </button>

            <p className="pb-4 text-center text-xs text-pf-text-light">
              <Link to="/cart" className="text-[#1773b0] hover:underline">
                Return to cart
              </Link>
            </p>
          </form>
        </main>
      </div>
    </div>
  )
}
