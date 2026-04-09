const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { run, get, all } = require('../config/database');

const JSON_PATH = path.join(__dirname, '..', '..', 'database', 'JSON', 'passwords.json');

// Helper to sync JSON file
async function syncJSON() {
  try {
    const users = await all('SELECT * FROM users');
    const data = { users };
    fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error syncing passwords.json:', err);
  }
}

router.get('/', async (req, res, next) => {
  try { res.json(await all('SELECT * FROM users ORDER BY id')); }
  catch(e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { username, password, role, doctor_id } = req.body;
    const result = await run(
      'INSERT INTO users (username, password, role, doctor_id) VALUES (?, ?, ?, ?)',
      [username, password, role || 'user', doctor_id || null]
    );
    await syncJSON();
    res.json(await get('SELECT * FROM users WHERE id = ?', [result.lastID]));
  } catch(e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const keys = Object.keys(req.body).filter(k => k !== 'id');
    const vals = keys.map(k => req.body[k]);
    await run(
      `UPDATE users SET ${keys.map(k => `${k}=?`).join(',')} WHERE id = ?`,
      [...vals, req.params.id]
    );
    await syncJSON();
    res.json(await get('SELECT * FROM users WHERE id = ?', [req.params.id]));
  } catch(e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await run('DELETE FROM users WHERE id = ?', [req.params.id]);
    await syncJSON();
    res.json({ success: true });
  } catch(e) { next(e); }
});

module.exports = router;
