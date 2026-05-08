import { unstable_cache } from 'next/cache'

export type Rates = Record<string, number>

export function computeRate(rates: Rates, from: string, to: string): number {
  const fromRate = rates[from]
  const toRate = rates[to]

  if (!fromRate || !toRate) throw new Error(`Rate not found: ${from}/${to}`)

  return toRate / fromRate
}

async function fetchRates(): Promise<Rates> {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY
  if (!apiKey) throw new Error('EXCHANGE_RATE_API_KEY is not set')

  const res = await fetch(
    `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`
  )

  if (!res.ok) throw new Error(`Exchange rate API error: ${res.status}`)

  const data = await res.json()

  if (!data?.conversion_rates || typeof data.conversion_rates !== 'object') {
    throw new Error('Unexpected API response shape')
  }

  return data.conversion_rates as Rates
}

export const getAllRates = unstable_cache(fetchRates, ['exchange-rates'], {
  revalidate: 3600,
})

export async function getRate(from: string, to: string): Promise<number> {
  const rates = await getAllRates()
  return computeRate(rates, from, to)
}
