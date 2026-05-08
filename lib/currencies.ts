export const CURRENCIES = {
  IDR: { name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
  USD: { name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  EUR: { name: 'Euro', symbol: '€', flag: '🇪🇺' },
  GBP: { name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  JPY: { name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  CNY: { name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  SGD: { name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  MYR: { name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
  AUD: { name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  HKD: { name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  KRW: { name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  INR: { name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  THB: { name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  PHP: { name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
  VND: { name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳' },
} as const

export type CurrencyCode = keyof typeof CURRENCIES
export type CurrencyMeta = (typeof CURRENCIES)[CurrencyCode]

export const TOP_CURRENCY_CODES = Object.keys(CURRENCIES) as CurrencyCode[]
