import { describe, it, expect } from 'vitest'
import { computeRate } from '../exchange-rate'

describe('computeRate', () => {
  const rates = { USD: 1, IDR: 16000, JPY: 150, EUR: 0.92 }

  it('computes JPY to IDR', () => {
    const result = computeRate(rates, 'JPY', 'IDR')
    expect(result).toBeCloseTo(16000 / 150, 5)
  })

  it('computes USD to IDR', () => {
    expect(computeRate(rates, 'USD', 'IDR')).toBe(16000)
  })

  it('computes EUR to JPY', () => {
    const result = computeRate(rates, 'EUR', 'JPY')
    expect(result).toBeCloseTo(150 / 0.92, 4)
  })

  it('throws if from currency not in rates', () => {
    expect(() => computeRate(rates, 'XYZ', 'IDR')).toThrow('Rate not found: XYZ/IDR')
  })

  it('throws if to currency not in rates', () => {
    expect(() => computeRate(rates, 'USD', 'ABC')).toThrow('Rate not found: USD/ABC')
  })
})
