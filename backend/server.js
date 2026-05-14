require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./src/routes/auth');
const subscriptionRoutes = require('./src/routes/subscriptions');
const reportRoutes = require('./src/routes/reports');
const syncRoutes = require('./src/routes/sync');
const db = require('./src/config/firebase');

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
}));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/sync', syncRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;

async function testConnection() {
  await db.collection('users').limit(1).get();
  console.log(`Firestore ready — ${process.env.FIREBASE_PROJECT_ID}`);
}

testConnection()
  .then(() => app.listen(PORT, () => console.log(`SubTracker API on http://localhost:${PORT}`)))
  .catch(err => { console.error('DB connection failed:', err.message); process.exit(1); });
