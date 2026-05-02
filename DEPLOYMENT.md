# Deployment Guide for N-Mart

This guide provides step-by-step instructions to deploy N-Mart to Vercel.

## Prerequisites

- Node.js 18+ installed locally
- npm or yarn package manager
- Vercel account (https://vercel.com)
- PostgreSQL database (or use Vercel Postgres)

## Local Setup & Testing

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and configure:

```env
# PostgreSQL connection string
DATABASE_URL=postgresql://username:password@localhost:5432/nmart

# Data source mode (api for production)
NEXT_PUBLIC_DATA_SOURCE_MODE=api

# Node environment
NODE_ENV=development
```

### 3. Set Up PostgreSQL Database

#### Option A: Local PostgreSQL
```bash
# Create database
createdb nmart

# Update DATABASE_URL to point to your local instance
# DATABASE_URL=postgresql://user:password@localhost:5432/nmart
```

#### Option B: Vercel Postgres (Recommended for Production)
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Storage tab → Create Database → Postgres
4. Copy the connection string and save for later

#### Option C: Alternative Services
- **Neon**: https://neon.tech (Free tier available)
- **Railway**: https://railway.app (Simple deployment)
- **AWS RDS**: https://aws.amazon.com/rds/postgresql/

### 4. Initialize Database Schema

```bash
# Generate Prisma migrations
npm run prisma:migrate:dev

# You'll be prompted for a migration name, e.g., "init"
# This creates migration files in prisma/migrations/
```

### 5. Test Build Locally

```bash
npm run build
```

Should complete without errors. You'll see:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
```

### 6. Start Development Server

```bash
npm run dev
```

Access at http://localhost:3000

## Deploying to Vercel

### Step 1: Push Code to Git

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 2: Create Vercel Project

1. Go to https://vercel.com/new
2. Import your Git repository
3. Select **Next.js** as the framework
4. Click "Deploy"

### Step 3: Configure Environment Variables in Vercel

In Vercel Dashboard → Settings → Environment Variables:

1. Add `DATABASE_URL`:
   - Paste your PostgreSQL connection string
   - Ensure it's available in all environments (Production, Preview, Development)

2. Add `NEXT_PUBLIC_DATA_SOURCE_MODE`:
   - Value: `api`
   - Required for all environments

Example:
```
DATABASE_URL = postgresql://user:password@host:5432/nmart
NEXT_PUBLIC_DATA_SOURCE_MODE = api
```

### Step 4: Deploy Database Schema

After deployment, run migrations on Vercel's database:

```bash
# From your local environment with DATABASE_URL pointing to Vercel Postgres
npm run prisma:migrate:deploy
```

Or use Vercel CLI:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy with environment variables
vercel env pull .env.production.local
npm run prisma:migrate:deploy
```

### Step 5: Verify Deployment

1. Go to your Vercel deployment URL
2. Test login with credentials:
   - Email: `user@nmart.com` | Password: `user123`
   - Admin: `admin@nmart.com` | Password: `admin123`
   - PM: `pm@nmart.com` | Password: `pm123`
   - Delivery: `delivery@nmart.com` | Password: `delivery123`

## Important Build Scripts

```bash
# Generate Prisma client and build
npm run build

# Deploy database migrations
npm run prisma:migrate:deploy

# Generate Prisma client only
npm run prisma:generate

# Create new migration (dev only)
npm run prisma:migrate:dev
```

## Troubleshooting

### Database Connection Error

**Error**: `PrismaClientKnownRequestError: Can't reach database server`

**Solution**:
- Verify `DATABASE_URL` is correct in Vercel environment variables
- Check database server is running and accessible
- For Vercel Postgres, ensure IP allowlisting is configured

### Build Fails with Prerender Error

**Error**: `Error occurred prerendering page "/api/..."`

**Solution**:
- API routes use `export const dynamic = 'force-dynamic'` to prevent prerendering
- This is already configured in the project
- No manual action needed

### Missing Migrations

**Error**: `relation "public.User" does not exist`

**Solution**:
```bash
npm run prisma:migrate:deploy
```

### Prisma Client Out of Date

**Warning**: `Generated client out of sync`

**Solution**:
```bash
npm install @prisma/client@latest
npm run prisma:generate
```

## Production Checklist

- [ ] Database is PostgreSQL (not SQLite)
- [ ] `DATABASE_URL` is set in Vercel environment variables
- [ ] `NEXT_PUBLIC_DATA_SOURCE_MODE=api` is set
- [ ] Migrations are deployed to production database
- [ ] Build completes successfully (`npm run build`)
- [ ] Login functionality works with test credentials
- [ ] All API routes are responding correctly
- [ ] No console errors in browser DevTools

## Data Persistence

N-Mart uses:
- **PostgreSQL** for persistent data storage
- **Zustand** with localStorage for local state (client-side only)
- **Prisma** ORM for database operations

When running in `NEXT_PUBLIC_DATA_SOURCE_MODE=local`, data is not persisted (demo mode).
For production, use `NEXT_PUBLIC_DATA_SOURCE_MODE=api` to store data in PostgreSQL.

## Security Notes

⚠️ **Important**: Never commit `.env.local` to Git. It's in `.gitignore` for security.

Always use environment variables in Vercel Dashboard, never hardcode credentials.

## Support

For issues:
1. Check Vercel deployment logs: Dashboard → Deployments → View Build Logs
2. Check Vercel runtime logs: Dashboard → Functions
3. Use Vercel CLI: `vercel logs`

---

**Last Updated**: May 2, 2026
