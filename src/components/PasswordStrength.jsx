import { passwordStrength, STRENGTH_LABELS } from '../lib/validation.js'

export default function PasswordStrength({ value }) {
  const score = passwordStrength(value)
  const color =
    score <= 1 ? 'var(--error)' : score <= 2 ? 'var(--warning)' : 'var(--success)'

  return (
    <>
      <div className="password-strength">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`strength-bar${i < score ? ' active' : ''}${
              i < score ? (score <= 1 ? ' weak' : score <= 2 ? ' medium' : ' strong') : ''
            }`}
          />
        ))}
      </div>
      <div className="strength-text" style={{ color }}>
        {value.length > 0 ? STRENGTH_LABELS[score] : ''}
      </div>
    </>
  )
}
