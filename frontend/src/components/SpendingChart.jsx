import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatMoney } from '../utils/currency';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function SpendingChart({ breakdown, currency = 'USD' }) {
  const data = Object.entries(breakdown).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2)),
  }));

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center justify-center h-56 text-gray-400 dark:bg-gray-900 dark:text-gray-500 dark:shadow-none dark:border dark:border-gray-800 sm:h-64 sm:p-6">
        <p className="text-sm">No active subscriptions yet.</p>
        <p className="text-xs mt-1">Add one to see your spending breakdown.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 dark:bg-gray-900 dark:shadow-none dark:border dark:border-gray-800 sm:p-6">
      <h2 className="text-base font-semibold text-gray-700 mb-4 dark:text-gray-100">Spending by Category</h2>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={85}
            dataKey="value"
            labelLine={false}
            label={({ name, percent }) =>
              percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''
            }
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(val) => [formatMoney(val, currency), 'Monthly']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
