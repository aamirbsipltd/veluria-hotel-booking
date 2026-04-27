# Veluria — Hotel Search & Booking

> A full hotel search and booking flow built against the **ETG / RateHawk B2B API**, demonstrating the integration patterns that matter for production travel-tech work.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)](https://www.prisma.io)

**Live demo:** [veluria.vercel.app](https://veluria.vercel.app) · **Stack:** Next.js 16 · TypeScript · Tailwind CSS v4 · Prisma 7 · PostgreSQL

---

## What this demonstrates

The ETG B2B API is not a simple REST wrapper — it has idempotency requirements, a two-step booking process, prebook revalidation, and sandbox quirks that only show up when you've actually integrated it. This project covers all of it:

| Pattern | Where |
|---|---|
| Destination autocomplete with debounced region search | `DestinationAutocomplete` + `/api/etg/multicomplete` |
| SERP search with server-side caching (SHA-1 key, 600s TTL) | `/api/etg/search` + `src/lib/cache/` |
| Hotel page with parallel info + rates fetch | `hotel/[hid]/page.tsx` |
| Prebook revalidation — price drift and sold-out handling | `/api/etg/prebook` + `PrebookStatusBanner` |
| Idempotent booking via `partner_order_id` (UUID in URL) | `/api/etg/book` + `BookingStatusPoller` |
| Two-step ETG booking (form → finish) in one server roundtrip | `src/app/api/etg/book/route.ts` |
| Server-only API key — credentials never enter the client bundle | `src/lib/etg/adapter.ts` (`import 'server-only'`) |
| Zod schemas as the API contract (zero `any`) | `src/lib/etg/types.ts` |
| Timezone-aware cancellation policy display | `CancellationPolicyDisplay` + `src/lib/policy/cancellation.ts` |
| PDF voucher generation via React-PDF | `src/lib/booking/voucher.tsx` + `/api/voucher/[id]` |
| Mock-first development (one env var flips to real sandbox) | `src/lib/etg/adapter.ts` + `mock-client.ts` |

---

## Architecture

```
Browser
  │
  ├── /                     Landing page (server component)
  ├── /search               Results page — client filters over server-fetched data
  ├── /hotel/[hid]          Detail page — parallel fetch: hotelpage + hotel-info
  ├── /prebook/[id]         Prebook revalidation + guest form (client component)
  └── /confirmation/[id]    Booking status poller → voucher display
         │
         │  All ETG calls go through Next.js route handlers
         │  (API key never leaves the server)
         │
  ├── /api/etg/multicomplete   Destination autocomplete
  ├── /api/etg/search           SERP — region search with cache
  ├── /api/etg/hotelpage        Single hotel rates (no cache)
  ├── /api/etg/hotel-info       Static hotel content (3600s cache)
  ├── /api/etg/prebook          Rate revalidation before booking
  ├── /api/etg/book             Combined form + finish (idempotent)
  ├── /api/etg/booking-status   Poll booking state, update Prisma
  ├── /api/etg/booking-record   Load booking for confirmation page
  └── /api/voucher/[id]         Stream PDF via @react-pdf/renderer
         │
         └── ETG / RateHawk B2B API
               sandbox: api-sandbox.worldota.net
               prod:    api.worldota.net
```

```
src/lib/etg/
├── client.ts          Real HTTP client (server-only, 25s timeout, rate-limit logging)
├── mock-client.ts     Typed mock — simulate arg is method-level, never module state
├── adapter.ts         Picks real vs mock based on ETG_USE_MOCKS env var
├── types.ts           All Zod schemas — the single source of truth for API shapes
├── errors.ts          EtgApiError / EtgNetworkError
├── payment-selection.ts  selectHotelPayment(), minDisplayPrice(), filterHotelPaymentRates()
├── photo-url.ts       resolvePhotoUrl() — replaces ETG {size} template placeholder
└── mocks/
    ├── master-hotels.ts  Single fixture for ALL mock data (20+ hotels, 4 cities)
    └── regions.ts        4 sandbox-valid region IDs
```

---

## Why the proxy layer

ETG credentials (key ID + API key) are passed via HTTP Basic auth. Putting them in client-side code would expose them in the browser. Every ETG call goes through a Next.js route handler with `import 'server-only'` enforced at the adapter level — the build fails if any component tries to import the ETG client directly.

---

## Key decisions

**Mock-first, env-var toggle.** `ETG_USE_MOCKS=true` (default) runs the full UI against deterministic fixtures in `master-hotels.ts`. Set `ETG_USE_MOCKS=false` plus real credentials to hit the sandbox. The mock implements the exact same TypeScript interface as the real client — the adapter is a one-liner type cast.

**`partner_order_id` lives in the URL.** Generated once in the browser (`crypto.randomUUID()`), placed in the URL, reused on retries. ETG returns `duplicate_reservation` on replay; the `/api/etg/book` handler returns the existing Prisma record rather than an error. No separate session table needed.

**Combined form + finish endpoint.** The ETG booking flow requires two sequential API calls: `booking/form/` then `booking/finish/`. Rather than exposing both to the client, `/api/etg/book` handles both in one server roundtrip. Simpler client code, fewer round trips, and the idempotency key covers the combined operation.

**Simulation as a method argument.** `mockClient.prebook(hash, simulate?)` takes the simulate mode as a method parameter, not module-level state. Module-level state is shared across concurrent serverless requests — a production bug waiting to happen.

**Hotel-payment rates only.** ETG offers `hotel`, `now`, and `deposit` payment types. This MVP filters to `hotel` (pay-at-property) only, avoiding PCI scope entirely.

**Zod schemas as the API contract.** `src/lib/etg/types.ts` defines every ETG response shape as a Zod schema. The real client validates every response through the schema before returning. No `any` types anywhere in `src/lib/etg/` or `src/app/api/etg/`.

---

## Background

This is a portfolio implementation of a hotel search and booking flow against the Emerging Travel Group B2B API. The integration patterns demonstrated — prebook revalidation, idempotent booking via `partner_order_id`, server-only credential handling, search-result caching, timezone-aware cancellation policies — are the patterns that matter for production travel-tech work.

---

## Running locally

**Prerequisites:** Node 20+, Docker (for local Postgres)

```bash
# 1. Clone and install
git clone https://github.com/aamirbsipltd/veluria-hotel-booking.git
cd veluria-hotel-booking
npm install

# 2. Start Postgres
docker run -d --name pg-veluria -e POSTGRES_PASSWORD=dev -p 5432:5432 postgres:16

# 3. Configure environment
cp .env.example .env.local
# .env.local already has ETG_USE_MOCKS=true — no credentials needed

# 4. Run migrations and start
npx prisma migrate dev --name init
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app runs entirely against typed mocks — no ETG account required.

### Switching to the ETG sandbox

```bash
# .env.local
ETG_USE_MOCKS=false
ETG_KEY_ID=your_key_id
ETG_KEY=your_api_key
ETG_BASE_URL=https://api-sandbox.worldota.net
```

**Sandbox constraints:** Only 4 region IDs work (Dubai `2011`, Tokyo `2395`, Madrid `2734`, Lisbon `6053839`). Currency input is ignored — all responses return USD. Booking-form responses always return `currency_code: EUR` regardless of input.

### Vercel deployment

1. Push to GitHub
2. Import in Vercel, add [Neon Postgres](https://neon.tech) integration (sets `DATABASE_URL` automatically)
3. Add `ETG_KEY_ID`, `ETG_KEY`, `ETG_BASE_URL`, `ETG_USE_MOCKS` to Vercel environment variables

The `vercel-build` script runs `prisma generate && prisma migrate deploy && next build` automatically.

---

## Project structure

```
hotel-booking/
├── prisma/
│   ├── schema.prisma          PostgreSQL schema (Booking model)
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── page.tsx                              # Veluria landing page
│   │   ├── search/page.tsx                       # Results with live filters
│   │   ├── hotel/[hid]/page.tsx                  # Hotel detail + rooms
│   │   ├── prebook/[partnerOrderId]/page.tsx     # Revalidation + guest form
│   │   ├── confirmation/[partnerOrderId]/page.tsx # Status poller + voucher
│   │   └── api/etg/                              # All ETG proxy routes
│   ├── components/
│   │   ├── search-form.tsx                       # Destination + dates + guests
│   │   ├── results-list.tsx                      # framer-motion stagger grid
│   │   ├── hotel-card.tsx                        # Embla carousel + min price
│   │   ├── filter-sidebar.tsx                    # Live counts, mobile Sheet
│   │   ├── photo-gallery.tsx                     # yet-another-react-lightbox
│   │   ├── room-card.tsx                         # rg_ext mappings + sim buttons
│   │   ├── guest-form.tsx                        # react-hook-form + phone input
│   │   ├── booking-status-poller.tsx             # 2s poll, 30s timeout
│   │   └── voucher-preview.tsx                   # HTML voucher layout
│   └── lib/
│       ├── etg/                                  # API client, types, mocks
│       ├── booking/                              # prebook-decision, PDF voucher
│       ├── cache/                                # ICache interface + memory impl
│       ├── policy/                               # Cancellation policy parser
│       └── room/                                 # rg_ext integer → label maps
└── scripts/
    ├── smoke-test.ts       Full flow test (multicomplete → book → status)
    └── validate-mocks.ts   Validates master-hotels.ts against Zod schemas
```

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build (TypeScript checked) |
| `npm run smoke` | End-to-end smoke test against a running server |
| `npm run validate-mocks` | Validate all mock hotels against ETG Zod schemas |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:studio` | Open Prisma Studio |

---

## What's intentionally not in scope

| Feature | Production approach |
|---|---|
| **Payments** | Voucher-on-arrival used here; Stripe for card-now rates |
| **User accounts / auth** | No auth — would add NextAuth or Clerk |
| **Email notifications** | Resend or SendGrid on booking confirmed |
| **Multi-currency** | ETG sandbox returns USD only; production would pass user currency |
| **Map view** | Latitude/longitude in hotel-info response, ready for Mapbox |
| **Rate limiting** | Upstash Redis + `@upstash/ratelimit` on route handlers |
| **Error monitoring** | Sentry on server components and route handlers |
| **Unit / integration tests** | Vitest + MSW for route handler testing |

---

## Stack

- **Framework:** [Next.js 16](https://nextjs.org) App Router
- **Language:** TypeScript (strict)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- **Forms:** react-hook-form + Zod resolver
- **Validation:** [Zod v4](https://zod.dev)
- **ORM / DB:** [Prisma 7](https://www.prisma.io) + PostgreSQL (Neon in prod, Docker locally)
- **Cache:** In-memory TTL cache with Redis-ready `ICache` interface
- **Animations:** [framer-motion](https://www.framer.com/motion)
- **Carousel:** [Embla Carousel](https://www.embla-carousel.com)
- **Lightbox:** [yet-another-react-lightbox](https://yet-another-react-lightbox.com)
- **Phone input:** react-phone-number-input
- **PDF:** [@react-pdf/renderer](https://react-pdf.org)
- **Dates:** date-fns v4 + date-fns-tz v3
- **Hosting:** [Vercel](https://vercel.com)
