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
    const remoteCount = await getRemoteCount(userId);

    return {
      configured: true,
      provider: PROVIDER,
      mode: 'Primary database',
      checkedAt: new Date().toISOString(),
      remoteCount,
    };
  } catch (err) {
    console.error('Firestore sync status:', err);
    throw new Error('Firestore sync status failed');
  }
}

module.exports = {
  getStatus,
};
