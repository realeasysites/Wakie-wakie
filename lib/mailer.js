// Optional email alerts for new messages. Needs SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and NOTIFY_EMAIL.
const nodemailer = require('nodemailer');

let transport = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function notify(msg) {
  if (!transport || !process.env.NOTIFY_EMAIL) return;
  const lines = [
    `Reason: ${msg.reason}`, `Name: ${msg.name}`, `Phone: ${msg.phone || '-'}`, `Email: ${msg.email || '-'}`,
    msg.event_date ? `Date: ${msg.event_date}` : '', msg.headcount ? `Headcount: ${msg.headcount}` : '',
    '', msg.message || '',
  ].filter((l) => l !== null);
  try {
    await transport.sendMail({
      from: `"Wakie Wakie's Website" <${process.env.SMTP_USER}>`,
      to: process.env.NOTIFY_EMAIL,
      replyTo: msg.email || undefined,
      subject: `New website message: ${msg.reason} — ${msg.name}`,
      text: lines.join('\n'),
    });
  } catch (e) { console.error('Mail failed:', e.message); }
}
module.exports = { notify };
