import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext.jsx'
import { SearchProvider } from './context/SearchContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { useTheme } from './hooks/useTheme.js'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import Home from './pages/Home.jsx'
import Products from './pages/Products.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import OrderSuccess from './pages/OrderSuccess.jsx'
import MyOrders from './pages/MyOrders.jsx'
import PaymentResult from './pages/PaymentResult.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminProductDetail from './pages/admin/AdminProductDetail.jsx'
import AdminProductForm from './pages/admin/AdminProductForm.jsx'
import AdminProducts from './pages/admin/AdminProducts.jsx'
import AdminInventory from './pages/admin/AdminInventory.jsx'
import AdminInventoryLogs from './pages/admin/AdminInventoryLogs.jsx'
import AdminLowStock from './pages/admin/AdminLowStock.jsx'
import AdminOrders from './pages/admin/AdminOrders.jsx'
import RequireAdmin from './pages/admin/RequireAdmin.jsx'

function ThemeManager() {
  useTheme()
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeManager />
      <ToastProvider>
        <SearchProvider>
          <CartProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/products" element={<Products />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success/:number" element={<OrderSuccess />} />
              <Route path="/orders" element={<MyOrders />} />
              <Route path="/payment/result" element={<PaymentResult />} />
              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    <AdminLayout />
                  </RequireAdmin>
                }
              >
                <Route index element={<Navigate to="/admin/products" replace />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/new" element={<AdminProductForm />} />
                <Route path="products/:id" element={<AdminProductDetail />} />
                <Route path="products/:id/edit" element={<AdminProductForm />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="inventory/logs" element={<AdminInventoryLogs />} />
                <Route path="inventory/low-stock" element={<AdminLowStock />} />
                <Route path="orders" element={<AdminOrders />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CartProvider>
        </SearchProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
