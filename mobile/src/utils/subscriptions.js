import { SUPPORTED_CURRENCIES } from './currency';

export const CATEGORIES = [
  'Entertainment',
  'Health',
  'Productivity',
  'Education',
  'Utilities',
  'Other',
];

export const BILLING_CYCLES = ['weekly', 'monthly', 'quarterly', 'yearly'];
export const STATUSES = ['active', 'inactive', 'cancelled'];
export const DEFAULT_CURRENCY = SUPPORTED_CURRENCIES[0];

export function formatCycle(cycle) {
  if (!cycle) return 'Monthly';
  return `${cycle.charAt(0).toUpperCase()}${cycle.slice(1)}`;
}

export function monthlyPrice(subscription) {
  const source = subscription.monthly_display_price ?? subscription.price;
  const price = Number(source || 0);

  if (subscription.monthly_display_price !== undefined) return price;

  switch (subscription.billing_cycle) {
    case 'weekly':
      return (price * 52) / 12;
    case 'quarterly':
      return price / 3;
    case 'yearly':
      return price / 12;
    default:
      return price;
  }
}

export function buildLocalSummary(subscriptions = [], apiSummary = null) {
  const active = subscriptions.filter(item => item.status === 'active');
  const monthlyTotal =
    apiSummary?.monthlyTotal ?? active.reduce((total, item) => total + monthlyPrice(item), 0);
  const categoryBreakdown =
    apiSummary?.categoryBreakdown ??
    active.reduce((map, item) => {
      map[item.category] = (map[item.category] || 0) + monthlyPrice(item);
      return map;
    }, {});
  const upcomingBills = apiSummary?.upcomingBills ?? [];
  const largest = active.reduce((highest, item) => {
    if (!highest) return item;
    return monthlyPrice(item) > monthlyPrice(highest) ? item : highest;
  }, null);

  return {
    active,
    inactive: subscriptions.filter(item => item.status !== 'active'),
    monthlyTotal,
    yearlyTotal: monthlyTotal * 12,
    categoryBreakdown,
    upcomingBills,
    largest,
    averageMonthly: active.length ? monthlyTotal / active.length : 0,
  };
}
