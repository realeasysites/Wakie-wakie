// Password-only admin login. Set ADMIN_PASSWORD (required) and SESSION_SECRET (optional) in Render.
const crypto = require('crypto');

const COOKIE = 'ww_admin';
const secret = () => process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || '';

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}
function sign(value) {
  return crypto.createHmac('sha256', secret()).update(value).digest('hex');
}
function makeToken() {
  const exp = String(Date.now() + 1000 * 60 * 60 * 12); // 12h
  return `${exp}.${sign(exp)}`;
}
function validToken(token) {
  if (!token || !secret()) return false;
  const [exp, sig] = String(token).split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return safeEqual(sig, sign(exp));
}
function checkPassword(pw) {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return false; // login disabled until ADMIN_PASSWORD is set
  return safeEqual(pw || '', real);
}
function requireAdmin(req, res, next) {
  if (validToken(req.cookies[COOKIE])) return next();
  return res.status(401).json({ error: 'Not signed in' });
}
module.exports = { COOKIE, makeToken, validToken, checkPassword, requireAdmin };
