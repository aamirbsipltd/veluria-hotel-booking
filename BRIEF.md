# Veluria — Hotel Booking MVP: Codebase Brief

**Live:** https://veluria-nu.vercel.app  
**Stack:** Next.js 16 App Router · TypeScript strict · Tailwind v4 · shadcn/ui · Prisma v7 + Supabase (Supavisor) · ETG/RateHawk B2B API  
**Mock mode:** `ETG_USE_MOCKS=true` in `.env.local` — flip to hit real sandbox.

---

## App flow

```
/ (landing)
  └─ SearchForm → /search?region_id=&destination=&checkin=&checkout=&guests=&residency=
       └─ HotelCard "View hotel" → /hotel/[hid]?checkin=&checkout=&guests=&residency=
            └─ RoomCard "Book this room" → /prebook/[partnerOrderId]?searchHash=&...
                 └─ GuestForm submit → /api/etg/book → /confirmation/[partnerOrderId]
                      └─ BookingStatusPoller → confirmed → VoucherPreview + Download PDF
```

---

## Page 1 — Landing (`src/app/page.tsx`)

Server component.

- Full-viewport Unsplash hero (`photo-1571003123894`) with `bg-black/50` overlay.
- Centered `max-w-2xl` column:
  - White `rounded-2xl` badge with `veluria-logo.png` (160×160) + tagline "Hotels, simplified."
  - Glass card `bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl` containing `<SearchForm />`.
  - Trust strip: Shield "Secure booking" · CheckCircle "Free cancellation on many rooms" · Headphones "24/7 support".

**`<SearchForm />`** (client, `src/components/search-form.tsx`):
- `<DestinationAutocomplete />` — 250ms debounce, flag emoji + city, stores `{ regionId, label }`.
- 2-col grid: `<DateRangePicker />` + `<GuestsRoomsPicker />`.
- Smart defaults: checkin = tomorrow, checkout = tomorrow+3. `resetOnSelect` on calendar (re-click always starts fresh).
- Submit → `router.push('/search?...')`.

---

## Page 2 — Search Results (`src/app/search/page.tsx`)

Server component. **Calls ETG directly** (no HTTP self-fetch).

- Sticky header: ← arrow + small Veluria logo pill · destination · dates.
- `<Suspense fallback={8 skeleton cards}>` → `<SearchResults />`.
- `SearchResults` checks in-memory cache (`searchCacheKey`) → `etg.searchByRegion(...)` → cache 600s.
- Passes `hotels`, `masterHotels` (ALL_HOTELS), `searchParams` to `<ResultsList />`.

**`<ResultsList />`** (client, `src/components/results-list.tsx`):
- Client-side filter (price slider, stars, free-cancel, meal) + sort.
- Live counts in brackets on filter labels.
- Mobile: filter sidebar = Sheet (bottom drawer). Desktop: fixed left sidebar.
- framer-motion stagger animation on card list mount (`staggerChildren: 0.05`).

**`<HotelCard />`** (client, `src/components/hotel-card.tsx`):
- Embla carousel, 4 photos (640×400). Prev/next arrows on hover.
- Free-cancel green badge top-left.
- Hotel name, 5-star row (amber filled), "from X per night", "View hotel" button → `/hotel/[hid]?${searchParams}`.

---

## Page 3 — Hotel Detail (`src/app/hotel/[hid]/page.tsx`)

Server component. **Calls ETG directly** (fixed: previously self-fetched and broke on Vercel).

Data (parallel):
1. `etg.hotelInfo('t/${hid}')` — in-memory cache 3600s.
2. `etg.hotelpage({ hid, checkin, checkout, residency, guests })` — no cache.
3. Rates filtered to `hotel` payment type only.

