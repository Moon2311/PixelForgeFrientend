import { Navigate } from 'react-router-dom'
import { getUser } from '../../lib/api.js'

function ForbiddenPage() {
  return (
    <div className="admin-forbidden">
      <div className="admin-card">
        <h1>403 Forbidden</h1>
        <p>You need an admin account to access this area.</p>
        <a href="/home" className="btn btn-primary">
          Back to store
        </a>
      </div>
    </div>
  )
}

export default function RequireAdmin({ children, allowedRoles }) {
  const user = getUser()
  if (!user) return <Navigate to="/login" replace />
  const roles = allowedRoles || ['admin']
  if (!roles.includes(user.role)) return <ForbiddenPage />
  return children
}
