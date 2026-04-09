const express = require('express');
const router = express.Router();
const fs = require('fs');
const { run, get, all, db, SCHEMA_PATH, SEED_PATH } = require('../config/database');

// Dashboard stats
router.get('/stats', async (req, res, next) => {
  try {
    const [pTotal] = await all('SELECT COUNT(*) as c FROM patients');
    const [dTotal] = await all('SELECT COUNT(*) as c FROM doctors');
    const today = new Date().toISOString().split('T')[0];
    const [aToday] = await all('SELECT COUNT(*) as c FROM appointments WHERE date = ?', [today]);

    const txs = await all('SELECT * FROM transactions');
    const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const inv = await all('SELECT * FROM inventory');
    const lowStock = inv.filter(i => i.quantity <= i.min_stock).length;

    res.json({
      patients: pTotal.c,
      doctors: dTotal.c,
      todayAppts: aToday.c,
      monthIncome: income,
      monthExpense: expense,
      netProfit: income - expense,
      lowStock
    });
  } catch(e) { next(e); }
});

// Next patient number
router.get('/nextPatientNo', async (req, res, next) => {
  try {
    const row = await get('SELECT MAX(id) as maxId FROM patients');
    const nextId = (row.maxId || 0) + 1;
    res.json({ patient_no: 'P-' + String(nextId).padStart(4, '0') });
  } catch(e) { next(e); }
});

// Treatments CRUD
router.get('/treatments', async (req, res, next) => {
  try { res.json(await all('SELECT * FROM treatments ORDER BY date DESC')); }
  catch(e) { next(e); }
});

router.post('/treatments', async (req, res, next) => {
  try {
    const keys = Object.keys(req.body).filter(k => k !== 'id');
    const vals = keys.map(k => req.body[k]);
    const result = await run(
      `INSERT INTO treatments (${keys.join(',')}) VALUES (${keys.map(() => '?').join(',')})`, vals
    );
    res.json(await get('SELECT * FROM treatments WHERE id = ?', [result.lastID]));
  } catch(e) { next(e); }
});

// Users CRUD
router.get('/users', async (req, res, next) => {
  try {
    const users = await all('SELECT id, username, role, doctor_id, created_at FROM users');
    res.json(users);
  } catch(e) { next(e); }
});

// Database reset
router.post('/reset', async (req, res, next) => {
  try {
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    await run('PRAGMA writable_schema = 1;');
    await run('DELETE FROM sqlite_master WHERE type IN ("table", "index", "trigger");');
    await run('PRAGMA writable_schema = 0;');
    await run('VACUUM;');
    await run('PRAGMA INTEGRITY_CHECK;');

    const { db: database } = require('../config/database');
    database.exec(schema, (err) => {
      if (err) res.status(500).json({ error: err.message });
      else {
        if (fs.existsSync(SEED_PATH)) {
          database.exec(fs.readFileSync(SEED_PATH, 'utf8'), () => {});
        }
        res.json({ success: true });
      }
    });
  } catch(e) { next(e); }
});

module.exports = router;