Layout (`min-h-screen bg-gray-50`, `max-w-6xl mx-auto px-4 py-8`):
- `<PhotoGallery />` — yet-another-react-lightbox, full-width.
- 3-col grid `lg:grid-cols-3`:
  - **Left (span 2):** Stars · "Region, CC" · hotel name h1 · address. Check-in/out times. Description paragraphs. Amenity groups (2-col, emerald checkmarks).
  - **Right (span 1):** Sticky card — search dates + guest count + hotel phone.
- Full-width: "Available rooms" + `<RoomList />`.

**`<RoomList />`** → maps rates → `<RoomCard showSimButtons={i===0} />`.

**`<RoomCard />`** (client, `src/components/room-card.tsx`):
- Room name + `main_name` subtitle. Price top-right (total for stay).
- Badges: bedding · capacity · view · meal label · "Only N left" (allotment ≤ 3).
- First 5 amenity chips + "+N more".
- `<CancellationPolicyDisplay />`.
- "Book this room" → generates `crypto.randomUUID()` → `/prebook/[uuid]?searchHash=&originalAmount=&currency=&hid=&hotelName=&checkin=&checkout=&guests=&residency=`.
- Row 0 only: amber "Simulate price change" + red "Simulate sold out" outline buttons.

---

## Page 4 — Prebook (`src/app/prebook/[partnerOrderId]/page.tsx`)

Client component. On mount POSTs `/api/etg/prebook` → spinner "Verifying room availability…".

Three outcomes from `PrebookDecision`:
| Kind | UI |
|------|----|
| `match` | Green banner + `<GuestForm />` immediately visible |
| `price_changed` | Amber alert with old→new price · [Confirm] reveals form · [Back] |
| `sold_out` | Red banner + "Back to hotel" link |

Top of page: white card — hotel name · "checkin → checkout · N adults".

**`<GuestForm />`** (client, `src/components/guest-form.tsx`):
- react-hook-form + zod resolver.
- Fields: First name · Last name · Email · Phone (`react-phone-number-input`, international, defaultCountry=US) · Special requests.
- Summary box: "Total: {currency} {amount}" · "Pay at hotel • No card required now".
- Submit → POST `/api/etg/book` → `router.push('/confirmation/[partnerOrderId]')`.

---

## Page 5 — Confirmation (`src/app/confirmation/[partnerOrderId]/page.tsx`)

Client component.

On mount: fetches `/api/etg/booking-record?partner_order_id=...`.

If `in_progress` → `<BookingStatusPoller />` polls `/api/etg/booking-status` every 2s, max 15 tries (~30s).

Status banners:
- **confirmed**: emerald bg, checkmark, "Booking confirmed! Check your email for details."
- **failed/cancelled**: red bg, "Your payment was not charged. Please try again."

**`<VoucherPreview />`** (always shown, `src/components/voucher-preview.tsx`):
- Indigo header: "VELURIA" label · "Booking Confirmation" · booking ref (first 8 chars uppercased).
- White body: Hotel section · Stay (checkin/checkout/nights) · Guest (name + email) · Payment (total · "Pay at hotel" · cancellation text).
- Dashed footer: "Present this confirmation at check-in".

Action row:
- "Download Voucher" (indigo) → `/api/voucher/[partnerOrderId]` (PDF stream).
- "Share" (outline) → Web Share API or clipboard fallback.

CTA card: "Explore more destinations" → "Search again" → `/`.

---

## API Routes

| Route | Method | Notes |
|-------|--------|-------|
| `/api/etg/multicomplete` | GET `?q=` | Region autocomplete, `Cache-Control: max-age=60` |
| `/api/etg/search` | POST | `SearchByRegionRequest`, in-memory cache 600s |
| `/api/etg/hotelpage` | POST | `HotelpageRequest`, filters to hotel-payment rates |
| `/api/etg/hotel-info` | GET `?id=` | Static content, in-memory cache 3600s |
| `/api/etg/prebook` | POST | Rate revalidation → `decidePrebookOutcome()` |
| `/api/etg/book` | POST | Form+finish combined, upserts Prisma `Booking` row |
| `/api/etg/booking-status` | GET `?partner_order_id=` | Polls ETG, updates Prisma status |
| `/api/etg/booking-record` | GET `?partner_order_id=` | Returns Prisma row as JSON |
| `/api/voucher/[partnerOrderId]` | GET | PDF via `@react-pdf/renderer`, `renderToStream` |

