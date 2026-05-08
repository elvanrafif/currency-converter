import type { Metadata } from 'next'
import HomepageCalculator from '@/components/HomepageCalculator'

export const metadata: Metadata = {
  title: 'Currency Converter — Live Exchange Rates',
  description: 'Convert currencies with live exchange rates updated hourly. Supports 160+ currencies including USD, IDR, JPY, EUR, SGD, and more.',
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
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-12 space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">💱 Currency Converter</h1>
          <p className="text-gray-500">Live exchange rates updated hourly · 160+ currencies</p>
        </div>

        {/* Calculator */}
        <HomepageCalculator popularPairs={POPULAR_PAIRS} />

      </div>
    </main>
  )
}
