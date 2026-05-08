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
    <div className="space-y-3">
      {/* From input */}
      <div className="space-y-1.5">
        <label
          className="block text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--ink-3)' }}
        >
          {fromFlag} {fromName} ({from})
        </label>
        <div className="relative">
          <span
            className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold pointer-events-none select-none"
            style={{ color: 'var(--ink-3)' }}
          >
            {fromSymbol}
          </span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            className="w-full pl-8 pr-4 py-3.5 rounded-xl text-lg font-bold outline-none transition-all
                       focus:ring-2 focus:ring-amber focus:border-amber"
            style={{
              backgroundColor: 'var(--surface-dn)',
              color: 'var(--ink)',
              border: '1.5px solid var(--border-md)',
            }}
          />
        </div>
      </div>

      {/* Swap */}
      <div className="flex justify-center">
        <button
          onClick={handleReverse}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          style={{ color: 'var(--amber)' }}
        >
          <span>⇄</span>
          <span>
            Swap {from} ↔ {to}
          </span>
        </button>
      </div>

      {/* To output */}
      <div className="space-y-1.5">
        <label
          className="block text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--ink-3)' }}
        >
          {toFlag} {toName} ({to})
        </label>
        <div className="relative">
          <span
            className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold pointer-events-none select-none"
            style={{ color: 'var(--ink-3)' }}
          >
            {toSymbol}
          </span>
          <input
            type="number"
            readOnly
            value={formatNumber(result, result < 1 ? 6 : 2).replace(/,/g, '')}
            className="w-full pl-8 pr-4 py-3.5 rounded-xl text-lg font-bold cursor-default"
            style={{
              backgroundColor: 'var(--amber-pale)',
              color: 'var(--ink)',
              border: '1.5px solid transparent',
            }}
          />
        </div>
      </div>
    </div>
  )
}
