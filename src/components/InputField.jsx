import { useState } from 'react'
import { EyeIcon, EyeOffIcon } from './Icons.jsx'

export default function InputField({
  id,
  name,
  type = 'text',
  label,
  value,
  onChange,
  icon,
  error,
  required = false,
  autoComplete,
  toggleable = false,
}) {
  const [showPassword, setShowPassword] = useState(false)
  const resolvedType = toggleable ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={`input-group${error ? ' has-error' : ''}`}>
      {icon && <span className="input-icon">{icon}</span>}
      <input
        id={id}
        name={name}
        type={resolvedType}
        className="input-field"
        placeholder=" "
        required={required}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
      />
      <label className="floating-label" htmlFor={id}>
        {label}
      </label>
      {toggleable && (
        <button
          type="button"
          className="password-toggle"
          aria-label="Toggle password visibility"
          tabIndex="-1"
          onClick={() => setShowPassword((s) => !s)}
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      )}
      {error && (
        <div className="error-message">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
