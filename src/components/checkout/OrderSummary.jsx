import { useState } from 'react'
import { formatMoney } from '../../lib/format.js'

function DiscountCode({ onApply }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [applying, setApplying] = useState(false)

  const apply = async (e) => {
    e.preventDefault()
    if (!code.trim() || applying) return
    setApplying(true)
    setError('')
    try {
      await onApply(code.trim())
    } catch (err) {
      setError(err.message)
    } finally {
      setApplying(false)
    }
  }

  return (
    <div>
      <div className="flex gap-3">
        <div className="relative flex-1">
          <label htmlFor="discount-code" className="sr-only">Discount code</label>
          <input
            id="discount-code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value)
              setError('')
            }}
            onKeyDown={(e) => e.key === 'Enter' && apply(e)}
            placeholder="Discount code"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'discount-code-error' : undefined}
            className={`w-full h-12 rounded-md border bg-white px-3 text-sm text-pf-text placeholder:text-gray-500 focus:outline-none focus:ring-1 ${
              error ? 'border-pf-deal-red focus:ring-pf-deal-red' : 'border-gray-300 focus:border-[#1773b0] focus:ring-[#1773b0]'
            }`}
          />
        </div>
        <button
          type="button"
          onClick={apply}
          disabled={!code.trim() || applying}
          className="h-12 px-5 rounded-md border border-gray-300 bg-gray-100 text-sm font-semibold text-pf-text enabled:bg-[#1773b0] enabled:border-[#1773b0] enabled:text-white enabled:hover:bg-[#145f91] enabled:cursor-pointer disabled:text-gray-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1773b0]"
        >
          {applying ? 'Applying…' : 'Apply'}
        </button>
      </div>
      {error && (
        <p id="discount-code-error" role="alert" className="mt-1.5 text-xs text-pf-deal-red">
          {error}
        </p>
      )}
    </div>
  )
}

export default function OrderSummary({ lines, subtotal, shipping, total, itemCount, onApplyDiscount }) {
  return (
    <div className="space-y-5">
      <ul className="space-y-4" aria-label="Items in your order">
        {lines.map((line) => (
          <li key={line.productId} className="flex items-center gap-4">
            <div className="relative w-16 h-16 shrink-0 rounded-lg border border-gray-300 bg-white">
              {line.imageUrl ? (
                <img src={line.imageUrl} alt="" className="w-full h-full rounded-lg object-contain p-1" />
              ) : (
                <div className="flex items-center justify-center h-full text-[10px] text-pf-text-light">No image</div>
              )}
              <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1.5 rounded-full bg-gray-600 text-white text-xs font-semibold flex items-center justify-center">
                <span className="sr-only">Quantity: </span>
                {line.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-pf-text line-clamp-2">{line.name}</p>
              {line.variant && <p className="text-xs text-pf-text-light mt-0.5">{line.variant}</p>}
              {line.quantity > 1 && (
                <p className="text-xs text-pf-text-light mt-0.5">{formatMoney(line.price)} each</p>
              )}
              {line.problem && <p className="text-xs text-pf-deal-red mt-0.5">{line.problem}</p>}
            </div>
            <span className="text-sm text-pf-text whitespace-nowrap">{formatMoney(line.lineTotal)}</span>
          </li>
        ))}
      </ul>

      <DiscountCode onApply={onApplyDiscount} />

      <dl className="space-y-2 text-sm text-pf-text">
        <div className="flex justify-between">
          <dt>Subtotal · {itemCount} item{itemCount !== 1 ? 's' : ''}</dt>
          <dd>{formatMoney(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Shipping</dt>
          <dd>{shipping === 0 ? 'FREE' : formatMoney(shipping)}</dd>
        </div>
        <div className="flex justify-between items-baseline pt-2 text-lg font-semibold">
          <dt>Total</dt>
          <dd>
            <span className="text-xs font-normal text-pf-text-light mr-2">USD</span>
            {formatMoney(total)}
          </dd>
        </div>
      </dl>
    </div>
  )
}
