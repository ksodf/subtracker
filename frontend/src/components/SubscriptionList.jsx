import { useState } from 'react';
import { formatMoney } from '../utils/currency';

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-100 text-red-600',
};

const formatDate = (value) => {
  if (!value) return 'Not set';
  return new Date(value).toLocaleDateString();
};

const formatCycle = (cycle) => {
  if (!cycle) return 'Monthly';
  return cycle.charAt(0).toUpperCase() + cycle.slice(1);
};

export default function SubscriptionList({ subscriptions, onEdit, onCancel, onDelete }) {
  const [viewId, setViewId] = useState(null);

  if (subscriptions.length === 0) {
    return (
      <p className="text-gray-400 text-sm text-center py-10">
        No active subscriptions yet. Click <strong>+ Add</strong> to get started.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {subscriptions.map(sub => (
        <div
          key={sub.id}
          className="border rounded-xl px-3 py-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm text-gray-800 truncate">{sub.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {sub.category} &middot; {formatCycle(sub.billing_cycle)} &middot; due {formatDate(sub.billing_date)}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[sub.status] ?? STATUS_STYLES.inactive}`}>
                {sub.status}
              </span>
              <span className="text-sm font-semibold text-gray-700 min-w-20 text-right">
                {formatMoney(sub.price, sub.currency)}
              </span>
              <button
                onClick={() => setViewId(viewId === sub.id ? null : sub.id)}
                className="text-xs text-gray-500 hover:text-gray-700 font-medium"
              >
                View
              </button>
              <button
                onClick={() => onEdit(sub)}
                className="text-xs text-blue-500 hover:text-blue-700 font-medium"
              >
                Edit
              </button>
              {onCancel && sub.status !== 'cancelled' && (
                <button
                  onClick={() => onCancel(sub)}
                  className="text-xs text-red-400 hover:text-red-600 font-medium"
                >
                  Cancel
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(sub.id)}
                  className="text-xs text-red-400 hover:text-red-600 font-medium"
                >
                  Del
                </button>
              )}
            </div>
          </div>

          {viewId === sub.id && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t mt-3 pt-3 text-xs text-gray-500">
              <Detail label="Billing Cycle" value={formatCycle(sub.billing_cycle)} />
              <Detail label="Price" value={formatMoney(sub.price, sub.currency)} />
              <Detail label="Next Billing Date" value={formatDate(sub.billing_date)} />
              <Detail label="Start Date" value={formatDate(sub.start_date)} />
              <Detail label="Payment Method" value={sub.payment_method || 'Not set'} />
              <div className="sm:col-span-2">
                <Detail label="Notes" value={sub.notes || 'No notes'} />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="font-semibold text-gray-600">{label}</p>
      <p className="mt-0.5">{value}</p>
    </div>
  );
}
