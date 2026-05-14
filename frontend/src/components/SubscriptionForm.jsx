import { useState } from 'react';
import { SUPPORTED_CURRENCIES } from '../utils/currency';

const CATEGORIES = ['Entertainment', 'Health', 'Productivity', 'Education', 'Utilities', 'Other'];
const BILLING_CYCLES = ['weekly', 'monthly', 'quarterly', 'yearly'];
const STATUSES = ['active', 'inactive', 'cancelled'];

const toDateInput = (value) => {
  if (!value) return '';
  return String(value).split('T')[0];
};

const today = () => new Date().toISOString().split('T')[0];

const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

const toDate = (value) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export default function SubscriptionForm({ initial, onSave, onClose, asModal = true }) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    price: initial?.price ?? '',
    currency: initial?.currency ?? 'USD',
    category: initial?.category ?? 'Other',
    billing_cycle: initial?.billing_cycle ?? 'monthly',
    start_date: toDateInput(initial?.start_date) || (initial?.id ? '' : today()),
    billing_date: toDateInput(initial?.billing_date),
    payment_method: initial?.payment_method ?? '',
    status: initial?.status ?? 'active',
    notes: initial?.notes ?? '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const price = parseFloat(form.price);

    if (!form.name.trim()) return 'Subscription name is required.';
    if (!form.category) return 'Category is required.';
    if (!form.currency) return 'Currency is required.';
    if (!form.billing_cycle) return 'Billing cycle is required.';
    if (!Number.isFinite(price) || price <= 0) return 'Price must be greater than 0.';
    if (!isValidDate(form.billing_date)) return 'Next billing date is required.';
    if (form.start_date && !isValidDate(form.start_date)) return 'Start date is invalid.';
    if (
      form.start_date &&
      isValidDate(form.start_date) &&
      toDate(form.billing_date) < toDate(form.start_date)
    ) {
      return 'Next billing date cannot be before the start date.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      await onSave({
        ...form,
        name: form.name.trim(),
        price: parseFloat(form.price),
        start_date: form.start_date || null,
        payment_method: form.payment_method.trim(),
        notes: form.notes.trim(),
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save. Please try again.');
      setSaving(false);
    }
  };

  const content = (
    <div className={`bg-white rounded-2xl p-4 w-full dark:bg-gray-900 dark:border dark:border-gray-800 sm:p-6 ${asModal ? 'shadow-xl max-w-md dark:shadow-none' : 'shadow-sm max-w-2xl dark:shadow-none'}`}>
      <h2 className="text-lg font-semibold text-gray-800 mb-4 dark:text-gray-100">
        {initial?.id ? 'Edit Subscription' : 'New Subscription'}
      </h2>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2 mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-gray-600 mb-1 block dark:text-gray-300">Name</label>
            <input
              type="text" placeholder="e.g. Netflix" required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              value={form.name} onChange={e => set('name', e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block dark:text-gray-300">Category</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              value={form.category} onChange={e => set('category', e.target.value)}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block dark:text-gray-300">Price</label>
            <input
              type="number" placeholder="0.00" required min="0.01" step="0.01"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              value={form.price} onChange={e => set('price', e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block dark:text-gray-300">Currency</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              value={form.currency} onChange={e => set('currency', e.target.value)}
            >
              {SUPPORTED_CURRENCIES.map(code => <option key={code} value={code}>{code}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block dark:text-gray-300">Billing Cycle</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              value={form.billing_cycle} onChange={e => set('billing_cycle', e.target.value)}
            >
              {BILLING_CYCLES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block dark:text-gray-300">Start Date</label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              value={form.start_date} onChange={e => set('start_date', e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block dark:text-gray-300">Next Billing Date</label>
            <input
              type="date" required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              value={form.billing_date} onChange={e => set('billing_date', e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block dark:text-gray-300">Payment Method</label>
            <input
              type="text" placeholder="e.g. Visa ending 1234"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              value={form.payment_method} onChange={e => set('payment_method', e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block dark:text-gray-300">Status</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              value={form.status} onChange={e => set('status', e.target.value)}
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-gray-600 mb-1 block dark:text-gray-300">Notes</label>
            <textarea
              rows={3}
              placeholder="Optional notes"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              value={form.notes} onChange={e => set('notes', e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit" disabled={saving}
            className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button" onClick={onClose}
            className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            {asModal ? 'Cancel' : 'Back'}
          </button>
        </div>
      </form>
    </div>
  );

  if (!asModal) return content;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 dark:bg-black/60">
      {content}
    </div>
  );
}
