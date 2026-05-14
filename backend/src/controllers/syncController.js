const Subscription = require('../models/Subscription');
const { getStatus, readSnapshot, writeSnapshot } = require('../services/cloudSyncService');

exports.status = async (req, res) => {
  try {
    res.json(getStatus(req.user.id));
  } catch (err) {
    console.error('syncStatus:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.push = async (req, res) => {
  try {
    const subscriptions = await Subscription.findAllByUser(req.user.id);
    const snapshot = writeSnapshot(req.user.id, subscriptions);
    res.json({
      message: 'Cloud snapshot updated',
      syncedAt: snapshot.syncedAt,
      count: snapshot.subscriptions.length,
      provider: snapshot.provider,
    });
  } catch (err) {
    console.error('syncPush:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.pull = async (req, res) => {
  try {
    const snapshot = readSnapshot(req.user.id);
    if (!snapshot) return res.status(404).json({ error: 'No cloud snapshot found' });

    const subscriptions = await Subscription.replaceAllByUser(
      req.user.id,
      snapshot.subscriptions || []
    );

    res.json({
      message: 'Cloud snapshot restored',
      syncedAt: snapshot.syncedAt,
      count: subscriptions.length,
      provider: snapshot.provider,
    });
  } catch (err) {
    console.error('syncPull:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
