'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CURRENCIES, TOP_CURRENCY_CODES } from '@/lib/currencies'

function CurrencyPicker({
  value,
  onChange,
  label,
}: {
  value: string
  onChange: (code: string) => void
  label: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const meta = CURRENCIES[value as keyof typeof CURRENCIES]

  const filtered = TOP_CURRENCY_CODES.filter((code) => {
    const q = query.toLowerCase()
    return code.toLowerCase().includes(q) || CURRENCIES[code].name.toLowerCase().includes(q)
  })

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 0)
    else setQuery('')
  }, [open])

  return (
    <div className="flex-1 space-y-1.5" ref={ref}>
      <label
        className="block text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: 'var(--ink-3)' }}
      >
        {label}
      </label>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-3 py-3.5 rounded-xl text-sm font-bold outline-none cursor-pointer flex items-center gap-2"
        style={{
          backgroundColor: 'var(--surface-dn)',
          color: 'var(--ink)',
          border: `1.5px solid ${open ? 'var(--amber)' : 'var(--border-md)'}`,
        }}
      >
        <span>{meta?.flag}</span>
        <span>{value}</span>
        <span className="ml-auto text-xs" style={{ color: 'var(--ink-3)' }}>▾</span>
      </button>

      {open && (
        <div
          className="absolute z-50 rounded-xl shadow-lg flex flex-col"
          style={{
            width: '180px',
            backgroundColor: 'var(--surface-up)',
            border: '1.5px solid var(--border-md)',
          }}
        >
          {/* Search — sticky */}
          <div className="p-2" style={{ borderBottom: '1px solid var(--border)' }}>
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full px-2.5 py-1.5 rounded-lg text-xs outline-none"
              style={{
                backgroundColor: 'var(--surface-dn)',
                color: 'var(--ink)',
                border: '1px solid var(--border-md)',
              }}
            />
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
            {filtered.length === 0 && (
              <p className="px-3 py-3 text-xs text-center" style={{ color: 'var(--ink-3)' }}>
                No results
              </p>
            )}
            {filtered.map((code) => {
              const m = CURRENCIES[code]
              const selected = code === value
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => { onChange(code); setOpen(false) }}
                  className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors"
                  style={{
                    backgroundColor: selected ? 'var(--amber)' : 'transparent',
                    color: selected ? 'var(--ink)' : 'var(--ink-2)',
                    fontWeight: selected ? 700 : 400,
                  }}
                >
                  <span>{m.flag}</span>
                  <span>{code}</span>
                  <span className="text-xs ml-auto truncate" style={{ color: selected ? 'var(--ink)' : 'var(--ink-3)', maxWidth: '60px' }}>{m.name.split(' ')[0]}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

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
      <div className="flex items-end gap-2.5 relative">
        <CurrencyPicker value={from} onChange={setFrom} label="From" />

        <button
          onClick={handleSwap}
          className="p-3.5 rounded-xl text-base font-bold transition-colors mb-px shrink-0"
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

        <CurrencyPicker value={to} onChange={setTo} label="To" />
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
