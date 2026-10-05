// Form controls for the checkout page: bordered inputs whose label floats
// above the value once something is typed.

const FOCUS = 'focus:border-[#1773b0] focus:ring-[#1773b0]'
const INVALID = 'border-pf-deal-red focus:border-pf-deal-red focus:ring-pf-deal-red'

function FieldError({ id, error }) {
  if (!error) return null
  return (
    <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1.5 text-xs text-pf-deal-red">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {error}
    </p>
  )
}

export function TextField({ id, label, value, onChange, error, type = 'text', optional = false, ...rest }) {
  const text = optional ? `${label} (optional)` : label
  return (
    <div>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={text}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          required={!optional}
          className={`peer w-full h-12 rounded-md border bg-white px-3 text-sm text-pf-text placeholder:text-gray-500 focus:outline-none focus:ring-1 [&:not(:placeholder-shown)]:pt-4 ${error ? INVALID : `border-gray-300 ${FOCUS}`}`}
          {...rest}
        />
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-3 top-1.5 text-xs text-gray-500 peer-placeholder-shown:opacity-0"
        >
          {text}
        </label>
      </div>
      <FieldError id={id} error={error} />
    </div>
  )
}

export function SelectField({ id, label, value, onChange, options, error, ...rest }) {
  return (
    <div>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full h-12 appearance-none rounded-md border bg-white pl-3 pr-9 pt-4 text-sm text-pf-text focus:outline-none focus:ring-1 ${error ? INVALID : `border-gray-300 ${FOCUS}`}`}
          {...rest}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <label htmlFor={id} className="pointer-events-none absolute left-3 top-1.5 text-xs text-gray-500">
          {label}
        </label>
        <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      <FieldError id={id} error={error} />
    </div>
  )
}

export function Checkbox({ id, label, checked, onChange }) {
  return (
    <label htmlFor={id} className="flex items-center gap-2.5 text-sm text-pf-text cursor-pointer select-none">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 shrink-0 rounded border-gray-300 accent-[#1773b0] cursor-pointer"
      />
      {label}
    </label>
  )
}

// A bordered list of radio options; the selected one is highlighted and can
// reveal extra content (payment details, a billing form) underneath.
export function ChoiceList({ name, legend, value, onChange, options }) {
  return (
    <fieldset>
      <legend className="sr-only">{legend}</legend>
      <div className="rounded-md border border-gray-300 bg-white overflow-hidden">
        {options.map((option, index) => {
          const selected = option.value === value
          const id = `${name}-${option.value}`
          return (
            <div key={option.value} className={index > 0 ? 'border-t border-gray-300' : ''}>
              <label
                htmlFor={id}
                className={`flex items-center gap-3 px-4 min-h-12 py-3 text-sm cursor-pointer ${
                  selected ? 'bg-[#f0f5ff] ring-1 ring-inset ring-[#1773b0] rounded-[inherit]' : ''
                }`}
              >
                <input
                  id={id}
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={selected}
                  onChange={() => onChange(option.value)}
                  className="h-4 w-4 shrink-0 accent-[#1773b0] cursor-pointer"
                />
                <span className="flex-1 text-pf-text">{option.label}</span>
                {option.aside}
              </label>
              {selected && option.content && (
                <div className="border-t border-gray-300 bg-[#f5f5f5] px-4 py-4 text-sm text-pf-text">
                  {option.content}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}

export function Section({ title, aside, children }) {
  return (
    <section className="space-y-3.5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-xl font-semibold text-pf-text">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  )
}
