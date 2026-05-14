import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { subscriptionApi } from '../api/client';
import SpendingChart from './SpendingChart';
import UpcomingBills from './UpcomingBills';
import { formatMoney, SUPPORTED_CURRENCIES } from '../utils/currency';

export default function Dashboard() {
  const [currency, setCurrency] = useState(() => localStorage.getItem('dashboardCurrency') || 'USD');
  const [data, setData] = useState({ subscriptions: [], summary: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const { data: res } = await subscriptionApi.getAll(currency);
      setData(res);
      setError('');
    } catch {
      setError('Failed to load subscriptions. Is the server running?');
    } finally {
      setLoading(false);
    }
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('dashboardCurrency', currency);
    fetchData();
  }, [currency, fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm">{error}</div>
    );
  }

  const { subscriptions, summary } = data;
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
  const activeCount = activeSubscriptions.length;
  const upcomingBills = summary?.upcomingBills ?? [];
  const upcomingTotal = upcomingBills.reduce((sum, bill) => sum + parseFloat(bill.display_price ?? bill.price), 0);
  const mostExpensive = activeSubscriptions.reduce((highest, sub) => {
    if (!highest) return sub;
    return parseFloat(sub.monthly_display_price) > parseFloat(highest.monthly_display_price) ? sub : highest;
  }, null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-3 flex-wrap">
        <select
          className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={currency}
          onChange={e => setCurrency(e.target.value)}
        >
          {SUPPORTED_CURRENCIES.map(code => <option key={code} value={code}>{code}</option>)}
        </select>
        <Link
          to="/subscriptions"
          className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
        >
          View All Subscriptions
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Monthly Total"
          value={formatMoney(summary?.monthlyTotal, currency)}
          bg="bg-blue-50"
          text="text-blue-700"
        />
        <StatCard
          label="Active Subscriptions"
          value={activeCount}
          bg="bg-green-50"
          text="text-green-700"
        />
        <StatCard
          label="Upcoming Bills (48h)"
          value={formatMoney(upcomingTotal, currency)}
          bg="bg-orange-50"
          text="text-orange-700"
        />
        <StatCard
          label="Most Expensive"
          value={mostExpensive?.name ?? 'None'}
          hint={mostExpensive ? formatMoney(mostExpensive.monthly_display_price, currency) : 'No active subscriptions'}
          bg="bg-purple-50"
          text="text-purple-700"
        />
      </div>

      {/* Chart + upcoming bills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingChart breakdown={summary?.categoryBreakdown ?? {}} currency={currency} />
        <UpcomingBills bills={upcomingBills} currency={currency} />
      </div>
    </div>
  );
}

function StatCard({ label, value, hint, bg, text }) {
  return (
    <div className={`rounded-2xl p-5 ${bg}`}>
      <p className={`text-xs font-semibold uppercase tracking-wider opacity-60 ${text}`}>{label}</p>
      <p className={`text-2xl font-bold mt-1 break-words ${text}`}>{value}</p>
      {hint && <p className={`text-xs mt-1 opacity-70 ${text}`}>{hint}</p>}
    </div>
  );
}
