# Hotel Booking MVP — ETG / RateHawk Integration Demo

> **Status:** Phase 2 complete — live demo at [veluria.vercel.app](https://veluria.vercel.app)

A working hotel search and booking flow built against the Emerging Travel Group (ETG / RateHawk) B2B API. Built as a portfolio piece to demonstrate competence with travel-API integration patterns.

## What this demonstrates

- Search → results → hotel detail → prebook → book → voucher flow
- Prebook revalidation handling (price drift, sold-out)
- ETG-native idempotent booking (`partner_order_id` dedup)
- Server-only API key (never enters client bundle)
- Search-result caching with TTL (Redis-ready `ICache` interface)
- Timezone-aware cancellation policy display
- PDF voucher generation

## Running locally

```bash
git clone <repo-url>
cd hotel-booking-mvp
npm install
cp .env.example .env.local
# Edit .env.local if needed (ETG_USE_MOCKS=true by default)
npx prisma migrate dev
npm run dev
```

Demo runs against typed mocks by default. To use the ETG sandbox, set `ETG_USE_MOCKS=false` and add credentials to `.env.local`.

## Stack

- **Framework:** Next.js 16, App Router
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Validation:** Zod
- **ORM / DB:** Prisma 7 + PostgreSQL (Neon in prod, Docker locally)
- **Cache:** In-memory LRU with TTL (Redis-ready interface)
- **PDF:** @react-pdf/renderer
- **Dates:** date-fns + date-fns-tz
- **Hosting:** Vercel

## What's intentionally not in scope

- **Payments** — voucher-on-arrival pattern used; would add Stripe in production
- **User accounts** — no auth; out of MVP scope
- **Multi-currency / multi-language** — en-US + USD only
- **Email notifications** — would be Resend/SendGrid in production
- **Map view, advanced filters** — amenities, radius search
- **Tests beyond smoke test** — unit/integration tests would use Vitest
- **Rate limiting, monitoring** — would be Upstash + Sentry in production
