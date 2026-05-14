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
    <div className="min-h-screen bg-gray-50">
      <AppNav />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Subscriptions</h2>
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
          <div className="bg-white rounded-2xl shadow-sm p-6">
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
