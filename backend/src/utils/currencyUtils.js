const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'THB', 'JPY', 'CAD', 'AUD'];

// Static demo rates expressed as USD value for 1 unit of currency.
// Keeping this local avoids adding a network dependency; a real deployment can
// swap this module for a live exchange-rate provider.
const USD_RATES = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  THB: 0.027,
  JPY: 0.0067,
  CAD: 0.74,
  AUD: 0.66,
};

function normalizeCurrency(currency) {
  const value = String(currency || 'USD').trim().toUpperCase();
  return SUPPORTED_CURRENCIES.includes(value) ? value : 'USD';
}

function isSupportedCurrency(currency) {
  return SUPPORTED_CURRENCIES.includes(String(currency || '').trim().toUpperCase());
}

function convertCurrency(amount, fromCurrency = 'USD', toCurrency = 'USD') {
  const from = normalizeCurrency(fromCurrency);
  const to = normalizeCurrency(toCurrency);
  const numeric = Number(amount) || 0;
  return (numeric * USD_RATES[from]) / USD_RATES[to];
}

function getRatesFor(baseCurrency = 'USD') {
  const base = normalizeCurrency(baseCurrency);
  return SUPPORTED_CURRENCIES.reduce((rates, currency) => {
    rates[currency] = convertCurrency(1, currency, base);
    return rates;
  }, {});
}

module.exports = {
  SUPPORTED_CURRENCIES,
  convertCurrency,
  getRatesFor,
  isSupportedCurrency,
  normalizeCurrency,
};
