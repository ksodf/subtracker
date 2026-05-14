import { useCallback, useEffect, useMemo, useState } from 'react';
import AppNav from '../components/AppNav';
import { reportApi, subscriptionApi } from '../api/client';
import { formatMoney, SUPPORTED_CURRENCIES } from '../utils/currency';

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [currency, setCurrency] = useState(() => localStorage.getItem('reportCurrency') || 'USD');
  const [data, setData] = useState({ subscriptions: [], summary: null });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState('');
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await subscriptionApi.getAll(currency);
      setData(res);
      setError('');
    } catch {
      setError('Failed to load report data. Is the server running?');
    } finally {
      setLoading(false);
    }
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('reportCurrency', currency);
    fetchData();
  }, [currency, fetchData]);

  const activeSubscriptions = useMemo(
    () => data.subscriptions.filter(sub => sub.status === 'active'),
    [data.subscriptions]
  );

  const handleExport = async (type) => {
    setExporting(type);
    setError('');
    try {
      const response = type === 'csv'
        ? await reportApi.csv(currency)
        : await reportApi.pdf(currency);
      downloadBlob(response.data, `subtracker-report-${currency}.${type}`);
    } catch {
      setError(`Failed to export ${type.toUpperCase()} report.`);
    } finally {
      setExporting('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AppNav />

      <main className="max-w-5xl mx-auto px-4 py-6 pb-[calc(6rem+env(safe-area-inset-bottom))] md:py-8 md:pb-8">
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap sm:mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 sm:text-2xl">Reports</h2>
            <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">Export subscription spending reports.</p>
          </div>
          <select
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            value={currency}
            onChange={e => setCurrency(e.target.value)}
          >
            {SUPPORTED_CURRENCIES.map(code => <option key={code} value={code}>{code}</option>)}
          </select>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm mb-6">{error}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400">
            Loading…
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ReportCard
                label="Monthly Spend"
                value={formatMoney(data.summary?.monthlyTotal, currency)}
                bg="bg-blue-50"
                text="text-blue-700"
              />
              <ReportCard
                label="Active Subscriptions"
                value={activeSubscriptions.length}
                bg="bg-green-50"
                text="text-green-700"
              />
              <ReportCard
                label="Export Currency"
                value={currency}
                bg="bg-purple-50"
                text="text-purple-700"
              />
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-4 dark:bg-gray-900 dark:shadow-none dark:border dark:border-gray-800 sm:p-6">
              <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                <h3 className="text-base font-semibold text-gray-700 dark:text-gray-100">Export Report</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExport('csv')}
                    disabled={Boolean(exporting)}
                    className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {exporting === 'csv' ? 'Exporting…' : 'Download CSV'}
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    disabled={Boolean(exporting)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    {exporting === 'pdf' ? 'Exporting…' : 'Download PDF'}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-200 dark:text-gray-500 dark:border-gray-800">
                      <th className="py-2 pr-3">Name</th>
                      <th className="py-2 pr-3">Category</th>
                      <th className="py-2 pr-3">Original</th>
                      <th className="py-2 pr-3">Monthly</th>
                      <th className="py-2 pr-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.subscriptions.map(sub => (
                      <tr key={sub.id} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                        <td className="py-2 pr-3 font-medium text-gray-800 dark:text-gray-100">{sub.name}</td>
                        <td className="py-2 pr-3 text-gray-500 dark:text-gray-400">{sub.category}</td>
                        <td className="py-2 pr-3 text-gray-500 dark:text-gray-400">{formatMoney(sub.price, sub.currency)}</td>
                        <td className="py-2 pr-3 text-gray-700 font-semibold dark:text-gray-200">
                          {formatMoney(sub.monthly_display_price, currency)}
                        </td>
                        <td className="py-2 pr-3 text-gray-500 dark:text-gray-400">{sub.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ReportCard({ label, value, bg, text }) {
  return (
    <div className={`rounded-2xl p-4 sm:p-5 ${bg} dark:bg-gray-900 dark:border dark:border-gray-800`}>
      <p className={`text-xs font-semibold uppercase tracking-wider opacity-60 ${text}`}>{label}</p>
      <p className={`text-xl font-bold mt-1 sm:text-2xl ${text}`}>{value}</p>
    </div>
  );
}
