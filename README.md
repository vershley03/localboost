# LocalBoost

AI-powered marketing assistant for local businesses — generate on-brand social posts, plan a content calendar, and publish to Instagram, Facebook, and Google Business from one dashboard.

## Structure

| Path | What it is |
|------|------------|
| `frontend/` | Next.js 16 app (landing page + dashboard) |
| `backend/` | NestJS API (scaffold — not yet implemented) |
| `prisma/` | Database schema (PostgreSQL via Supabase) |

## Running the frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000. The dashboard currently runs fully client-side: posts, brand settings, and integration state persist to `localStorage`, and the Facebook/Instagram connect flow uses a sandboxed mock OAuth screen (`/api/mock/facebook/oauth`).

## Environment

Copy `backend/.env.example` and fill in credentials as services come online:

- `DATABASE_URL` — Supabase Postgres (used by Prisma)
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — frontend auth
- `SUPABASE_SERVICE_ROLE_KEY` — server-side Supabase access
- `OPENAI_API_KEY` — real AI content generation
- Meta App ID/Secret — real Facebook/Instagram OAuth (replaces the mock flow)
- `STRIPE_SECRET_KEY`, `RESEND_API_KEY` — payments and email (later)

## Database

```bash
npm run db:generate   # generate Prisma client
npm run db:push       # push schema to the database
npm run db:studio     # browse data
```
