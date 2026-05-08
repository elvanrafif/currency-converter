export type ParsedPair = { from: string; to: string }

export function parsePair(slug: string): ParsedPair | null {
  const match = slug.match(/^([a-z]{3})-to-([a-z]{3})$/)
  if (!match) return null

  const from = match[1].toUpperCase()
  const to = match[2].toUpperCase()

  if (from === to) return null

  return { from, to }
}

export function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}
