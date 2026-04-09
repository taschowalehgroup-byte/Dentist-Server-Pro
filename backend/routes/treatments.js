const express = require('express');
const router  = express.Router();
const { run, get, all } = require('../config/database');
const { syncTable }     = require('../config/syncJson');
const sync = () => syncTable(all, 'treatments');

// GET all treatments (with optional ?patient_id= filter)
router.get('/', async (req, res, next) => {
  try {
    const { patient_id } = req.query;
    let rows;
    if (patient_id) {
      rows = await all('SELECT * FROM treatments WHERE patient_id = ? ORDER BY date DESC', [patient_id]);
    } else {
      rows = await all('SELECT * FROM treatments ORDER BY date DESC');
    }
    res.json(rows);
  } catch(e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const row = await get('SELECT * FROM treatments WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Treatment not found' });
    res.json(row);
  } catch(e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const keys = Object.keys(req.body).filter(k => k !== 'id');
    const vals = keys.map(k => req.body[k]);
    const result = await run(
      `INSERT INTO treatments (${keys.join(',')}) VALUES (${keys.map(() => '?').join(',')})`, vals
    );
    const row = await get('SELECT * FROM treatments WHERE id = ?', [result.lastID]);
    await sync();
    res.json(row);
  } catch(e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const keys = Object.keys(req.body).filter(k => k !== 'id' && k !== 'created_at');
    const vals = keys.map(k => req.body[k]);
    await run(
      `UPDATE treatments SET ${keys.map(k => `${k}=?`).join(',')} WHERE id = ?`,
      [...vals, req.params.id]
    );
    const row = await get('SELECT * FROM treatments WHERE id = ?', [req.params.id]);
    await sync();
    res.json(row);
  } catch(e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await run('DELETE FROM treatments WHERE id = ?', [req.params.id]);
    await sync();
    res.json({ success: true });
  } catch(e) { next(e); }
});

// Bulk import (from Excel/JSON upload)
router.post('/bulk', async (req, res, next) => {
  try {
    const { rows } = req.body; // array of treatment objects
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'rows array required' });
    }
    let inserted = 0;
    for (const t of rows) {
      const keys = Object.keys(t).filter(k => k !== 'id');
      if (!keys.includes('treatment_type') || !keys.includes('date')) continue;
      const vals = keys.map(k => t[k]);
      await run(
        `INSERT INTO treatments (${keys.join(',')}) VALUES (${keys.map(() => '?').join(',')})`, vals
      );
      inserted++;
    }
    await sync();
    res.json({ success: true, inserted });
  } catch(e) { next(e); }
});

module.exports = router;
