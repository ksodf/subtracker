const Subscription = require('../models/Subscription');
const { getStatus, markSynced } = require('../services/cloudSyncService');
const { sendServerError } = require('../utils/errorUtils');

exports.status = async (req, res) => {
  try {
    res.json(await getStatus(req.user.id));
  } catch (err) {
    console.error('syncStatus:', err);
    sendServerError(res, err);
  }
};

exports.push = async (req, res) => {
  try {
    const subscriptions = await Subscription.findAllByUser(req.user.id);
    const sync = await markSynced(req.user.id, subscriptions.length);
    res.json({
      message: 'Firestore is already the cloud source of truth',
      syncedAt: sync.syncedAt,
      count: sync.count,
      provider: sync.provider,
    });
  } catch (err) {
    console.error('syncPush:', err);
    sendServerError(res, err);
  }
};

exports.pull = async (req, res) => {
  try {
    const subscriptions = await Subscription.findAllByUser(req.user.id);
    const sync = await markSynced(req.user.id, subscriptions.length);

    res.json({
      message: 'Firestore data is already current',
      syncedAt: sync.syncedAt,
      count: subscriptions.length,
      provider: sync.provider,
    });
  } catch (err) {
    console.error('syncPull:', err);
    sendServerError(res, err);
  }
};
