const { pool } = require('../config/db');

const Subscription = {
  async findAllByUser(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY billing_date ASC',
      [userId]
    );
    return rows;
  },

  async findById(id, userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM subscriptions WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return rows[0] ?? null;
  },

  async create(userId, {
    name,
    price,
    category,
    billing_date,
    status = 'active',
    billing_cycle = 'monthly',
    start_date = null,
    payment_method = '',
    currency = 'USD',
    notes = '',
  }) {
    const [result] = await pool.execute(
      `INSERT INTO subscriptions
       (user_id, name, price, category, billing_date, status, billing_cycle, start_date, payment_method, currency, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, name, price, category, billing_date, status, billing_cycle, start_date, payment_method, currency, notes]
    );
    return this.findById(result.insertId, userId);
  },

  async update(id, userId, {
    name,
    price,
    category,
    billing_date,
    status,
    billing_cycle = 'monthly',
    start_date = null,
    payment_method = '',
    currency = 'USD',
    notes = '',
  }) {
    await pool.execute(
      `UPDATE subscriptions
       SET name = ?,
           price = ?,
           category = ?,
           billing_date = ?,
           status = ?,
           billing_cycle = ?,
           start_date = ?,
           payment_method = ?,
           currency = ?,
           notes = ?,
           updated_at = datetime('now')
       WHERE id = ? AND user_id = ?`,
      [name, price, category, billing_date, status, billing_cycle, start_date, payment_method, currency, notes, id, userId]
    );
    return this.findById(id, userId);
  },

  async replaceAllByUser(userId, subscriptions) {
    await pool.execute('DELETE FROM subscriptions WHERE user_id = ?', [userId]);

    for (const sub of subscriptions) {
      await this.create(userId, {
        name: sub.name,
        price: sub.price,
        category: sub.category,
        billing_date: sub.billing_date,
        status: sub.status,
        billing_cycle: sub.billing_cycle,
        start_date: sub.start_date,
        payment_method: sub.payment_method,
        currency: sub.currency,
        notes: sub.notes,
      });
    }

    return this.findAllByUser(userId);
  },

  async delete(id, userId) {
    const [result] = await pool.execute(
      'DELETE FROM subscriptions WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  },
};

module.exports = Subscription;
