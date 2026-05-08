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
