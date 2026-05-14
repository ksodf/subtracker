const fs = require('fs');
const path = require('path');

const SYNC_DIR = process.env.CLOUD_SYNC_PATH || path.join(__dirname, '../../cloud-sync');

function ensureSyncDir() {
  fs.mkdirSync(SYNC_DIR, { recursive: true });
}

function getSnapshotPath(userId) {
  ensureSyncDir();
  return path.join(SYNC_DIR, `user-${userId}.json`);
}

function getProviderName() {
  return process.env.CLOUD_SYNC_PROVIDER || 'Local JSON cloud adapter';
}

function readSnapshot(userId) {
  const snapshotPath = getSnapshotPath(userId);
  if (!fs.existsSync(snapshotPath)) return null;
  return JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
}

function writeSnapshot(userId, subscriptions) {
  const snapshot = {
    schemaVersion: 1,
    provider: getProviderName(),
    userId,
    syncedAt: new Date().toISOString(),
    subscriptions: subscriptions.map(sub => ({
      name: sub.name,
      price: Number(sub.price),
      currency: sub.currency || 'USD',
      category: sub.category,
      billing_cycle: sub.billing_cycle || 'monthly',
      start_date: sub.start_date || null,
      billing_date: sub.billing_date,
      payment_method: sub.payment_method || '',
      status: sub.status || 'active',
      notes: sub.notes || '',
    })),
  };

  fs.writeFileSync(getSnapshotPath(userId), JSON.stringify(snapshot, null, 2));
  return snapshot;
}

function getStatus(userId) {
  const snapshot = readSnapshot(userId);
  return {
    configured: true,
    provider: getProviderName(),
    lastSyncedAt: snapshot?.syncedAt ?? null,
    remoteCount: snapshot?.subscriptions?.length ?? 0,
  };
}

module.exports = {
  getStatus,
  readSnapshot,
  writeSnapshot,
};
