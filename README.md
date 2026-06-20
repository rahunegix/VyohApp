# Saathini

**From Connection to Commitment**

Uttarakhand's verified relationship platform where users can explore, connect, and move toward commitment at their own pace.

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- Framer Motion
- React Hook Form + Zod
- Zustand
- Supabase (Auth, PostgreSQL, Storage, Realtime)

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database Setup

Run migrations in order via Supabase SQL Editor:

1. `src/database/migrations/001_initial_schema.sql`
2. `src/database/migrations/002_rls_policies.sql`
3. `src/database/migrations/003_storage_buckets.sql`
4. `src/database/seeds/001_subscription_plans.sql`

## Project Structure

```
src/
  app/           # Next.js App Router pages
  components/    # UI components
  lib/           # Utilities, Supabase, AI, matching
  hooks/         # Custom React hooks
  store/         # Zustand state
  types/         # TypeScript types
  services/      # Server actions & demo data
  database/      # SQL migrations & seeds
```

## Features

- Mobile-first PWA (480px max width)
- AI-assisted onboarding
- Intent system (Exploring / Serious / Marriage)
- Compatibility engine
- Consent-based chat
- Trust Center with verification badges
- Subscription tiers
- Full privacy controls & self-service account management

## Deployment

Deploy to Vercel:

```bash
npm run build
```

Set environment variables in Vercel dashboard.

## License

Private — All rights reserved.
