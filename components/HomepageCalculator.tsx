'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CURRENCIES, TOP_CURRENCY_CODES } from '@/lib/currencies'

export default function HomepageCalculator() {
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

  return (
    <div
      className="rounded-2xl p-6 space-y-5"
      style={{ backgroundColor: 'var(--surface-up)' }}
    >
      {/* Amount */}
      <div className="space-y-1.5">
        <label
          className="block text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--ink-3)' }}
        >
          Amount
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0"
          placeholder="1"
          className="w-full px-4 py-3.5 rounded-xl text-xl font-bold transition-all outline-none
                     focus:ring-2 focus:ring-amber focus:border-amber"
          style={{
            backgroundColor: 'var(--surface-dn)',
            color: 'var(--ink)',
            border: '1.5px solid var(--border-md)',
          }}
        />
      </div>

      {/* From / Swap / To */}
      <div className="flex items-end gap-2.5">
        <div className="flex-1 space-y-1.5">
          <label
            className="block text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: 'var(--ink-3)' }}
          >
            From
          </label>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full px-3 py-3.5 rounded-xl text-sm font-bold outline-none cursor-pointer"
            style={{
              backgroundColor: 'var(--surface-dn)',
              color: 'var(--ink)',
              border: '1.5px solid var(--border-md)',
              appearance: 'none',
            }}
          >
            {TOP_CURRENCY_CODES.map((code) => (
              <option key={code} value={code}>
                {CURRENCIES[code].flag} {code}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSwap}
          className="p-3.5 rounded-xl text-base font-bold transition-colors mb-px"
          style={{
            backgroundColor: 'var(--surface-dn)',
            color: 'var(--ink-2)',
            border: '1.5px solid var(--border)',
          }}
          title="Swap currencies"
          aria-label="Swap from and to currencies"
        >
          ⇄
        </button>

        <div className="flex-1 space-y-1.5">
          <label
            className="block text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: 'var(--ink-3)' }}
          >
            To
          </label>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full px-3 py-3.5 rounded-xl text-sm font-bold outline-none cursor-pointer"
            style={{
              backgroundColor: 'var(--surface-dn)',
              color: 'var(--ink)',
              border: '1.5px solid var(--border-md)',
              appearance: 'none',
            }}
          >
            {TOP_CURRENCY_CODES.map((code) => (
              <option key={code} value={code}>
                {CURRENCIES[code].flag} {code}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleConvert}
        disabled={from === to}
        className="w-full py-4 rounded-xl font-bold text-base tracking-tight transition-opacity
                   disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
        style={{ backgroundColor: 'var(--amber)', color: 'var(--ink)' }}
      >
        {fromMeta?.flag} {from} → {toMeta?.flag} {to}
      </button>
    </div>
  )
}
