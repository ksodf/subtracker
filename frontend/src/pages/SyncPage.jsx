import { useCallback, useEffect, useState } from 'react';
import AppNav from '../components/AppNav';
import { syncApi } from '../api/client';

const formatDateTime = (value) => {
  if (!value) return 'Never';
  return new Date(value).toLocaleString();
};

export default function SyncPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await syncApi.status();
      setStatus(data);
      setError('');
    } catch {
      setError('Failed to load sync status. Is the server running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const handlePush = async () => {
    setBusy('push');
    setMessage('');
    setError('');
    try {
      const { data } = await syncApi.push();
      setMessage(`${data.count} subscriptions synced to ${data.provider}.`);
      fetchStatus();
    } catch {
      setError('Failed to push cloud snapshot.');
    } finally {
      setBusy('');
    }
  };

  const handlePull = async () => {
    if (!window.confirm('Restore from the cloud snapshot? This replaces your local subscriptions.')) return;

    setBusy('pull');
    setMessage('');
    setError('');
    try {
      const { data } = await syncApi.pull();
      setMessage(`${data.count} subscriptions restored from ${data.provider}.`);
      fetchStatus();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to pull cloud snapshot.');
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Cloud Sync</h2>
          <p className="text-sm text-gray-500 mt-1">Back up and restore your subscription database snapshot.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm mb-6">{error}</div>
        )}
        {message && (
          <div className="bg-green-50 text-green-700 rounded-xl p-4 text-sm mb-6">{message}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400">
            Loading…
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <SyncStat label="Provider" value={status?.provider ?? 'Not configured'} />
              <SyncStat label="Last Sync" value={formatDateTime(status?.lastSyncedAt)} />
              <SyncStat label="Cloud Items" value={status?.remoteCount ?? 0} />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handlePush}
                disabled={Boolean(busy)}
                className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {busy === 'push' ? 'Syncing…' : 'Push to Cloud'}
              </button>
              <button
                onClick={handlePull}
                disabled={Boolean(busy)}
                className="text-sm border rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {busy === 'pull' ? 'Restoring…' : 'Pull from Cloud'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SyncStat({ label, value }) {
  return (
    <div className="rounded-2xl p-5 bg-gray-50">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      <p className="text-lg font-bold mt-1 text-gray-700 break-words">{value}</p>
    </div>
  );
}
