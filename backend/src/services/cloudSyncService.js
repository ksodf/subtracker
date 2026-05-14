const db = require('../config/firebase');

const PROVIDER = 'Firebase Firestore';

async function getRemoteCount(userId) {
  const snapshot = await db
    .collection('subscriptions')
    .where('user_id', '==', String(userId))
    .get();
  return snapshot.size;
}

async function getStatus(userId) {
  try {
    const [userDoc, remoteCount] = await Promise.all([
      db.collection('users').doc(String(userId)).get(),
      getRemoteCount(userId),
    ]);
    const user = userDoc.exists ? userDoc.data() : {};

    return {
      configured: true,
      provider: PROVIDER,
      mode: 'Primary database',
      checkedAt: new Date().toISOString(),
      lastSyncedAt: user.last_synced_at ?? null,
      remoteCount,
    };
  } catch (err) {
    console.error('Firestore sync status:', err);
    throw new Error('Firestore sync status failed');
  }
}

async function markSynced(userId, count) {
  try {
    const syncedAt = new Date().toISOString();
    await db.collection('users').doc(String(userId)).set({
      last_synced_at: syncedAt,
      sync_provider: PROVIDER,
      remote_count: count,
    }, { merge: true });

    return {
      provider: PROVIDER,
      syncedAt,
      count,
    };
  } catch (err) {
    console.error('Firestore sync markSynced:', err);
    throw new Error('Firestore sync update failed');
  }
}

module.exports = {
  getStatus,
  markSynced,
};
