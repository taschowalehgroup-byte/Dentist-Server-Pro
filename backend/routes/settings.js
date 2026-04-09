const express = require('express');
const router  = express.Router();
const fs      = require('fs');
const path    = require('path');

const SETTINGS_FILE = path.join(__dirname, '..', '..', 'database', 'JSON', 'settings.json');
const DOCTORS_FILE  = path.join(__dirname, '..', '..', 'database', 'JSON', 'doctors.json');

const defaultSettings = {
  clinic: {
    name:      'DentCare Pro',
    address:   '',
    phone:     '',
    email:     '',
    logo:      '',       // base64 data-url
    currency:  'EGP',
    timezone:  'Africa/Cairo'
  },
  appearance: {
    theme:         'dark',
    accentColor:   '#00d4ff',
    language:      'en',
    dateFormat:    'YYYY-MM-DD',
    timeFormat:    '24h'
  },
  notifications: {
    appointmentReminders: true,
    lowStockAlerts:       true,
    passwordRequests:     true
  },
  system: {
    autoBackup:     true,
    backupFormat:   'json',
    sessionTimeout: 60
  },
  doctors: []   // [{id, photo: 'data:image/...'}]
};

function load() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    }
  } catch(e) {}
  return JSON.parse(JSON.stringify(defaultSettings));
}

function save(data) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// GET settings
router.get('/', (req, res) => res.json(load()));

// PUT merge
router.put('/', (req, res) => {
  try {
    const current = load();
    const updated = { ...current };
    for (const section of Object.keys(req.body)) {
      if (section === 'doctors') {
        // doctors is array — replace entirely
        updated.doctors = req.body.doctors;
      } else {
        updated[section] = { ...(current[section] || {}), ...req.body[section] };
      }
    }
    save(updated);
    res.json(updated);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// POST reset
router.post('/reset', (req, res) => {
  const d = JSON.parse(JSON.stringify(defaultSettings));
  save(d);
  res.json(d);
});

module.exports = router;
