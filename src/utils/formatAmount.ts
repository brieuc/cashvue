// For an obscure reason, the fr-FR locale doesn't manage the quote correctly and the currency code
// which should be before the amount.
export const formatAmount = (amount: number, currencyCode: string, locale = 'de-CH') => {
  if (!currencyCode)
    return '';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
};
