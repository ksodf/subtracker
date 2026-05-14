export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'THB', 'JPY', 'CAD', 'AUD'];

export function formatMoney(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'JPY' ? 0 : 2,
  }).format(Number(value || 0));
}
