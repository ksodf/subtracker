const { pool } = require('../config/db');

const User = {
  async findByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] ?? null;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, email, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] ?? null;
  },

  async create(email, passwordHash) {
    const [result] = await pool.execute(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, passwordHash]
    );
    return { id: result.insertId, email };
  },
};

module.exports = User;
