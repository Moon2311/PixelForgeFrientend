# PixelForge Frontend (React)

React + Vite frontend for PixelForge — sign-in, sign-up, password recovery, the signed-in storefront (home + product search), and the admin Product Inventory Management panel. Replaces the previous static HTML/CSS/JS pages in `../PixelForgebackend/`.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Client (Browser)                              │
│  React 19 SPA  ·  Vite dev server :5173  ·  React Router 7     │
└──────────────────────────┬──────────────────────────────────────┘
                            │
              ┌─────────────▼──────────────┐
              │       API Layer              │
              │  src/lib/api.js              │
              │  src/lib/productsApi.js      │
              │  Base URLs from localStorage │
              │  auth: http://localhost:8001 │
              │  products: http://localhost:8002 │
              └─────────────┬──────────────┘
                            │
         ┌──────────────────▼──────────────────┐
         │         nginx gateway :80            │
         │  /api/auth/*  → auth-service :8001  │
         │  /api/products/* → product-service  │
         └──────┬──────────────────────┬───────┘
                │                      │
   ┌────────────▼────────┐  ┌──────────▼──────────────┐
   │  auth-service        │  │  product-service         │
   │  Django DRF + PG     │  │  Django DRF + SQLite/ES  │
   │  :8001 (Docker)      │  │  :8002 (Docker)          │
   └──────────────────────┘  └──────────────────────────┘
```

### Key design decisions

| Concern | Decision |
|---------|----------|
| **SPA routing** | `react-router-dom` v7 handles all client-side routes. Unauthenticated users are redirected to `/login`; unknown routes default to `/login`. |
| **Auth flow** | Login stores `access_token` and user object in `localStorage`. The `access_token` (signed by auth-service with `SHARED_AUTH_SECRET`) is sent as a Bearer header on admin requests. Admins are redirected to `/admin` on login; buyers go to `/home`. |
| **State management** | Three React contexts: `ToastContext` (global notifications), `SearchContext` (debounced product search term), `ThemeManager` (dark/light mode persisted to `localStorage`). No external state library — contexts + `localStorage` only. |
| **API abstraction** | `src/lib/api.js` provides `getApiBaseUrl()` (auth, default `:8001`) and `getProductsApiBaseUrl()` (products, default `:8002`). `src/lib/productsApi.js` wraps product CRUD calls. `src/lib/validation.js` provides client-side validation helpers. |
| **Role-based access** | `RequireAdmin` route guard checks the stored user's role; non-admins see a 403 page. The admin sidebar layout (`AdminLayout`) is only accessible to admins. |
| **UI components** | Reusable components in `src/components/` — `AuthLayout`, `InputField`, `Button`, `SearchBar`, `ProductGrid`, `ProductCard`, `ImageUploader`, `ConfirmDialog`, `ThemeToggle`, `PasswordStrength`, `Icons`. |
| **Theming** | CSS custom properties + `.dark` class toggle on `<html>`. Styles are split by feature (`auth.css`, `home.css`, `navbar.css`, `products.css`, `admin.css`). |
| **Build** | Vite dev server for development (`npm run dev`); production build outputs to `dist/`. |

### Request flow

1. User interacts with the React SPA (e.g., searches products, logs in, creates a product).
2. API calls are made to the nginx gateway (`:80`) via the API layer.
3. nginx proxies to the correct backend service based on path prefix.
4. Backend processes the request and returns a uniform `{message, status_code, data}` response.
5. The frontend handles the response, updates context/state, and re-renders the UI.

## Tech stack

- React 19 + Vite 8
- react-router-dom 7 (client-side routing)

## Structure

```
PixelForgefrientend/
├── index.html                  # Vite entry (title: PixelForge)
├── vite.config.js
├── package.json
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx                # Mounts App, imports global CSS
    ├── App.jsx                 # Routes + ThemeManager + ToastProvider + SearchProvider
    ├── styles/
    │   ├── auth.css            # Shared styles: layout, forms, toasts, dark theme
    │   ├── home.css            # Storefront home styles
    │   ├── navbar.css          # Shared navbar + search bar
    │   ├── products.css        # Product grid + status/spinner
    │   └── admin.css           # Admin panel styles (sidebar, tables, forms, modals)
    ├── lib/
    │   ├── api.js              # API base URLs, access token, auth headers, getUser/isAdminUser
    │   ├── productsApi.js      # Product CRUD + inventory API client
    │   └── validation.js       # validateEmail, validateField, passwordStrength
    ├── hooks/
    │   └── useTheme.js         # Reads/toggles .dark class + localStorage 'theme'
    ├── context/
    │   ├── toastContext.js     # ToastContext (createContext)
    │   ├── ToastContext.jsx    # ToastProvider — renders toast container
    │   ├── useToast.js         # useToast() hook
    │   ├── searchContext.js    # SearchContext (createContext)
    │   ├── SearchContext.jsx   # SearchProvider — debounced product search term
    │   └── useSearch.js        # useSearch() hook
    ├── components/
    │   ├── AuthLayout.jsx      # Two-panel layout (brand left + card right)
    │   ├── InputField.jsx      # Input w/ icon, floating label, error, password toggle
    │   ├── Button.jsx          # Button w/ ripple + loading spinner (variants, size)
    │   ├── PasswordStrength.jsx# 4-bar strength meter
    │   ├── ThemeToggle.jsx     # Sun/moon theme switch
    │   ├── SearchBar.jsx       # Debounced search input (name/brand/specification)
    │   ├── Navbar.jsx          # Shared storefront header (search, admin link, sign out)
    │   ├── ConfirmDialog.jsx   # Confirmation modal (used before delete)
    │   ├── ImageUploader.jsx   # Multi-image upload with previews (JPG/PNG/WEBP)
    │   ├── ProductGrid.jsx     # Fetches + renders product cards (search-aware)
    │   ├── ProductCard.jsx     # Product card with image slider
    │   └── Icons.jsx           # SVG icon components
    └── pages/
        ├── Login.jsx           # /login (stores access token, redirects admins)
        ├── Register.jsx        # /register
        ├── ForgotPassword.jsx  # /forgot-password
        ├── ResetPassword.jsx   # /reset-password?uid=..&token=..
        ├── Home.jsx            # /home (requires user in localStorage)
        ├── Products.jsx        # /products (storefront browsing + search)
        └── admin/
            ├── RequireAdmin.jsx      # Route guard: admin role only (else 403)
            ├── AdminLayout.jsx       # Sidebar layout for the admin area
            ├── AdminProducts.jsx     # Product list: search, filters, sort, pagination
            ├── AdminProductForm.jsx  # Create/edit product form
            ├── AdminProductDetail.jsx# Product view + inventory (stock) management
            ├── AdminInventoryLogs.jsx# Inventory movement logs
            └── AdminLowStock.jsx     # Low-stock alerts
```

## Routes

| Route                             | Page              | Notes                                                    |
|-----------------------------------|-------------------|----------------------------------------------------------|
| `/login`                          | Login             | Default redirect target for unknown routes               |
| `/register`                       | Register          |                                                          |
| `/forgot-password`                | ForgotPassword    | On success forwards `uid` + `token` to reset page        |
| `/reset-password`                 | ResetPassword     | Reads `uid` + `token` from query params                  |
| `/home`                           | Home              | Redirects to `/login` if no stored user                  |
| `/products`                       | Products          | Storefront browsing + search                             |
| `/admin`                          | AdminLayout       | Admin-only (non-admins see a 403 page)                   |
| `/admin/products`                 | AdminProducts     | Product inventory list                                   |
| `/admin/products/new`             | AdminProductForm  | Create product                                           |
| `/admin/products/:id`             | AdminProductDetail| View product + adjust stock + stock history              |
| `/admin/products/:id/edit`        | AdminProductForm  | Edit product                                             |
| `/admin/inventory/logs`           | AdminInventoryLogs| Inventory movement logs                                  |
| `/admin/inventory/low-stock`      | AdminLowStock     | Low-stock alerts                                         |

## Running

```bash
cd PixelForgefrientend
npm install
npm run dev       # http://localhost:5173
```

Other scripts: `npm run build` (production build to `dist/`), `npm run preview`, `npm run lint` (oxlint).

## Backend connection

All API calls use `getApiBaseUrl()` from `src/lib/api.js`, which reads `api_base_url` from `localStorage` and defaults to `http://localhost:8001`. Product calls use `getProductsApiBaseUrl()` (default `http://localhost:8002`).

| Page            | Endpoint                     | Method |
|-----------------|------------------------------|--------|
| Sign in         | `/api/auth/login/`           | POST   |
| Register        | `/api/auth/register/buyer/`  | POST   |
| Forgot password | `/api/auth/forgot-password/` | POST   |
| Reset password  | `/api/auth/reset-password/`  | POST   |

Admin product endpoints (protected by a bearer token issued at login — see `../PixelForgebackend/README.md`):

| Purpose                | Endpoint                                  | Method |
|------------------------|-------------------------------------------|--------|
| List/search/filter     | `/api/products/?page=&search=&category=…` | GET (public) |
| Create                 | `/api/products/` (multipart)              | POST   |
| Retrieve               | `/api/products/<id>/`                     | GET (public) |
| Update                 | `/api/products/<id>/` (multipart)         | PUT    |
| Delete                 | `/api/products/<id>/`                     | DELETE |
| Adjust stock           | `/api/products/<id>/stock/`               | PATCH  |
| Stock history          | `/api/products/<id>/stock/history/`       | GET    |
| Movement logs          | `/api/products/inventory/logs/`           | GET    |
| Low-stock alerts       | `/api/products/inventory/low-stock/`      | GET    |
| Resolve alert          | `/api/products/inventory/low-stock/<id>/resolve/` | PATCH |
| Filter options         | `/api/products/meta/`                     | GET (public) |

The authenticated user is stored in `localStorage` under `user` and the access token under `access_token`. See `../PixelForgebackend/README.md` for backend setup.
