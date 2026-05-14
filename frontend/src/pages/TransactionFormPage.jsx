import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { subscriptionApi } from '../api/client';
import AppNav from '../components/AppNav';
import SubscriptionForm from '../components/SubscriptionForm';

export default function TransactionFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [initial, setInitial] = useState(isEditing ? null : {});
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEditing) return;

    let ignore = false;
    async function fetchSubscription() {
      try {
        const { data: res } = await subscriptionApi.getAll();
        const match = (res.subscriptions ?? []).find(sub => String(sub.id) === String(id));
        if (!ignore) {
          if (match) {
            setInitial(match);
            setError('');
          } else {
            setError('Subscription not found.');
          }
        }
      } catch {
        if (!ignore) setError('Failed to load subscription. Is the server running?');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchSubscription();
    return () => { ignore = true; };
  }, [id, isEditing]);

  const handleSave = async (formData) => {
    if (isEditing) {
      await subscriptionApi.update(id, formData);
    } else {
      await subscriptionApi.create(formData);
    }
    navigate('/subscriptions');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Edit Subscription' : 'Add Subscription'}
          </h2>
          <Link to="/subscriptions" className="text-sm text-blue-600 hover:underline font-medium">
            Back to subscriptions
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
          <SubscriptionForm
            initial={initial}
            onSave={handleSave}
            onClose={() => navigate('/subscriptions')}
            asModal={false}
          />
        )}
      </main>
    </div>
  );
}
