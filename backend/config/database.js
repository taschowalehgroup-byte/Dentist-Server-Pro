/**
 * database.js — powered by sql.js (pure JavaScript SQLite, no native build needed)
 * Exposes the same run / get / all / db API as the original sqlite3 version.
 * Data is persisted to disk as a binary .sqlite file after every write.
 *
 * NOTE: sql.js init is async, so this module exports a `ready` Promise.
 * server.js waits on it before starting the HTTP listener.
 */

const initSqlJs = require('sql.js');
const fs   = require('fs');
const path = require('path');

const DB_PATH     = path.join(__dirname, '..', '..', 'database', 'database.sqlite');
const SCHEMA_PATH = path.join(__dirname, '..', '..', 'database', 'schema.sql');
const SEED_PATH   = path.join(__dirname, '..', '..', 'database', 'seeds', 'seed.sql');

// Shared state — filled once `ready` resolves
let _db = null;

function persist() {
  try {
    fs.writeFileSync(DB_PATH, Buffer.from(_db.export()));
  } catch (e) {
    console.error('[DB] persist error:', e.message);
  }
}

// ── Promise wrappers ───────────────────────────────────────────────────────

const run = (sql, params = []) => {
  try {
    _db.run(sql, params);
    let lastID = null;
    try {
      const r = _db.exec('SELECT last_insert_rowid() AS id');
      lastID = r[0]?.values[0][0] ?? null;
    } catch {}
    const changes = _db.getRowsModified();
    persist();
    return Promise.resolve({ lastID, changes });
  } catch (e) { return Promise.reject(e); }
};

const get = (sql, params = []) => {
  try {
    const stmt = _db.prepare(sql);
    stmt.bind(params);
    const row = stmt.step() ? stmt.getAsObject() : undefined;
    stmt.free();
    return Promise.resolve(row);
  } catch (e) { return Promise.reject(e); }
};

const all = (sql, params = []) => {
  try {
    const stmt = _db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return Promise.resolve(rows);
  } catch (e) { return Promise.reject(e); }
};

// db shim — used by stats.js reset route
const db = {
  exec(sql, callback) {
    try { _db.run(sql); persist(); if (callback) callback(null); }
    catch (e) { if (callback) callback(e); }
  }
};

// ── Initialise ─────────────────────────────────────────────────────────────
const ready = initSqlJs().then(SQL => {
  const dbExists = fs.existsSync(DB_PATH);

  if (dbExists) {
    _db = new SQL.Database(fs.readFileSync(DB_PATH));
    console.log('Connected to SQLite database (loaded from file).');
  } else {
    _db = new SQL.Database();
    console.log('Connected to SQLite database (new).');

    try { _db.run(fs.readFileSync(SCHEMA_PATH, 'utf8')); console.log('Schema applied.'); }
    catch (e) { console.error('Schema error:', e.message); }

    if (fs.existsSync(SEED_PATH)) {
      try { _db.run(fs.readFileSync(SEED_PATH, 'utf8')); console.log('Seed data loaded.'); }
      catch (e) { console.error('Seed error:', e.message); }
    }
    persist();
  }
});

module.exports = { db, run, get, all, SCHEMA_PATH, SEED_PATH, ready };
