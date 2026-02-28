# N-Mart — Grocery Delivery (Frontend)

A fully functional **frontend-only** grocery delivery system built with Next.js 14, TypeScript, TailwindCSS, ShadCN-style UI, Framer Motion, React Hook Form, and Zustand.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **ShadCN-style UI** (Radix primitives + custom styles)
- **Framer Motion** (animations)
- **React Hook Form**
- **Zustand** (global state)
- **Lucide Icons**
- **Recharts** (dashboard charts)

## Mock Auth — Default Credentials

| Role           | Email              | Password   | Redirect        |
|----------------|--------------------|------------|-----------------|
| Admin         | admin@nmart.com    | admin123   | /admin          |
| Product Manager | pm@nmart.com     | pm123      | /pm             |
| Delivery Boy  | delivery@nmart.com | delivery123 | /delivery     |
| User          | user@nmart.com     | user123    | /user/home      |

No real backend or Firebase. Login state is stored in Zustand (persisted).

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to `/login`. Use any of the credentials above to enter the respective module.

## Project Structure

```
app/
  login/          # Unified login & signup (tabs)
  signup/         # Redirects to /login
  admin/          # Admin dashboard, products, categories, orders, users, delivery, settings
  pm/             # Product Manager: dashboard, products, categories, inventory
  delivery/       # Delivery: dashboard, assigned orders, history
  user/
    home/         # Product grid, categories, cart drawer
    checkout/     # Address, location validation (mock), place order
    order-confirmation/
    orders/       # My orders, track order (timeline UI)
    profile/      # Profile (mock)
components/
  ui/             # Button, Input, Card, Dialog, Tabs, Select, etc.
  sidebar.tsx
  cart-drawer.tsx
  theme-provider.tsx
  theme-toggle.tsx
  dashboard-layout.tsx
store/
  auth-store.ts   # Mock login/signup, redirect by role
  cart-store.ts   # Cart items, total
  ui-store.ts     # Theme, sidebar open
lib/
  utils.ts
  mock-data.ts    # 60 products, categories, orders, users, chart data
types/
  index.ts        # User, Product, Order, CartItem, etc.
```

## Features

- **Login**: Email+Password and Mobile+OTP (UI only), Forgot Password modal (UI only).
- **Admin**: Dashboard with stats and sales chart, product table (search, filter, add/edit modal, stock badges, inline price edit), categories, orders, users, delivery boys, settings.
- **PM**: Dashboard, products, categories, inventory, low stock alerts. No orders/users.
- **Delivery**: Assigned orders (accept/reject, status: Accepted → Out for delivery → Delivered), earnings card, order detail modal with map placeholder, delivery history.
- **User**: Category horizontal scroll, 50+ product grid, add to cart, cart sidebar drawer, checkout, order confirmation, my orders with tracking timeline, profile, location validation (mock).

## UI

- Glassmorphism cards, gradient buttons, dark/light/system theme toggle, responsive sidebar, loading skeletons, Framer Motion transitions.

## Shop address & Leaflet maps

- **Shop address**: [Google Maps link](https://maps.app.goo.gl/2sdvZ8Jky3yqx5qi8) is stored in `lib/locations.ts` as `SHOP_LOCATION.mapsUrl`. Map markers use the same area; open the link for the exact spot.
- **User location**: Mock coordinates from address pincode via `getMockUserLocation()` (no real geocoding).
- **Route**: Driving route from shop to user uses the free **OSRM** API; route is drawn on the map.

### Order tracking (Swiggy/Instamart style)

- **User** → **My Orders** → **Track**: Opens a tracking view with:
  - **Leaflet map**: Shop (green), your address (blue), route line, and a **delivery partner** marker (orange) that moves along the route when status is “Out for delivery”.
  - **Status timeline**: Order placed → Accepted → Out for delivery → Delivered.
- Also used: **Delivery** → Order **Details** (static map); **User** → **Checkout** (route preview).

Replace `getMockUserLocation()` with a real geocoding API when you add a backend.

## Connecting a Real Backend

Replace or extend:

1. `store/auth-store.ts` — call your auth API and set user/redirect.
2. `lib/mock-data.ts` — replace with API calls or move to server actions.
3. `store/cart-store.ts` — optionally sync cart with backend.

Keep the same routes and role-based redirects so the rest of the app stays unchanged.
