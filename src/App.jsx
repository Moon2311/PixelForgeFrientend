import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext.jsx'
import { SearchProvider } from './context/SearchContext.jsx'
import { useTheme } from './hooks/useTheme.js'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import Home from './pages/Home.jsx'
import Products from './pages/Products.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminProductDetail from './pages/admin/AdminProductDetail.jsx'
import AdminProductForm from './pages/admin/AdminProductForm.jsx'
import AdminProducts from './pages/admin/AdminProducts.jsx'
import AdminInventoryLogs from './pages/admin/AdminInventoryLogs.jsx'
import AdminLowStock from './pages/admin/AdminLowStock.jsx'
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
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/home" element={<Home />} />
            <Route path="/products" element={<Products />} />
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
              <Route path="inventory/logs" element={<AdminInventoryLogs />} />
              <Route path="inventory/low-stock" element={<AdminLowStock />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </SearchProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
