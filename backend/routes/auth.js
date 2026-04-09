const express = require('express');
const router = express.Router();
const { get } = require('../config/database');

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    const user = await get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
    if (user) {
      delete user.password;
      res.json(user);
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch(e) { next(e); }
});

module.exports = router;
