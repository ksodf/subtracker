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
      <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center h-64 text-gray-400">
        <p className="text-sm">No active subscriptions yet.</p>
        <p className="text-xs mt-1">Add one to see your spending breakdown.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-700 mb-4">Spending by Category</h2>
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
