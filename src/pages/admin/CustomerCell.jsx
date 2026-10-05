import { Link } from 'react-router-dom'

// A buyer's name and email, linking to all of their orders.
export default function CustomerCell({ customer, contact }) {
  if (!customer) return <span>{contact || '—'}</span>
  return (
    <Link to={`/admin/orders?user_id=${customer.id}`} className="order-customer">
      <span className="admin-name">{customer.name || `User #${customer.id}`}</span>
      <span className="order-customer-email">{customer.email || contact}</span>
    </Link>
  )
}
