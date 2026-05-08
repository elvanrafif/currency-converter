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
