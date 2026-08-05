import { useCallback, useRef, useState } from 'react'
import { ToastIcon } from '../components/Icons.jsx'
import { ToastContext } from './toastContext.js'

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, removing: true } : t)))
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 300)
  }, [])

  const showToast = useCallback(
    (message, type = 'success') => {
      const id = ++idRef.current
      setToasts((prev) => [...prev, { id, message, type, removing: false }])
      setTimeout(() => removeToast(id), 5000)
    },
    [removeToast],
  )

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}${t.removing ? ' removing' : ''}`}>
            <div className="toast-icon">
              <ToastIcon type={t.type} />
            </div>
            <div className="toast-content">{t.message}</div>
            <button
              type="button"
              className="toast-close"
              aria-label="Dismiss"
              onClick={() => removeToast(t.id)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
