import type { Metadata } from 'next'
import Link from 'next/link'
import HomepageCalculator from '@/components/HomepageCalculator'

export const metadata: Metadata = {
  title: 'Currency Converter — Live Exchange Rates',
  description:
    'Convert currencies with live exchange rates updated hourly. Supports 160+ currencies including USD, IDR, JPY, EUR, SGD, and more.',
}

const POPULAR_PAIRS = [
  { from: 'USD', to: 'IDR' },
  { from: 'SGD', to: 'IDR' },
  { from: 'JPY', to: 'IDR' },
  { from: 'EUR', to: 'IDR' },
  { from: 'USD', to: 'JPY' },
  { from: 'GBP', to: 'USD' },
  { from: 'AUD', to: 'IDR' },
  { from: 'KRW', to: 'IDR' },
]

export default function Home() {
  return (
    <main className="flex flex-col flex-1">
      {/* ── Dark hero ─────────────────────────────────────────── */}
      <section className="bg-ink px-6 pt-10 pb-16 md:pt-14 md:pb-24">
        <div className="max-w-5xl mx-auto">

          {/* Wordmark */}
          <p className="text-amber text-xl font-extrabold tracking-tight mb-14 md:mb-16">
            kurs.
          </p>

          {/* Split: statement + calculator */}
          <div className="flex flex-col gap-10 md:flex-row md:items-start md:gap-20">

            {/* Brand statement */}
            <div className="md:flex-1 md:pt-3">
              <h1
                className="text-[2.75rem] leading-[1.06] font-extrabold tracking-tight mb-5 md:text-6xl"
                style={{ color: 'oklch(96% 0.006 70)' }}
              >
                Know the rate.<br />
                <span className="text-amber">Before you transfer.</span>
              </h1>
              <p className="text-base font-light leading-relaxed" style={{ color: 'oklch(62% 0.008 50)' }}>
                Live exchange rates, updated every hour.<br />
                160+ currencies including USD, IDR, SGD, JPY.
              </p>
            </div>

            {/* Calculator card */}
            <div className="shrink-0 md:w-[360px]">
              <HomepageCalculator />
            </div>

          </div>
        </div>
      </section>

      {/* ── Popular pairs ──────────────────────────────────────── */}
      <section className="bg-surface px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-3 mb-5">
            Popular conversions
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {POPULAR_PAIRS.map(({ from, to }) => (
              <Link
                key={`${from}-${to}`}
                href={`/convert/${from.toLowerCase()}-to-${to.toLowerCase()}`}
                className="flex items-center gap-2 px-4 py-3.5 rounded-xl text-sm transition-colors
                           bg-surface-up border border-border text-ink-2
                           hover:border-amber hover:text-ink"
              >
                <span className="font-bold text-ink">{from}</span>
                <span className="text-ink-3 text-xs">→</span>
                <span className="font-bold text-ink">{to}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer
        className="mt-auto px-6 py-7 border-t"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="max-w-5xl mx-auto flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-extrabold text-amber">kurs.</span>
          <p className="text-xs text-ink-3">
            Live exchange rates · Updated hourly · 160+ currencies
          </p>
        </div>
      </footer>
    </main>
  )
}
