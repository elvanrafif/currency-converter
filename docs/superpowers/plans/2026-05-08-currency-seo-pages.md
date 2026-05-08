# Currency SEO Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build hybrid static/on-demand SEO pages at `/convert/[from]-to-[to]` using ExchangeRate-API free tier.

**Architecture:** 15 top currencies pre-rendered at build time (210 static pages), all remaining ~160 API currencies served on-demand with 1-hour ISR cache. Invalid pairs return 404 immediately. `params` is a `Promise` in Next.js 16 — always `await` it.

**Tech Stack:** Next.js 16.2.6 App Router, TypeScript, Tailwind CSS v4, ExchangeRate-API free tier, Vitest (unit tests for utils)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `.env.local` | Create | API key |
| `next.config.ts` | Modify | no changes needed |
| `lib/currencies.ts` | Create | 15 top currencies static list |
| `lib/utils.ts` | Create | parsePair, formatNumber |
| `lib/exchange-rate.ts` | Create | getAllRates, getRate with ISR cache |
| `app/convert/[pair]/page.tsx` | Create | generateStaticParams, generateMetadata, page UI |
| `app/convert/[pair]/not-found.tsx` | Create | 404 UI for invalid pairs |
| `components/CurrencyCalculator.tsx` | Create | interactive calculator (client component) |
| `app/sitemap.ts` | Create | sitemap for GSC |
| `vitest.config.ts` | Create | test config |
| `lib/__tests__/utils.test.ts` | Create | unit tests for parsePair + formatNumber |
| `lib/__tests__/exchange-rate.test.ts` | Create | unit tests for cross-rate calculation |

---

## Task 1: Environment Setup

**Files:**
- Create: `.env.local`

- [ ] **Step 1: Get API key**

  Go to https://www.exchangerate-api.com → Sign Up Free → copy your API key.

- [ ] **Step 2: Create `.env.local`**

  ```
  EXCHANGE_RATE_API_KEY=your_actual_key_here
  ```

- [ ] **Step 3: Verify API key works**

  ```bash
  curl "https://v6.exchangerate-api.com/v6/YOUR_KEY/latest/USD" | head -c 300
  ```

  Expected: JSON starting with `{"result":"success","base_code":"USD","conversion_rates":{...`

- [ ] **Step 4: Commit**

  ```bash
  git add .env.local
  git commit -m "chore: add exchange rate API key env"
  ```

  > `.env.local` is gitignored by default in Next.js — safe to commit the file reference, not the value.

---

## Task 2: Vitest Setup

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Install Vitest**

  ```bash
  npm install --save-dev vitest @vitejs/plugin-react
  ```

  Expected: vitest added to devDependencies.

- [ ] **Step 2: Create `vitest.config.ts`**

  ```ts
  import { defineConfig } from 'vitest/config'
  import react from '@vitejs/plugin-react'
  import path from 'path'

  export default defineConfig({
    plugins: [react()],
    test: {
      environment: 'node',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  })
  ```

- [ ] **Step 3: Add test script to `package.json`**

  In the `"scripts"` section, add:
  ```json
  "test": "vitest run",
  "test:watch": "vitest"
  ```

