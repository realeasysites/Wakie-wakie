const path = require('path');
const express = require('express');
const db = require('../db');
const { COOKIE, makeToken, checkPassword, requireAdmin } = require('../lib/auth');

const router = express.Router();
const STATUSES = ['new', 'contacted', 'done'];

router.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'admin', 'index.html')));
router.get('/admin.js', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'admin', 'admin.js')));

router.post('/login', express.json(), (req, res) => {
  if (!process.env.ADMIN_PASSWORD) return res.status(503).json({ error: 'Login is disabled until ADMIN_PASSWORD is set.' });
  if (!checkPassword((req.body || {}).password)) return res.status(401).json({ error: 'Wrong password.' });
  res.cookie(COOKIE, makeToken(), { httpOnly: true, sameSite: 'lax', secure: req.secure, maxAge: 1000 * 60 * 60 * 12 });
  res.json({ ok: true });
});
router.post('/logout', (req, res) => { res.clearCookie(COOKIE); res.json({ ok: true }); });

router.get('/api/messages', requireAdmin, (req, res) => {
  res.json(db.prepare('SELECT * FROM messages ORDER BY id DESC').all());
});
router.patch('/api/messages/:id', requireAdmin, (req, res) => {
  const status = (req.body || {}).status;
  if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Bad status' });
  db.prepare('UPDATE messages SET status=? WHERE id=?').run(status, Number(req.params.id));
  res.json({ ok: true });
});
router.delete('/api/messages/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM messages WHERE id=?').run(Number(req.params.id));
  res.json({ ok: true });
});

module.exports = router;
