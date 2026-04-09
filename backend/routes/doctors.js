const express = require('express');
const router  = express.Router();
const { run, get, all } = require('../config/database');
const { syncTable }     = require('../config/syncJson');
const sync = () => syncTable(all, 'doctors');

router.get('/', async (req, res, next) => {
  try { res.json(await all('SELECT * FROM doctors ORDER BY id')); } catch(e) { next(e); }
});
router.get('/:id', async (req, res, next) => {
  try {
    const row = await get('SELECT * FROM doctors WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Doctor not found' });
    res.json(row);
  } catch(e) { next(e); }
});
router.post('/', async (req, res, next) => {
  try {
    const keys = Object.keys(req.body).filter(k => k !== 'id');
    const vals = keys.map(k => req.body[k]);
    const result = await run(`INSERT INTO doctors (${keys.join(',')}) VALUES (${keys.map(() => '?').join(',')})`, vals);
    const row = await get('SELECT * FROM doctors WHERE id = ?', [result.lastID]);
    await sync();
    res.json(row);
  } catch(e) { next(e); }
});
router.put('/:id', async (req, res, next) => {
  try {
    const keys = Object.keys(req.body).filter(k => k !== 'id' && k !== 'created_at');
    const vals = keys.map(k => req.body[k]);
    await run(`UPDATE doctors SET ${keys.map(k => `${k}=?`).join(',')} WHERE id = ?`, [...vals, req.params.id]);
    const row = await get('SELECT * FROM doctors WHERE id = ?', [req.params.id]);
    await sync();
    res.json(row);
  } catch(e) { next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    await run('DELETE FROM doctors WHERE id = ?', [req.params.id]);
    await sync();
    res.json({ success: true });
  } catch(e) { next(e); }
});
module.exports = router;
