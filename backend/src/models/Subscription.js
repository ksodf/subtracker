const db = require('../config/firebase');

const SUBSCRIPTIONS_COLLECTION = 'subscriptions';

function normalizeSubscription(doc) {
  if (!doc.exists) return null;
  const data = doc.data();
  return {
    id: doc.id,
    user_id: data.user_id,
    name: data.name,
    price: data.price,
    category: data.category,
    billing_date: data.billing_date,
    status: data.status,
    created_at: data.created_at,
    updated_at: data.updated_at,
    billing_cycle: data.billing_cycle || 'monthly',
    start_date: data.start_date || null,
    payment_method: data.payment_method || '',
    currency: data.currency || 'USD',
    notes: data.notes || '',
  };
}

function buildPayload(userId, subscription) {
  const now = new Date().toISOString();
  return {
    user_id: String(userId),
    name: subscription.name,
    price: Number(subscription.price),
    category: subscription.category,
    billing_date: subscription.billing_date,
    status: subscription.status || 'active',
    billing_cycle: subscription.billing_cycle || 'monthly',
    start_date: subscription.start_date || null,
    payment_method: subscription.payment_method || '',
    currency: subscription.currency || 'USD',
    notes: subscription.notes || '',
    created_at: subscription.created_at || now,
    updated_at: now,
  };
}

function sortByBillingDate(rows) {
  return rows.sort((a, b) => String(a.billing_date).localeCompare(String(b.billing_date)));
}

async function commitInChunks(operations) {
  for (let i = 0; i < operations.length; i += 450) {
    const batch = db.batch();
    operations.slice(i, i + 450).forEach(operation => operation(batch));
    await batch.commit();
  }
}

function handleFirestoreError(action, err) {
  console.error(`Firestore subscription ${action}:`, err);
  throw new Error(`Firestore subscription ${action} failed`);
}

const Subscription = {
  async findAllByUser(userId) {
    try {
      const snapshot = await db
        .collection(SUBSCRIPTIONS_COLLECTION)
        .where('user_id', '==', String(userId))
        .get();

      return sortByBillingDate(snapshot.docs.map(normalizeSubscription));
    } catch (err) {
      handleFirestoreError('findAllByUser', err);
    }
  },

  async findById(id, userId) {
    try {
      const doc = await db.collection(SUBSCRIPTIONS_COLLECTION).doc(String(id)).get();
      const subscription = normalizeSubscription(doc);
      if (!subscription || subscription.user_id !== String(userId)) return null;
      return subscription;
    } catch (err) {
      handleFirestoreError('findById', err);
    }
  },

  async create(userId, {
    name,
    price,
    category,
    billing_date,
    status = 'active',
    billing_cycle = 'monthly',
    start_date = null,
    payment_method = '',
    currency = 'USD',
    notes = '',
  }) {
    try {
      const payload = buildPayload(userId, {
        name,
        price,
        category,
        billing_date,
        status,
        billing_cycle,
        start_date,
        payment_method,
        currency,
        notes,
      });
      const ref = await db.collection(SUBSCRIPTIONS_COLLECTION).add(payload);
      return this.findById(ref.id, userId);
    } catch (err) {
      handleFirestoreError('create', err);
    }
  },

  async update(id, userId, {
    name,
    price,
    category,
    billing_date,
    status,
    billing_cycle = 'monthly',
    start_date = null,
    payment_method = '',
    currency = 'USD',
    notes = '',
  }) {
    try {
      const existing = await this.findById(id, userId);
      if (!existing) return null;

      await db.collection(SUBSCRIPTIONS_COLLECTION).doc(String(id)).update({
        name,
        price: Number(price),
        category,
        billing_date,
        status,
        billing_cycle,
        start_date: start_date || null,
        payment_method: payment_method || '',
        currency: currency || 'USD',
        notes: notes || '',
        updated_at: new Date().toISOString(),
      });

      return this.findById(id, userId);
    } catch (err) {
      handleFirestoreError('update', err);
    }
  },

  async replaceAllByUser(userId, subscriptions) {
    try {
      const existing = await db
        .collection(SUBSCRIPTIONS_COLLECTION)
        .where('user_id', '==', String(userId))
        .get();
      const deleteOps = existing.docs.map(doc => batch => batch.delete(doc.ref));
      await commitInChunks(deleteOps);

      const createOps = subscriptions.map(sub => {
        const ref = db.collection(SUBSCRIPTIONS_COLLECTION).doc();
        return batch => batch.set(ref, buildPayload(userId, sub));
      });
      await commitInChunks(createOps);

      return this.findAllByUser(userId);
    } catch (err) {
      handleFirestoreError('replaceAllByUser', err);
    }
  },

  async delete(id, userId) {
    try {
      const existing = await this.findById(id, userId);
      if (!existing) return false;
      await db.collection(SUBSCRIPTIONS_COLLECTION).doc(String(id)).delete();
      return true;
    } catch (err) {
      handleFirestoreError('delete', err);
    }
  },
};

module.exports = Subscription;
