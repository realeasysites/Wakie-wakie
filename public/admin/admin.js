const app = document.getElementById('app');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let filter = 'all';

function loginView(err = '') {
  app.innerHTML = `<form class="login" id="lf"><h2>Wakie Wakie's</h2><p>Enter the dashboard password.</p>
    <input type="password" id="pw" placeholder="Password" autocomplete="current-password" autofocus>
    <button class="btn">Sign in</button><p class="err">${esc(err)}</p></form>`;
  document.getElementById('lf').onsubmit = async (e) => {
    e.preventDefault();
    const r = await fetch('/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: document.getElementById('pw').value }) });
    const j = await r.json().catch(() => ({}));
    r.ok ? load() : loginView(j.error || 'Could not sign in.');
  };
}

async function load() {
  const r = await fetch('/admin/api/messages');
  if (r.status === 401) return loginView();
  render(await r.json());
}

function render(rows) {
  const counts = { all: rows.length, new: 0, contacted: 0, done: 0 };
  rows.forEach((m) => counts[m.status]++);
  const shown = rows.filter((m) => filter === 'all' || m.status === filter);
  app.innerHTML = `<header><h1>Wakie Wakie's · Messages</h1><button class="btn btn--ghost" id="out">Sign out</button></header>
  <div class="wrap"><div class="filters">${['all', 'new', 'contacted', 'done'].map((f) => `<button data-f="${f}" class="${f === filter ? 'on' : ''}">${f} (${counts[f]})</button>`).join('')}</div>
  ${shown.length ? shown.map((m) => `<div class="card ${m.status}">
    <div class="row"><h3>${esc(m.name)}</h3><span class="meta">· ${esc(m.reason)}</span></div>
    <div class="meta">${esc(new Date(m.created_at + 'Z').toLocaleString())}
      ${m.phone ? ` · <a href="tel:${esc(m.phone)}">${esc(m.phone)}</a>` : ''}${m.email ? ` · <a href="mailto:${esc(m.email)}">${esc(m.email)}</a>` : ''}
      ${m.event_date ? ` · Date: ${esc(m.event_date)}` : ''}${m.headcount ? ` · ${esc(m.headcount)} people` : ''}</div>
    ${m.message ? `<p>${esc(m.message)}</p>` : ''}
    <div class="row"><select data-id="${m.id}">${['new', 'contacted', 'done'].map((s) => `<option ${s === m.status ? 'selected' : ''}>${s}</option>`).join('')}</select>
    <button class="del" data-del="${m.id}">Delete</button></div></div>`).join('') : '<p class="empty">No messages here yet.</p>'}</div>`;
  document.getElementById('out').onclick = async () => { await fetch('/admin/logout', { method: 'POST' }); loginView(); };
  app.querySelectorAll('[data-f]').forEach((b) => (b.onclick = () => { filter = b.dataset.f; render(rows); }));
  app.querySelectorAll('select[data-id]').forEach((s) => (s.onchange = async () => {
    await fetch(`/admin/api/messages/${s.dataset.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: s.value }) });
    load();
  }));
  app.querySelectorAll('[data-del]').forEach((b) => (b.onclick = async () => {
    if (!confirm('Delete this message for good?')) return;
    await fetch(`/admin/api/messages/${b.dataset.del}`, { method: 'DELETE' });
    load();
  }));
}
load();
