import Button from './Button.jsx'
import { AlertIcon } from './Icons.jsx'

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal confirm-modal">
        <div className="confirm-icon">
          <AlertIcon size={26} />
        </div>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
