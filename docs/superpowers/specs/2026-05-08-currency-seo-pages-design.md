# Currency Converter SEO Pages — Design Spec

**Date:** 2026-05-08  
**Stack:** Next.js 16.2.6 (App Router) + TypeScript + Tailwind CSS v4 + ExchangeRate-API (Free Tier)  
**URL pattern:** `/convert/[from]-to-[to]` (e.g. `/convert/jpy-to-cny`)

---

## Overview

Hybrid static + on-demand SEO pages for currency conversion.

- **15 top currencies** pre-rendered at build time → 210 static pages
- **~160 remaining currencies** from API rendered on-demand and cached
- **1 API call/hour** → ~720 req/month, safe on free tier (limit: 1,500)
- **Invalid pairs** return clean 404 immediately

---

## Architecture

### File Structure

```
app/
├── convert/
│   └── [pair]/
│       ├── page.tsx          ← dynamic route, hybrid static/on-demand
│       └── not-found.tsx     ← UI for invalid pairs
├── sitemap.ts                ← all valid pairs for Google Search Console
lib/
├── currencies.ts             ← 15 top currencies static list
├── exchange-rate.ts          ← fetch + 'use cache' (Next.js 16)
└── utils.ts                  ← parsePair, formatNumber helpers
components/
└── CurrencyCalculator.tsx    ← interactive calculator (client component)
```

### Data Flow

1. **Build time** → `generateStaticParams` fetches API once → pre-renders 210 pairs
2. **Runtime (unknown pair)** → page renders on-demand → result cached via `'use cache'`
3. **Cache revalidation** → every 1 hour via `cacheLife('hours')`
4. **Invalid pair** → `parsePair` fails or currency not in API response → `notFound()`

---

## Data & API Layer

### `lib/currencies.ts`

Static list of 15 top currencies (Asia-focused + major). No API call. Source of truth for `generateStaticParams`.

```
IDR, USD, EUR, GBP, JPY, CNY, SGD, MYR, AUD, HKD, KRW, INR, THB, PHP, VND
```

### `lib/exchange-rate.ts`

- `getAllRates()` — fetches `latest/USD` from ExchangeRate-API, cached with `'use cache'` + `cacheLife('hours')`. Returns all ~160 currency codes as keys.
- `getRate(from, to)` — cross-rate: `rates[to] / rates[from]` (both relative to USD base).

### `lib/utils.ts`

- `parsePair(slug)` — parses `"jpy-to-cny"` → `{ from: "JPY", to: "CNY" }` or `null` if malformed
- `formatNumber(n, decimals)` — locale-aware number formatting

### Pair Validation (Opsi B — whitelist from API)

```
parsePair("jpy-to-cny")
  → { from: "JPY", to: "CNY" }
  → assert from !== to
  → assert both keys exist in getAllRates() response
  → if invalid → notFound()
```

This means `/convert/usd-to-xyz` → 404, but `/convert/usd-to-thb` (valid API currency, not in top 15) → renders on-demand ✅

---

## UI & Components

### Page Layout (`app/convert/[pair]/page.tsx`)

Server Component with the following sections:

```
┌─────────────────────────────────────────┐
│  🇯🇵 JPY → 🇨🇳 CNY                      │  H1 (SEO)
│  Japanese Yen to Chinese Yuan Converter  │
│                                         │
│  1 JPY = 0.048234 CNY  •  Updated 1h ago│  live rate
├─────────────────────────────────────────┤
│  CurrencyCalculator (client component)  │
│   ¥ [______1,000______]                 │
│         =                               │
│   ¥ [_____48.23_______]  (read-only)    │
│   [⇄ Reverse]                           │
├─────────────────────────────────────────┤
│  Conversion Table (static HTML for SEO) │
│  ┌──────────┬──────────┐                │
│  │   JPY    │   CNY    │                │
│  │  ¥1      │  ¥0.05   │                │
│  │  ¥100    │  ¥4.82   │                │
│  │  ¥1,000  │  ¥48.23  │                │
│  └──────────┴──────────┘                │
├─────────────────────────────────────────┤
│  Related Conversions (internal links)   │
│  CNY → JPY  •  USD → JPY  •  JPY → USD  │
└─────────────────────────────────────────┘
```

### `components/CurrencyCalculator.tsx` (Client Component)

- Input amount for `from` currency → computed result for `to` currency in real-time
- Uses `initialRate` passed from server — no client-side fetch
- Reverse button navigates to the swapped pair (`/convert/cny-to-jpy`)

### SEO Metadata (via `generateMetadata`)

- **Title:** `"Japanese Yen to Chinese Yuan — JPY to CNY Converter"`
- **Description:** auto-generated from currency names and codes
- **Canonical:** `https://transfez.com/convert/jpy-to-cny`
- **JSON-LD:** `WebApplication` schema with `FinanceApplication` category

### Styling

Tailwind CSS v4, polished production-ready UI: card layout, responsive table, proper spacing, flag emojis for visual identity.

---

## Next.js 16 Breaking Changes (vs MD doc)

| Old (Next.js 14 style) | New (Next.js 16) |
|---|---|
| `params: { pair: string }` | `params: Promise<{ pair: string }>` |
| `const { pair } = params` | `const { pair } = await params` |
| `fetch(url, { next: { revalidate: 3600 } })` | `'use cache'` + `cacheLife('hours')` |

---

## API Usage Estimate

| Scenario | Req/day | Req/month | Status |
|---|---|---|---|
| Revalidate every 1 hour | 24 | ~720 | ✅ Free tier safe |
| Revalidate every 30 min | 48 | ~1,440 | ⚠️ Near limit |

**Recommendation:** 1-hour revalidation (`cacheLife('hours')`).

---

## Implementation Checklist

- [ ] Get ExchangeRate-API key (free tier) and set `EXCHANGE_RATE_API_KEY` in `.env.local`
- [ ] Create `lib/currencies.ts` with 15 top currencies
- [ ] Create `lib/exchange-rate.ts` with `getAllRates` + `getRate` using `'use cache'`
- [ ] Create `lib/utils.ts` with `parsePair` + `formatNumber`
- [ ] Create `app/convert/[pair]/page.tsx` with `generateStaticParams` + `generateMetadata`
- [ ] Create `components/CurrencyCalculator.tsx` (client component)
- [ ] Create `app/convert/[pair]/not-found.tsx`
- [ ] Create `app/sitemap.ts`
- [ ] Test build: `next build` — verify 210 pages generated
- [ ] Submit sitemap to Google Search Console
