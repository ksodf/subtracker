const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../../subtracker.db');

let _dbPromise = null;

function _initDb(SQL) {
  const instance = fs.existsSync(DB_PATH)
    ? new SQL.Database(fs.readFileSync(DB_PATH))
    : new SQL.Database();

  instance.run(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      email         TEXT    NOT NULL UNIQUE,
      password_hash TEXT    NOT NULL,
      created_at    TEXT    DEFAULT (datetime('now'))
    )
  `);
  instance.run(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER NOT NULL,
      name         TEXT    NOT NULL,
      price        REAL    NOT NULL,
      category     TEXT    NOT NULL DEFAULT 'Other',
      billing_date TEXT    NOT NULL,
      status       TEXT    NOT NULL DEFAULT 'active',
      created_at   TEXT    DEFAULT (datetime('now')),
      updated_at   TEXT    DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  _ensureColumn(instance, 'subscriptions', 'billing_cycle', "billing_cycle TEXT NOT NULL DEFAULT 'monthly'");
  _ensureColumn(instance, 'subscriptions', 'start_date', 'start_date TEXT');
  _ensureColumn(instance, 'subscriptions', 'payment_method', "payment_method TEXT DEFAULT ''");
  _ensureColumn(instance, 'subscriptions', 'notes', "notes TEXT DEFAULT ''");
  _ensureColumn(instance, 'subscriptions', 'currency', "currency TEXT NOT NULL DEFAULT 'USD'");

  _persist(instance);
  return instance;
}

function _ensureColumn(db, table, column, definition) {
  const rows = _queryAll(db, `PRAGMA table_info(${table})`, []);
  if (!rows.some(row => row.name === column)) {
    db.run(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
  }
}

function _persist(db) {
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
}

function _getDb() {
  if (!_dbPromise) {
    _dbPromise = initSqlJs().then(_initDb);
  }
  return _dbPromise;
}

function _queryAll(db, sql, params) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

// Exposes the same pool.execute([rows]) contract that mysql2 does.
const pool = {
  execute: async (sql, params = []) => {
    const db = await _getDb();
    const verb = sql.trimStart().slice(0, 6).toUpperCase();

    if (verb === 'SELECT') {
      return [_queryAll(db, sql, params)];
    }

    // Mutating statement
    db.run(sql, params);

    const [info] = _queryAll(db, 'SELECT last_insert_rowid() AS id, changes() AS ch', []);
    _persist(db);

    return [{ insertId: info.id, affectedRows: info.ch }];
  },

  getConnection: async () => ({ release: () => {} }),
};

async function testConnection() {
  await _getDb();
  console.log(`SQLite ready — ${DB_PATH}`);
}

module.exports = { pool, testConnection };
