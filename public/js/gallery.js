(() => {
  const grid = document.getElementById('gallery'), filters = document.getElementById('gfilters');
  const burger = document.getElementById('burger'), nav = document.getElementById('nav');
  burger.addEventListener('click', () => { const o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o); });
  document.getElementById('yr').textContent = new Date().getFullYear();
  const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let ALL = [], active = 'All';
  function render() {
    const shown = ALL.filter((p) => active === 'All' || p.cat === active);
    grid.innerHTML = shown.map((p, n) => `<button class="g ${p.art ? 'g--art' : ''}" data-i="${n}" aria-label="Open ${esc(p.caption)}">
      <img src="${esc(p.src)}" alt="${esc(p.alt)}" loading="lazy"><span class="g__cap">${esc(p.caption)}</span></button>`).join('');
    grid.onclick = (e) => { const b = e.target.closest('.g'); if (b) WWLightbox.open(shown, Number(b.dataset.i)); };
  }
  fetch('/gallery.json').then((r) => r.json()).then((list) => {
    ALL = list;
    const cats = ['All', ...new Set(list.map((p) => p.cat))];
    filters.innerHTML = cats.map((c) => `<button class="tab" role="tab" aria-selected="${c === active}" data-c="${esc(c)}">${esc(c)}</button>`).join('');
    filters.onclick = (e) => { const b = e.target.closest('.tab'); if (!b) return; active = b.dataset.c;
      filters.querySelectorAll('.tab').forEach((t) => t.setAttribute('aria-selected', t.dataset.c === active)); render(); };
    render();
  });
})();
