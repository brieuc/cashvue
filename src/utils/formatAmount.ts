export const CURRENCY_LOCALES = {
  SGD: 'en-SG',
  THB: 'th-TH',
  COP: 'es-CO',
  BRL: 'pt-BR',
  OMR: 'ar-OM-u-nu-latn',
  KRW: 'ko-KR',
  HRK: 'hr-HR',
  KHR: 'km-KH',
  USD: 'en-US',
  VND: 'vi-VN',
  EUR: 'fr-FR',
  CHF: 'de-CH',
  MAD: 'fr-MA',
  SEK: 'sv-SE',
  DKK: 'da-DK',
  GBP: 'en-GB',
  PAB: 'es-PA',
  LKR: 'si-LK',
  JPY: 'ja-JP',
  MXN: 'es-MX',
} as const satisfies Record<string, string>;

export type CurrencyCode = keyof typeof CURRENCY_LOCALES;

const DEFAULT_LOCALE = 'de-CH';

export function isCurrencyCode(code: string | null | undefined): code is CurrencyCode {
  return !!code && Object.prototype.hasOwnProperty.call(CURRENCY_LOCALES, code.toUpperCase());
}

export function getLocaleForCurrency(
  code: string | null | undefined,
  fallback: string = DEFAULT_LOCALE,
): string {
  const upper = code?.toUpperCase();
  return isCurrencyCode(upper) ? CURRENCY_LOCALES[upper] : fallback;
}

const formatterCache = new Map<string, Intl.NumberFormat>();

export function formatAmount(amount: number, code: string): string {
  if (!code)
    return '';
  const upper = code.toUpperCase();
  let formatter = formatterCache.get(upper);
  if (!formatter) {
    formatter = new Intl.NumberFormat(getLocaleForCurrency(upper), {
      style: 'currency',
      currency: upper,
    });
    formatterCache.set(upper, formatter);
  }
  return formatter.format(amount);
}
