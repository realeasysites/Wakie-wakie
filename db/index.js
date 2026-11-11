const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dir = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
fs.mkdirSync(dir, { recursive: true });
const db = new Database(path.join(dir, 'wakie.db'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  reason TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  event_date TEXT,
  headcount TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new'
);`);

module.exports = db;
