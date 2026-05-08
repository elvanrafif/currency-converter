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
