const { convertCurrency, normalizeCurrency } = require('./currencyUtils');

/** Active subs with billing_date within the next 48 hours. */
function getUpcomingBills(subscriptions, displayCurrency = 'USD') {
  const now = new Date();
  const cutoff = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const currency = normalizeCurrency(displayCurrency);
  return subscriptions
    .filter(sub => {
      if (sub.status !== 'active') return false;
      const d = new Date(sub.billing_date);
      return d >= now && d <= cutoff;
    })
    .map(sub => ({
      ...sub,
      display_price: convertCurrency(sub.price, sub.currency, currency),
      display_currency: currency,
    }));
}

function getMonthlyPrice(subscription, displayCurrency = 'USD') {
  const price = parseFloat(subscription.price) || 0;
  const converted = convertCurrency(price, subscription.currency, displayCurrency);

  switch (subscription.billing_cycle) {
    case 'weekly':
      return (converted * 52) / 12;
    case 'quarterly':
      return converted / 3;
    case 'yearly':
      return converted / 12;
    default:
      return converted;
  }
}

/** Monthly spend grouped by category (active subs only). */
function getCategoryBreakdown(subscriptions, displayCurrency = 'USD') {
  return subscriptions
    .filter(s => s.status === 'active')
    .reduce((acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + getMonthlyPrice(s, displayCurrency);
      return acc;
    }, {});
}

/** Sum of all active subscription prices. */
function getMonthlyTotal(subscriptions, displayCurrency = 'USD') {
  return subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + getMonthlyPrice(s, displayCurrency), 0);
}

function enrichSubscriptions(subscriptions, displayCurrency = 'USD') {
  const currency = normalizeCurrency(displayCurrency);
  return subscriptions.map(sub => ({
    ...sub,
    display_price: convertCurrency(sub.price, sub.currency, currency),
    monthly_display_price: getMonthlyPrice(sub, currency),
    display_currency: currency,
  }));
}

function getSummary(subscriptions, displayCurrency = 'USD') {
  const currency = normalizeCurrency(displayCurrency);
  return {
    displayCurrency: currency,
    monthlyTotal: getMonthlyTotal(subscriptions, currency),
    categoryBreakdown: getCategoryBreakdown(subscriptions, currency),
    upcomingBills: getUpcomingBills(subscriptions, currency),
  };
}

module.exports = {
  enrichSubscriptions,
  getCategoryBreakdown,
  getMonthlyPrice,
  getMonthlyTotal,
  getSummary,
  getUpcomingBills,
};
