const Subscription = require('../models/Subscription');
const { getRatesFor, isSupportedCurrency, normalizeCurrency } = require('../utils/currencyUtils');
const { enrichSubscriptions, getSummary } = require('../utils/subscriptionUtils');

const VALID_CATEGORIES = ['Entertainment', 'Health', 'Productivity', 'Education', 'Utilities', 'Other'];
const VALID_BILLING_CYCLES = ['weekly', 'monthly', 'quarterly', 'yearly'];
const VALID_STATUSES = ['active', 'inactive', 'cancelled'];

function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function toDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function validateInput({ name, price, category, billing_date, billing_cycle, status, start_date, currency }, requireStatus) {
  if (!name || price === undefined || !category || !billing_date)
    return 'name, price, category, and billing_date are required';
  if (requireStatus && !status)
    return 'name, price, category, billing_date, and status are required';
  if (!Number.isFinite(Number(price)) || Number(price) <= 0)
    return 'price must be greater than 0';
  if (!VALID_CATEGORIES.includes(category))
    return `category must be one of: ${VALID_CATEGORIES.join(', ')}`;
  if (!VALID_BILLING_CYCLES.includes(billing_cycle))
    return `billing_cycle must be one of: ${VALID_BILLING_CYCLES.join(', ')}`;
  if (!isSupportedCurrency(currency))
    return 'currency is not supported';
  if (status && !VALID_STATUSES.includes(status))
    return `status must be one of: ${VALID_STATUSES.join(', ')}`;
  if (!isValidDate(billing_date))
    return 'billing_date must be a valid date';
  if (start_date && !isValidDate(start_date))
    return 'start_date must be a valid date';
  if (start_date && toDate(billing_date) < toDate(start_date))
    return 'billing_date cannot be before start_date';
  return '';
}

function buildPayload(body, requireStatus = false) {
  const payload = {
    name: typeof body.name === 'string' ? body.name.trim() : body.name,
    price: Number(body.price),
    category: body.category,
    billing_date: body.billing_date,
    status: requireStatus ? body.status : (body.status || 'active'),
    billing_cycle: body.billing_cycle || 'monthly',
    start_date: body.start_date || null,
    payment_method: typeof body.payment_method === 'string' ? body.payment_method.trim() : '',
    currency: body.currency ? String(body.currency).trim().toUpperCase() : 'USD',
    notes: typeof body.notes === 'string' ? body.notes.trim() : '',
  };
  return { payload, error: validateInput(payload, requireStatus) };
}

exports.getAll = async (req, res) => {
  try {
    const displayCurrency = normalizeCurrency(req.query.currency);
    const subscriptions = await Subscription.findAllByUser(req.user.id);
    res.json({
      subscriptions: enrichSubscriptions(subscriptions, displayCurrency),
      summary: getSummary(subscriptions, displayCurrency),
      exchangeRates: getRatesFor(displayCurrency),
    });
  } catch (err) {
    console.error('getAll:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.create = async (req, res) => {
  const { payload, error } = buildPayload(req.body);
  if (error) return res.status(400).json({ error });

  try {
    const sub = await Subscription.create(req.user.id, payload);
    res.status(201).json(sub);
  } catch (err) {
    console.error('create:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { payload, error } = buildPayload(req.body, true);
  if (error) return res.status(400).json({ error });

  try {
    const existing = await Subscription.findById(id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'Subscription not found' });

    const updated = await Subscription.update(id, req.user.id, payload);
    res.json(updated);
  } catch (err) {
    console.error('update:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Subscription.delete(id, req.user.id);
    if (!deleted) return res.status(404).json({ error: 'Subscription not found' });
    res.status(204).send();
  } catch (err) {
    console.error('delete:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