---

## ETG / RateHawk integration

- **Adapter** (`src/lib/etg/adapter.ts`): exports `etg` — real client or mock depending on `ETG_USE_MOCKS`.
- **Real client** (`src/lib/etg/client.ts`): `import 'server-only'`. Basic auth `KEY_ID:KEY`. 25s timeout. Zod-parses all responses.
- **Mock client** (`src/lib/etg/mock-client.ts`): derives from `master-hotels.ts`. 200–600ms simulated delay.
- **Master hotels** (`src/lib/etg/mocks/master-hotels.ts`): single source of truth, 20+ hotels across 4 regions.
- **Sandbox-valid region IDs:** 6053839 Lisbon · 2734 Madrid · 2395 Tokyo · 2011 Dubai.
- **Sandbox quirk:** `bookingForm` always returns `currency_code: 'EUR'` regardless of input.
- `simulate` arg on prebook: `'price_changed'` (8% higher) | `'sold_out'` — passed as method arg, never module-level state.

---

## Database

- Prisma v7 + `@prisma/adapter-pg` (driver adapter mode — no Prisma engine).
- `PrismaPg({ connectionString, ssl: { rejectUnauthorized: false } })` — SSL required for Supabase.
- Production `DATABASE_URL`: Supavisor pooler `aws-1-us-east-1.pooler.supabase.com:6543`, username `postgres.{projectRef}`.
- `Booking` model: `partnerOrderId` (unique), `etgOrderId`, `itemId`, `status`, `hid`, `hotelName`, `checkin`, `checkout`, `guestsJson`, `bookHash`, `totalAmount`, `currencyCode`, `paymentType`, `leadGuestFirst/Last/Email/Phone`, `cancellationJson`, `freeCancelBefore`, `rawFormResponse`.

---

## Styling conventions

- Tailwind v4: CSS-based config (`@import "tailwindcss"` in globals.css) — no `tailwind.config.ts`.
- Accent colour: `indigo-600` for primary buttons and links.
- Status: `emerald` = success/confirmed · `amber` = warning/price-change · `red` = error/sold-out/failed.
- Cards: `rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md`.
- Page backgrounds: `/` = hero image · `/search` = `bg-background` · all others = `bg-gray-50`.
- No global nav or footer — each page is self-contained.

---

## Key lib files

| File | Purpose |
|------|---------|
| `src/lib/etg/types.ts` | All Zod schemas — `Rate`, `HotelInfoResponse`, `PaymentType`, etc. |
| `src/lib/etg/payment-selection.ts` | `selectHotelPayment()`, `minDisplayPrice()`, `filterHotelPaymentRates()` |
| `src/lib/etg/photo-url.ts` | `resolvePhotoUrl(template, size)` — replaces `{size}` placeholder |
| `src/lib/cache/memory.ts` | In-memory LRU cache (200 entries, FIFO), singleton `cache` |
| `src/lib/cache/key.ts` | `searchCacheKey()` — SHA1 of normalised search params |
| `src/lib/booking/prebook-decision.ts` | `decidePrebookOutcome()` → `match \| price_changed \| sold_out` |
| `src/lib/policy/cancellation.ts` | `parseCancellation()` → `CancellationKind` + formatted schedule |
| `src/lib/room/rg-ext-mappings.ts` | `getBedding()`, `getView()`, `getCapacityLabel()`, `getMealLabel()` |
| `src/lib/prisma.ts` | Prisma singleton with PrismaPg adapter + SSL config |
| `src/lib/env.ts` | Server-only Zod env reader |
