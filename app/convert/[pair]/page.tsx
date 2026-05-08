import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { CURRENCIES, TOP_CURRENCY_CODES, STATIC_CURRENCY_CODES } from '@/lib/currencies'
import { getAllRates, computeRate } from '@/lib/exchange-rate'
import { parsePair, formatNumber } from '@/lib/utils'
import CurrencyCalculator from '@/components/CurrencyCalculator'

export const dynamicParams = true

export async function generateStaticParams() {
  const pairs: { pair: string }[] = []
  for (const from of STATIC_CURRENCY_CODES) {
    for (const to of STATIC_CURRENCY_CODES) {
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
  if (!parsed) return { robots: { index: false } }

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

  const rateFormatted = formatNumber(rate, rate < 0.01 ? 6 : 4)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex flex-col flex-1 bg-surface">
        {/* ── Nav ───────────────────────────────────────────────── */}
        <nav
          className="px-6 py-4 flex items-center justify-between border-b"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-up)' }}
        >
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-semibold transition-colors"
            style={{ color: 'var(--ink-2)' }}
          >
            <span aria-hidden>←</span>
            <span>All currencies</span>
          </Link>
          <span className="text-sm font-extrabold text-amber">kurs.</span>
        </nav>

        <div className="max-w-2xl mx-auto w-full px-6 py-10 space-y-10">

          {/* ── Rate hero ─────────────────────────────────────────── */}
          <section>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: 'var(--ink-3)' }}
            >
              {fromFlag} {fromName} → {toFlag} {toName}
            </p>

            <h1
              className="text-4xl font-extrabold tracking-tight leading-tight mb-1 md:text-5xl"
              style={{ color: 'var(--ink)' }}
            >
              1 {from} ={' '}
              <span className="text-amber">{rateFormatted}</span>{' '}
              {to}
            </h1>

            <p className="text-sm" style={{ color: 'var(--ink-3)' }}>
              {fromSymbol}1 {fromName} = {toSymbol}{rateFormatted} {toName}
              <span
                className="inline-block ml-3 text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: 'var(--amber)' }}
              >
                · Updated hourly
              </span>
            </p>
          </section>

          {/* ── Interactive calculator ─────────────────────────────── */}
          <section
            className="rounded-2xl p-6"
            style={{
              backgroundColor: 'var(--surface-up)',
              border: '1px solid var(--border)',
            }}
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-widest mb-4"
              style={{ color: 'var(--ink-3)' }}
            >
              Calculator
            </p>
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
          </section>

          {/* ── Conversion table ───────────────────────────────────── */}
          <section>
            <h2
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: 'var(--ink-3)' }}
            >
              {from} to {to} Conversion Table
            </h2>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid var(--border)' }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: 'var(--surface-dn)' }}>
                    <th
                      className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest"
                      style={{ color: 'var(--ink-3)' }}
                    >
                      {fromFlag} {from}
                    </th>
                    <th
                      className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest"
                      style={{ color: 'var(--ink-3)' }}
                    >
                      {toFlag} {to}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {conversionTable.map(({ amount, result: r }, i) => (
                    <tr
                      key={amount}
                      style={{
                        backgroundColor: i % 2 === 0 ? 'var(--surface-up)' : 'var(--surface)',
                        borderTop: '1px solid var(--border)',
                      }}
                    >
                      <td className="px-5 py-3 font-medium" style={{ color: 'var(--ink-2)' }}>
                        {fromSymbol}{formatNumber(amount, 0)}
                      </td>
                      <td className="px-5 py-3 font-bold" style={{ color: 'var(--ink)' }}>
                        {toSymbol}{formatNumber(r, r < 1 ? 4 : 2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Related conversions ────────────────────────────────── */}
          <section>
            <h2
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: 'var(--ink-3)' }}
            >
              Related conversions
            </h2>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Reverse pair */}
              <Link
                href={`/convert/${to.toLowerCase()}-to-${from.toLowerCase()}`}
                className="flex items-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: 'var(--surface-up)',
                  border: '1px solid var(--border)',
                  color: 'var(--ink-2)',
                }}
              >
                <span>{toFlag}</span>
                <span className="font-bold text-ink">{to}</span>
                <span className="text-ink-3 text-xs">→</span>
                <span className="font-bold text-ink">{from}</span>
              </Link>

              {relatedPairs.map(({ code, flag }) => (
                <Link
                  key={code}
                  href={`/convert/${from.toLowerCase()}-to-${code.toLowerCase()}`}
                  className="flex items-center gap-2 px-4 py-3.5 rounded-xl text-sm transition-colors"
                  style={{
                    backgroundColor: 'var(--surface-up)',
                    border: '1px solid var(--border)',
                    color: 'var(--ink-2)',
                  }}
                >
                  <span>{fromFlag}</span>
                  <span className="font-bold text-ink">{from}</span>
                  <span className="text-ink-3 text-xs">→</span>
                  <span className="font-bold text-ink">{code}</span>
                  <span className="ml-auto">{flag}</span>
                </Link>
              ))}
            </div>
          </section>

        </div>

        {/* ── Footer ────────────────────────────────────────────── */}
        <footer
          className="mt-auto px-6 py-7 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="max-w-2xl mx-auto flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-extrabold text-amber">kurs.</span>
            <p className="text-xs text-ink-3">
              Live exchange rates · Updated hourly · 100+ currencies
            </p>
          </div>
        </footer>
      </main>
    </>
  )
}
