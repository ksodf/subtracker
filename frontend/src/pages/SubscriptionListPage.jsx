import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { subscriptionApi } from '../api/client';
import AppNav from '../components/AppNav';
import SubscriptionList from '../components/SubscriptionList';

export default function SubscriptionListPage() {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const { data: res } = await subscriptionApi.getAll();
      setSubscriptions(res.subscriptions ?? []);
      setError('');
    } catch {
      setError('Failed to load subscriptions. Is the server running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const activeSubscriptions = useMemo(
    () => subscriptions.filter(sub => sub.status === 'active'),
    [subscriptions]
  );

  const handleCancel = async (subscription) => {
    if (!window.confirm('Cancel this subscription?')) return;

    try {
      await subscriptionApi.update(subscription.id, {
        ...subscription,
        price: parseFloat(subscription.price),
        status: 'cancelled',
      });
      fetchData();
    } catch {
      alert('Failed to cancel subscription');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AppNav />

      <main className="max-w-5xl mx-auto px-4 py-6 pb-[calc(6rem+env(safe-area-inset-bottom))] md:py-8 md:pb-8">
        <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 sm:text-2xl">Subscriptions</h2>
          <Link
            to="/subscriptions/new"
            className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Subscription
          </Link>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-48 text-gray-400">
            Loading…
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm">{error}</div>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-2xl shadow-sm p-4 dark:bg-gray-900 dark:shadow-none dark:border dark:border-gray-800 sm:p-6">
            <SubscriptionList
              subscriptions={activeSubscriptions}
              onEdit={sub => navigate(`/subscriptions/${sub.id}/edit`)}
              onCancel={handleCancel}
            />
          </div>
        )}
      </main>
    </div>
  );
}
