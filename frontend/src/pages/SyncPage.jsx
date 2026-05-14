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
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchStatus = useCallback(async ({ quiet = false } = {}) => {
    if (quiet) setRefreshing(true);
    try {
      const { data } = await syncApi.status();
      setStatus({ ...data, checkedAt: data.checkedAt ?? new Date().toISOString() });
      setError('');
      if (quiet) setMessage('Firestore status refreshed.');
    } catch {
      setError('Failed to load sync status. Is the server running?');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const isFirestore = /firestore/i.test(status?.provider ?? '');
  const mode = status?.mode ?? (isFirestore ? 'Primary database' : 'Legacy sync adapter');

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Firestore Database</h2>
          <p className="text-sm text-gray-500 mt-1">Subscriptions are stored directly in Firestore.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm mb-6">{error}</div>
        )}
        {!loading && status && !isFirestore && (
          <div className="bg-amber-50 text-amber-700 rounded-xl p-4 text-sm mb-6">
            This API is still reporting a legacy sync adapter. Restart or redeploy the backend so the sync status route uses the Firestore service.
          </div>
        )}
        {message && (
          <div className="bg-green-50 text-green-700 rounded-xl p-4 text-sm mb-6">{message}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400">
            Loading…
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <SyncStat label="Database" value={status?.provider ?? 'Not configured'} />
              <SyncStat label="Mode" value={mode} />
              <SyncStat label="Documents" value={status?.remoteCount ?? 0} />
              <SyncStat label="Last Verified" value={formatDateTime(status?.checkedAt)} />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => {
                  setMessage('');
                  setError('');
                  fetchStatus({ quiet: true });
                }}
                disabled={refreshing}
                className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {refreshing ? 'Refreshing…' : 'Refresh Status'}
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
