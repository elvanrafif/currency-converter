'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CURRENCIES, TOP_CURRENCY_CODES } from '@/lib/currencies'
import { formatNumber } from '@/lib/utils'

interface Props {
  popularPairs: { from: string; to: string }[]
}

export default function HomepageCalculator({ popularPairs }: Props) {
  const router = useRouter()
  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('IDR')
  const [amount, setAmount] = useState('1')

  const fromMeta = CURRENCIES[from as keyof typeof CURRENCIES]
  const toMeta = CURRENCIES[to as keyof typeof CURRENCIES]

  function handleConvert() {
    router.push(`/convert/${from.toLowerCase()}-to-${to.toLowerCase()}`)
  }

  function handleSwap() {
    setFrom(to)
    setTo(from)
  }

  const numAmount = parseFloat(amount.replace(/,/g, ''))

  return (
    <div className="space-y-6">
      {/* Calculator card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">

        {/* Amount input */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            placeholder="1"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* From / Swap / To row */}
        <div className="flex items-center gap-3">
          {/* From */}
          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">From</label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
            >
              {TOP_CURRENCY_CODES.map((code) => (
                <option key={code} value={code}>
                  {CURRENCIES[code].flag} {code} — {CURRENCIES[code].name}
                </option>
              ))}
            </select>
          </div>

          {/* Swap */}
          <button
            onClick={handleSwap}
            className="mt-5 p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all text-lg"
            title="Swap currencies"
          >
            ⇄
          </button>

          {/* To */}
          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">To</label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
            >
              {TOP_CURRENCY_CODES.map((code) => (
                <option key={code} value={code}>
                  {CURRENCIES[code].flag} {code} — {CURRENCIES[code].name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Amount preview */}
        {!isNaN(numAmount) && numAmount > 0 && (
          <p className="text-sm text-gray-500 text-center">
            {fromMeta?.flag} {formatNumber(numAmount, 0)} {from} →{' '}
            <span className="font-medium text-gray-700">{toMeta?.flag} ??? {to}</span>
            <span className="text-xs ml-1 text-gray-400">(see exact rate on next page)</span>
          </p>
        )}

        {/* Convert button */}
        <button
          onClick={handleConvert}
          disabled={from === to}
          className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-base hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Convert {fromMeta?.flag} {from} → {toMeta?.flag} {to}
        </button>
      </div>

      {/* Popular pairs */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-500 px-1">Popular conversions</p>
        <div className="grid grid-cols-2 gap-2">
          {popularPairs.map(({ from: f, to: t }) => {
            const fMeta = CURRENCIES[f as keyof typeof CURRENCIES]
            const tMeta = CURRENCIES[t as keyof typeof CURRENCIES]
            return (
              <button
                key={`${f}-${t}`}
                onClick={() => router.push(`/convert/${f.toLowerCase()}-to-${t.toLowerCase()}`)}
                className="bg-white rounded-xl border border-gray-100 px-4 py-3 text-sm text-gray-700 hover:border-blue-300 hover:shadow-sm transition-all flex items-center gap-2 text-left"
              >
                <span>{fMeta?.flag}</span>
                <span className="font-medium">{f} → {t}</span>
                <span className="ml-auto text-gray-400">{tMeta?.flag}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
