import type { MetadataRoute } from 'next'
import { TOP_CURRENCY_CODES } from '@/lib/currencies'

export default function sitemap(): MetadataRoute.Sitemap {
  const pairs: MetadataRoute.Sitemap = []

  for (const from of TOP_CURRENCY_CODES) {
    for (const to of TOP_CURRENCY_CODES) {
      if (from !== to) {
        pairs.push({
          url: `https://transfez.com/convert/${from.toLowerCase()}-to-${to.toLowerCase()}`,
          lastModified: new Date(),
          changeFrequency: 'hourly',
          priority: 0.8,
        })
      }
    }
  }

  return pairs
}
