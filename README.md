# N-Mart — Grocery Delivery (Frontend + Backend)

A full-stack grocery delivery system built with Next.js 14, TypeScript, TailwindCSS, ShadCN-style UI, Framer Motion, React Hook Form, Zustand, and Prisma/PostgreSQL.

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

## Data Source Mode (Local or API)

The app now includes a repository bridge so frontend modules can switch from local state to API endpoints without page-level rewrites.

Set this environment variable:

```bash
NEXT_PUBLIC_DATA_SOURCE_MODE=local
```

or

```bash
NEXT_PUBLIC_DATA_SOURCE_MODE=api
```

- `local` (default): uses Zustand/localStorage adapters.
- `api`: uses fetch-based adapters that call Next.js API routes.

### API Endpoints Added

- `GET /api/catalog`
- `GET /api/catalog/activities?limit=50`
- `POST /api/catalog/products`
- `PUT /api/catalog/products/:id`
- `PATCH /api/catalog/products/:id/price`
- `DELETE /api/catalog/products/:id`
- `GET /api/users`
- `GET /api/auth/activities?limit=50`

For product mutations in API mode, role is read from `x-user-role` header (`admin`/`pm` for create/update/price, `admin` for delete).

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to `/login`. Use any of the credentials above to enter the respective module.

## Project Structure

```
app/
  (frontend)/     # User-facing/admin/pm/delivery routes (URLs unchanged)
    login/
    signup/
    admin/
    pm/
    delivery/
    user/
  api/            # Backend API routes

frontend/
  components/     # UI and layout components
  store/          # Zustand client stores
  messages/       # i18n message bundles
  i18n/           # next-intl request config
  types/          # Shared UI-side TS types

backend/
  repositories/   # Data source adapters (local/api)
  server/         # Server-side data/auth logic

lib/
  utils.ts        # shared helpers
  prisma.ts       # Prisma client bootstrap

prisma/
  schema.prisma   # PostgreSQL schema
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
