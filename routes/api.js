const path = require('path');
const fs = require('fs');
const express = require('express');
const db = require('../db');
const { notify } = require('../lib/mailer');

const router = express.Router();
const MENU = path.join(__dirname, '..', 'data', 'menu.json');
const REASONS = ['Group or large order', 'Event / catering question', 'General question', 'Feedback'];

router.get('/menu', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300');
  res.type('json').send(fs.readFileSync(MENU, 'utf8'));
});

// Simple in-memory rate limit: 5 messages / 10 min per IP.
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 600000);
  arr.push(now); hits.set(ip, arr);
  return arr.length > 5;
}
const clean = (v, max = 200) => String(v || '').trim().slice(0, max);

router.post('/messages', (req, res) => {
  const b = req.body || {};
  if (b.website) return res.json({ ok: true }); // honeypot
  if (limited(req.ip)) return res.status(429).json({ error: 'Too many messages — please call us instead.' });
  const msg = {
    reason: REASONS.includes(b.reason) ? b.reason : 'General question',
    name: clean(b.name, 100), phone: clean(b.phone, 40), email: clean(b.email, 120),
    event_date: clean(b.event_date, 40), headcount: clean(b.headcount, 20), message: clean(b.message, 2000),
  };
  if (!msg.name) return res.status(400).json({ error: 'Please add your name.' });
  if (!msg.phone && !msg.email) return res.status(400).json({ error: 'Add a phone number or email so we can reply.' });
  db.prepare(`INSERT INTO messages (reason,name,phone,email,event_date,headcount,message)
              VALUES (@reason,@name,@phone,@email,@event_date,@headcount,@message)`).run(msg);
  notify(msg);
  res.json({ ok: true });
});

module.exports = router;
