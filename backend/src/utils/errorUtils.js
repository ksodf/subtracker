function sendServerError(res, err) {
  if (err.message?.startsWith('Firestore')) {
    return res.status(503).json({ error: 'Firestore is unavailable. Please try again later.' });
  }
  return res.status(500).json({ error: 'Internal server error' });
}

module.exports = { sendServerError };
