const db = require('../config/firebase');

const USERS_COLLECTION = 'users';

function toUser(doc) {
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

function handleFirestoreError(action, err) {
  console.error(`Firestore user ${action}:`, err);
  throw new Error(`Firestore user ${action} failed`);
}

const User = {
  async findByEmail(email) {
    try {
      const snapshot = await db
        .collection(USERS_COLLECTION)
        .where('email_lower', '==', email.toLowerCase())
        .limit(1)
        .get();

      if (snapshot.empty) return null;
      return toUser(snapshot.docs[0]);
    } catch (err) {
      handleFirestoreError('findByEmail', err);
    }
  },

  async findById(id) {
    try {
      const doc = await db.collection(USERS_COLLECTION).doc(String(id)).get();
      const user = toUser(doc);
      if (!user) return null;
      return { id: user.id, email: user.email, created_at: user.created_at };
    } catch (err) {
      handleFirestoreError('findById', err);
    }
  },

  async create(email, passwordHash) {
    try {
      const now = new Date().toISOString();
      const ref = await db.collection(USERS_COLLECTION).add({
        email,
        email_lower: email.toLowerCase(),
        password_hash: passwordHash,
        created_at: now,
      });

      return { id: ref.id, email, created_at: now };
    } catch (err) {
      handleFirestoreError('create', err);
    }
  },
};

module.exports = User;
