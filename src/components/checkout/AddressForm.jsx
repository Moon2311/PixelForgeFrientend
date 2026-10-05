import { COUNTRIES } from './address.js'
import { SelectField, TextField } from './fields.jsx'

// Shipping and billing address fields. Field ids (and error keys) are
// `${prefix}-${field}`, e.g. "shipping-city".
export default function AddressForm({ prefix, value, onChange, errors }) {
  const field = (name) => ({
    id: `${prefix}-${name}`,
    value: value[name],
    onChange: (v) => onChange({ ...value, [name]: v }, name),
    error: errors[`${prefix}-${name}`],
  })
  const section = prefix === 'billing' ? 'billing' : 'shipping'

  return (
    <div className="space-y-3">
      <SelectField label="Country/Region" options={COUNTRIES} autoComplete={`${section} country-name`} {...field('country')} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <TextField label="First name" autoComplete={`${section} given-name`} {...field('first_name')} />
        <TextField label="Last name" autoComplete={`${section} family-name`} {...field('last_name')} />
      </div>
      <TextField label="Address" autoComplete={`${section} address-line1`} {...field('address1')} />
      <TextField label="Apartment, suite, etc." optional autoComplete={`${section} address-line2`} {...field('address2')} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <TextField label="City" autoComplete={`${section} address-level2`} {...field('city')} />
        <TextField label="Postal code" optional inputMode="numeric" autoComplete={`${section} postal-code`} {...field('postal_code')} />
      </div>
      <TextField label="Phone" type="tel" autoComplete={`${section} tel`} {...field('phone')} />
    </div>
  )
}
