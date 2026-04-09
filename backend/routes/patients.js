const express = require('express');
const router  = express.Router();
const { run, get, all } = require('../config/database');
const { syncTable }     = require('../config/syncJson');

const sync = () => syncTable(all, 'patients');

// GET all
router.get('/', async (req, res, next) => {
  try { res.json(await all('SELECT * FROM patients ORDER BY id DESC')); }
  catch(e) { next(e); }
});

// GET by id
router.get('/:id', async (req, res, next) => {
  try {
    const row = await get('SELECT * FROM patients WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Patient not found' });
    res.json(row);
  } catch(e) { next(e); }
});

// POST create
router.post('/', async (req, res, next) => {
  try {
    const keys = Object.keys(req.body).filter(k => k !== 'id');
    const vals = keys.map(k => req.body[k]);
    const result = await run(
      `INSERT INTO patients (${keys.join(',')}) VALUES (${keys.map(() => '?').join(',')})`, vals
    );
    const row = await get('SELECT * FROM patients WHERE id = ?', [result.lastID]);
    await sync();
    res.json(row);
  } catch(e) { next(e); }
});

// PUT update
router.put('/:id', async (req, res, next) => {
  try {
    const keys = Object.keys(req.body).filter(k => k !== 'id' && k !== 'created_at');
    const vals = keys.map(k => req.body[k]);
    await run(`UPDATE patients SET ${keys.map(k => `${k}=?`).join(',')} WHERE id = ?`, [...vals, req.params.id]);
    const row = await get('SELECT * FROM patients WHERE id = ?', [req.params.id]);
    await sync();
    res.json(row);
  } catch(e) { next(e); }
});

// DELETE
router.delete('/:id', async (req, res, next) => {
  try {
    await run('DELETE FROM treatments WHERE patient_id = ?', [req.params.id]);
    await run('DELETE FROM appointments WHERE patient_id = ?', [req.params.id]);
    await run('DELETE FROM patients WHERE id = ?', [req.params.id]);
    await sync();
    await syncTable(all, 'treatments');
    await syncTable(all, 'appointments');
    res.json({ success: true });
  } catch(e) { next(e); }
});

module.exports = router;