- [ ] **Step 4: Verify Vitest runs**

  ```bash
  npm test
  ```

  Expected: `No test files found` (no tests yet — that's fine).

- [ ] **Step 5: Commit**

  ```bash
  git add vitest.config.ts package.json package-lock.json
  git commit -m "chore: add vitest test setup"
  ```

---

## Task 3: `lib/currencies.ts`

**Files:**
- Create: `lib/currencies.ts`

- [ ] **Step 1: Create `lib/currencies.ts`**

  ```ts
  export const CURRENCIES = {
    IDR: { name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
    USD: { name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    EUR: { name: 'Euro', symbol: '€', flag: '🇪🇺' },
    GBP: { name: 'British Pound', symbol: '£', flag: '🇬🇧' },
    JPY: { name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
    CNY: { name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
    SGD: { name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
    MYR: { name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
    AUD: { name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
    HKD: { name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
    KRW: { name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
    INR: { name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
    THB: { name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
    PHP: { name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
    VND: { name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳' },
  } as const

  export type CurrencyCode = keyof typeof CURRENCIES
  export type CurrencyMeta = (typeof CURRENCIES)[CurrencyCode]

  export const TOP_CURRENCY_CODES = Object.keys(CURRENCIES) as CurrencyCode[]
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add lib/currencies.ts
  git commit -m "feat: add top 15 currencies list"
  ```

---

## Task 4: `lib/utils.ts` with Tests

**Files:**
- Create: `lib/utils.ts`
- Create: `lib/__tests__/utils.test.ts`

- [ ] **Step 1: Write failing tests first**

  Create `lib/__tests__/utils.test.ts`:

  ```ts
  import { describe, it, expect } from 'vitest'
  import { parsePair, formatNumber } from '../utils'

  describe('parsePair', () => {
    it('parses valid lowercase pair', () => {
      expect(parsePair('jpy-to-cny')).toEqual({ from: 'JPY', to: 'CNY' })
    })

    it('parses usd-to-idr', () => {
      expect(parsePair('usd-to-idr')).toEqual({ from: 'USD', to: 'IDR' })
    })

    it('returns null for malformed slug', () => {
      expect(parsePair('jpycny')).toBeNull()
      expect(parsePair('jpy-cny')).toBeNull()
      expect(parsePair('jpy-to')).toBeNull()
      expect(parsePair('')).toBeNull()
    })

    it('returns null for same-currency pair', () => {
      expect(parsePair('usd-to-usd')).toBeNull()
    })

    it('returns null for non-3-letter codes', () => {
      expect(parsePair('us-to-idr')).toBeNull()
      expect(parsePair('usdd-to-idr')).toBeNull()
    })
  })

  describe('formatNumber', () => {
    it('formats with default 2 decimals', () => {
      expect(formatNumber(1234.5678)).toBe('1,234.57')
    })

    it('formats with custom decimals', () => {
      expect(formatNumber(1.23456789, 6)).toBe('1.234568')
    })

    it('formats zero', () => {
      expect(formatNumber(0)).toBe('0.00')
    })

    it('formats large numbers with thousand separators', () => {
      expect(formatNumber(15800000)).toBe('15,800,000.00')
    })
  })
  ```

- [ ] **Step 2: Run tests — verify they fail**

  ```bash
  npm test
  ```

  Expected: FAIL — `Cannot find module '../utils'`

- [ ] **Step 3: Create `lib/utils.ts`**

  ```ts
  export type ParsedPair = { from: string; to: string }

  export function parsePair(slug: string): ParsedPair | null {
    const match = slug.match(/^([a-z]{3})-to-([a-z]{3})$/)
    if (!match) return null

    const from = match[1].toUpperCase()
    const to = match[2].toUpperCase()

    if (from === to) return null

    return { from, to }
  }

  export function formatNumber(value: number, decimals = 2): string {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }
  ```

- [ ] **Step 4: Run tests — verify they pass**

  ```bash
  npm test
  ```

  Expected: All 9 tests PASS.

- [ ] **Step 5: Commit**

  ```bash
  git add lib/utils.ts lib/__tests__/utils.test.ts
  git commit -m "feat: add parsePair and formatNumber utils with tests"
  ```

---

## Task 5: `lib/exchange-rate.ts` with Tests

**Files:**
- Create: `lib/exchange-rate.ts`
- Create: `lib/__tests__/exchange-rate.test.ts`

- [ ] **Step 1: Write failing tests first**

  Create `lib/__tests__/exchange-rate.test.ts`:

  ```ts
  import { describe, it, expect } from 'vitest'
  import { computeRate } from '../exchange-rate'

  describe('computeRate', () => {
    const rates = { USD: 1, IDR: 16000, JPY: 150, EUR: 0.92 }

    it('computes JPY to IDR', () => {
      const result = computeRate(rates, 'JPY', 'IDR')
      expect(result).toBeCloseTo(16000 / 150, 5)
    })

    it('computes USD to IDR', () => {
      expect(computeRate(rates, 'USD', 'IDR')).toBe(16000)
    })

    it('computes EUR to JPY', () => {
      const result = computeRate(rates, 'EUR', 'JPY')
      expect(result).toBeCloseTo(150 / 0.92, 4)
    })

    it('throws if from currency not in rates', () => {
      expect(() => computeRate(rates, 'XYZ', 'IDR')).toThrow('Rate not found: XYZ/IDR')
    })

    it('throws if to currency not in rates', () => {
      expect(() => computeRate(rates, 'USD', 'ABC')).toThrow('Rate not found: USD/ABC')
    })
  })
  ```

- [ ] **Step 2: Run tests — verify they fail**

  ```bash
  npm test
  ```

  Expected: FAIL — `Cannot find module '../exchange-rate'`

- [ ] **Step 3: Create `lib/exchange-rate.ts`**

  ```ts
  export type Rates = Record<string, number>

  export function computeRate(rates: Rates, from: string, to: string): number {
    const fromRate = rates[from]
    const toRate = rates[to]

    if (!fromRate || !toRate) throw new Error(`Rate not found: ${from}/${to}`)

    return toRate / fromRate
  }

  export async function getAllRates(): Promise<Rates> {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY
    if (!apiKey) throw new Error('EXCHANGE_RATE_API_KEY is not set')

    const res = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`,
      { next: { revalidate: 3600 } }
    )

    if (!res.ok) throw new Error(`Exchange rate API error: ${res.status}`)

    const data = await res.json()
    return data.conversion_rates as Rates
  }

  export async function getRate(from: string, to: string): Promise<number> {
    const rates = await getAllRates()
    return computeRate(rates, from, to)
  }
  ```

- [ ] **Step 4: Run tests — verify they pass**

  ```bash
  npm test
  ```

  Expected: All 14 tests PASS (9 from utils + 5 from exchange-rate).

- [ ] **Step 5: Commit**

  ```bash
  git add lib/exchange-rate.ts lib/__tests__/exchange-rate.test.ts
  git commit -m "feat: add exchange rate fetcher with cross-rate calculation"
  ```

---

## Task 6: `app/convert/[pair]/page.tsx`

**Files:**
- Create: `app/convert/[pair]/page.tsx`

> **Next.js 16 note:** `params` is `Promise<{ pair: string }>` — must `await` it in both `generateMetadata` and the page component.

- [ ] **Step 1: Create directory**

  ```bash
  mkdir -p app/convert/\[pair\]
  ```

- [ ] **Step 2: Create `app/convert/[pair]/page.tsx`**

  ```tsx
  import { notFound } from 'next/navigation'
  import type { Metadata } from 'next'
  import { CURRENCIES, TOP_CURRENCY_CODES } from '@/lib/currencies'
  import { getAllRates, computeRate } from '@/lib/exchange-rate'
  import { parsePair, formatNumber } from '@/lib/utils'
  import CurrencyCalculator from '@/components/CurrencyCalculator'

  export const dynamicParams = true

  export async function generateStaticParams() {
    const pairs: { pair: string }[] = []
    for (const from of TOP_CURRENCY_CODES) {
      for (const to of TOP_CURRENCY_CODES) {
        if (from !== to) {
          pairs.push({ pair: `${from.toLowerCase()}-to-${to.toLowerCase()}` })
        }
      }
    }
    return pairs
  }

  export async function generateMetadata({
    params,
  }: {
    params: Promise<{ pair: string }>
  }): Promise<Metadata> {
    const { pair } = await params
    const parsed = parsePair(pair)
    if (!parsed) return {}

    const { from, to } = parsed
    const fromMeta = CURRENCIES[from as keyof typeof CURRENCIES]
    const toMeta = CURRENCIES[to as keyof typeof CURRENCIES]

    const fromName = fromMeta?.name ?? from
    const toName = toMeta?.name ?? to

    return {
      title: `${fromName} to ${toName} — ${from} to ${to} Converter`,
      description: `Convert ${fromName} (${from}) to ${toName} (${to}). Get live exchange rates updated hourly and calculate ${from}/${to} instantly.`,
      alternates: {
        canonical: `https://transfez.com/convert/${pair}`,
      },
    }
  }

  export default async function ConvertPage({
    params,
  }: {
    params: Promise<{ pair: string }>
  }) {
    const { pair } = await params
    const parsed = parsePair(pair)
    if (!parsed) notFound()

    const { from, to } = parsed

    const rates = await getAllRates()
    if (!rates[from] || !rates[to]) notFound()

    const rate = computeRate(rates, from, to)

    const fromMeta = CURRENCIES[from as keyof typeof CURRENCIES]
    const toMeta = CURRENCIES[to as keyof typeof CURRENCIES]

    const fromName = fromMeta?.name ?? from
    const toName = toMeta?.name ?? to
    const fromSymbol = fromMeta?.symbol ?? from
    const toSymbol = toMeta?.symbol ?? to
    const fromFlag = fromMeta?.flag ?? ''
    const toFlag = toMeta?.flag ?? ''

    const conversionTable = [1, 5, 10, 50, 100, 500, 1000, 5000].map((amount) => ({
      amount,
      result: amount * rate,
    }))

    const relatedPairs = TOP_CURRENCY_CODES.filter(
      (code) => code !== from && code !== to
    )
      .slice(0, 4)
      .map((code) => ({
        code,
        name: CURRENCIES[code]?.name ?? code,
        flag: CURRENCIES[code]?.flag ?? '',
      }))

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: `${fromName} to ${toName} Converter`,
      applicationCategory: 'FinanceApplication',
      description: `Convert ${from} to ${to} with live exchange rates updated every hour.`,
    }

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <main className="min-h-screen bg-gray-50">
          <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">

            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {fromFlag} {fromName} to {toFlag} {toName}
              </h1>
              <p className="text-gray-500 text-sm">
                {from} to {to} Converter — rates updated hourly
              </p>
            </div>

            {/* Live rate badge */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 text-center">
              <p className="text-2xl font-semibold text-gray-800">
                1 {from} ={' '}
                <span className="text-blue-600">
                  {formatNumber(rate, rate < 0.01 ? 6 : 4)} {to}
                </span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {fromSymbol}1 {fromName} = {toSymbol}{formatNumber(rate, rate < 0.01 ? 6 : 4)} {toName}
              </p>
            </div>

            {/* Interactive calculator */}
            <CurrencyCalculator
              from={from}
              to={to}
              initialRate={rate}
              fromName={fromName}
              toName={toName}
              fromSymbol={fromSymbol}
              toSymbol={toSymbol}
              fromFlag={fromFlag}
              toFlag={toFlag}
            />

            {/* Conversion table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">
                  {from} to {to} Conversion Table
                </h2>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">
                      {fromFlag} {from}
                    </th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">
                      {toFlag} {to}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {conversionTable.map(({ amount, result }) => (
                    <tr key={amount} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 text-gray-700">
                        {fromSymbol}{formatNumber(amount, 0)}
                      </td>
                      <td className="px-6 py-3 text-gray-900 font-medium">
                        {toSymbol}{formatNumber(result, result < 1 ? 4 : 2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Related conversions */}
            <div className="space-y-3">
              <h2 className="font-semibold text-gray-800 px-1">Related Conversions</h2>
              <div className="grid grid-cols-2 gap-3">
                {/* Reverse pair */}
                <a
                  href={`/convert/${to.toLowerCase()}-to-${from.toLowerCase()}`}
                  className="bg-white rounded-xl border border-gray-100 px-4 py-3 text-sm text-gray-700 hover:border-blue-300 hover:shadow-sm transition-all flex items-center gap-2"
                >
                  <span>{toFlag}</span>
                  <span className="font-medium">{to} → {from}</span>
                </a>
                {relatedPairs.map(({ code, name, flag }) => (
                  <a
                    key={code}
                    href={`/convert/${from.toLowerCase()}-to-${code.toLowerCase()}`}
                    className="bg-white rounded-xl border border-gray-100 px-4 py-3 text-sm text-gray-700 hover:border-blue-300 hover:shadow-sm transition-all flex items-center gap-2"
                  >
                    <span>{flag}</span>
                    <span className="font-medium">{from} → {code}</span>
                  </a>
                ))}
              </div>
            </div>

          </div>
        </main>
      </>
    )
  }
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add app/convert/
  git commit -m "feat: add convert/[pair] page with generateStaticParams and SEO metadata"
  ```

---

## Task 7: `components/CurrencyCalculator.tsx`

**Files:**
- Create: `components/CurrencyCalculator.tsx`

- [ ] **Step 1: Create `components/CurrencyCalculator.tsx`**

  ```tsx
  'use client'

  import { useState } from 'react'
  import { useRouter } from 'next/navigation'
  import { formatNumber } from '@/lib/utils'

  interface Props {
    from: string
    to: string
    initialRate: number
    fromName: string
    toName: string
    fromSymbol: string
    toSymbol: string
    fromFlag: string
    toFlag: string
  }

  export default function CurrencyCalculator({
    from,
    to,
    initialRate,
    fromName,
    toName,
    fromSymbol,
    toSymbol,
    fromFlag,
    toFlag,
  }: Props) {
    const router = useRouter()
    const [amount, setAmount] = useState('1')

    const numAmount = parseFloat(amount)
    const result = isNaN(numAmount) ? 0 : numAmount * initialRate

    function handleReverse() {
      router.push(`/convert/${to.toLowerCase()}-to-${from.toLowerCase()}`)
    }

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="space-y-3">
          {/* From input */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {fromFlag} {fromName} ({from})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                {fromSymbol}
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-lg font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Swap button */}
          <div className="flex justify-center">
            <button
              onClick={handleReverse}
              className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors font-medium"
            >
              <span>⇄</span>
              <span>Swap {from} ↔ {to}</span>
            </button>
          </div>

          {/* To output */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {toFlag} {toName} ({to})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                {toSymbol}
              </span>
              <input
                type="number"
                value={formatNumber(result, result < 1 ? 6 : 2).replace(/,/g, '')}
                readOnly
                className="w-full pl-8 pr-4 py-3 border border-gray-100 rounded-xl text-lg font-semibold text-blue-600 bg-blue-50 cursor-default"
              />
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center">
          Rate: 1 {from} = {formatNumber(initialRate, initialRate < 0.01 ? 6 : 4)} {to}
        </p>
      </div>
    )
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add components/CurrencyCalculator.tsx
  git commit -m "feat: add interactive CurrencyCalculator client component"
  ```

---

## Task 8: `app/convert/[pair]/not-found.tsx`

**Files:**
- Create: `app/convert/[pair]/not-found.tsx`

- [ ] **Step 1: Create `app/convert/[pair]/not-found.tsx`**

  ```tsx
  import Link from 'next/link'

  export default function NotFound() {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <p className="text-5xl">💱</p>
          <h1 className="text-2xl font-bold text-gray-900">Currency pair not found</h1>
          <p className="text-gray-500">
            This currency pair doesn&apos;t exist or isn&apos;t supported.
            Make sure the format is correct, e.g.{' '}
            <code className="bg-gray-100 px-1 rounded text-sm">/convert/usd-to-idr</code>
          </p>
          <Link
            href="/"
            className="inline-block mt-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            Back to home
          </Link>
        </div>
      </main>
    )
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add app/convert/\[pair\]/not-found.tsx
  git commit -m "feat: add not-found page for invalid currency pairs"
  ```

---

## Task 9: `app/sitemap.ts`

**Files:**
- Create: `app/sitemap.ts`

- [ ] **Step 1: Create `app/sitemap.ts`**

  ```ts
  import type { MetadataRoute } from 'next'
  import { TOP_CURRENCY_CODES } from '@/lib/currencies'

  export default function sitemap(): MetadataRoute.Sitemap {
    const pairs: MetadataRoute.Sitemap = []

    for (const from of TOP_CURRENCY_CODES) {
      for (const to of TOP_CURRENCY_CODES) {
        if (from !== to) {
          pairs.push({
            url: `https://transfez.com/convert/${from.toLowerCase()}-to-${to.toLowerCase()}`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.8,
          })
        }
      }
    }

    return pairs
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add app/sitemap.ts
  git commit -m "feat: add sitemap for SEO currency pair pages"
  ```

---

## Task 10: Build Verification

- [ ] **Step 1: Run all tests**

  ```bash
  npm test
  ```

  Expected: All 14 tests PASS.

- [ ] **Step 2: Run build**

  ```bash
  npm run build
  ```

  Expected output includes:
  ```
  ● /convert/[pair]  (210 pages pre-rendered)
  ✓ Generating static pages
  ```

  If build fails with `EXCHANGE_RATE_API_KEY is not set` — confirm `.env.local` has the key.

- [ ] **Step 3: Run dev server and spot-check**

  ```bash
  npm run dev
  ```

  Open in browser:
  - `http://localhost:3000/convert/usd-to-idr` → should show page ✅
  - `http://localhost:3000/convert/jpy-to-cny` → should show page ✅
  - `http://localhost:3000/convert/usd-to-thb` → on-demand, should work ✅
  - `http://localhost:3000/convert/usd-to-xyz` → should show not-found page ✅
  - `http://localhost:3000/sitemap.xml` → should list 210 URLs ✅

- [ ] **Step 4: Final commit**

  ```bash
  git add -A
  git commit -m "chore: verify build and all pages working"
  ```
