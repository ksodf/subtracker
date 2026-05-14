const { getStatus } = require('../services/cloudSyncService');
const { sendServerError } = require('../utils/errorUtils');

exports.status = async (req, res) => {
  try {
    res.json(await getStatus(req.user.id));
  } catch (err) {
    console.error('syncStatus:', err);
    sendServerError(res, err);
  }
};
