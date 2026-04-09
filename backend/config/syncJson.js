/**
 * DentCare Pro — JSON Sync Helper
 * After every DB write, syncs that table to its own JSON file in database/JSON/
 * Files: patients.json, doctors.json, appointments.json, treatments.json,
 *        transactions.json, inventory.json, users.json, settings.json
 */

const fs   = require('fs');
const path = require('path');

const JSON_DIR = path.join(__dirname, '..', '..', 'database', 'JSON');

// Make sure folder exists
if (!fs.existsSync(JSON_DIR)) fs.mkdirSync(JSON_DIR, { recursive: true });

/**
 * Write rows to database/JSON/<table>.json
 * @param {string} table  - e.g. 'patients'
 * @param {Array}  rows   - array of row objects
 */
function writeJson(table, rows) {
  const file = path.join(JSON_DIR, `${table}.json`);
  const payload = {
    _meta: { table, updated: new Date().toISOString(), count: rows.length },
    data: rows
  };
  try {
    fs.writeFileSync(file, JSON.stringify(payload, null, 2), 'utf8');
  } catch (e) {
    console.error(`[syncJson] Failed to write ${file}:`, e.message);
  }
}

/**
 * Sync a single table from the DB into its JSON file.
 * Call this after every INSERT / UPDATE / DELETE.
 *
 * @param {function} allFn   - the DB `all` helper
 * @param {string}   table   - table name
 * @param {string}   [sql]   - optional custom SELECT; defaults to SELECT * FROM table
 */
async function syncTable(allFn, table, sql) {
  try {
    const rows = await allFn(sql || `SELECT * FROM ${table} ORDER BY id ASC`);
    writeJson(table, rows);
  } catch (e) {
    console.error(`[syncJson] Failed to sync ${table}:`, e.message);
  }
}

module.exports = { syncTable, writeJson };
