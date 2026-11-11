// Tiny shared lightbox: WWLightbox.open([{src, alt, caption}], startIndex)
(() => {
  let list = [], i = 0, box;
  const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function build() {
    box = document.createElement('div');
    box.className = 'lb'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.hidden = true;
    box.innerHTML = `<button class="lb__x" aria-label="Close">×</button><button class="lb__nav lb__prev" aria-label="Previous">‹</button>
      <figure class="lb__fig"><img alt=""><figcaption></figcaption></figure><button class="lb__nav lb__next" aria-label="Next">›</button>`;
    document.body.appendChild(box);
    box.addEventListener('click', (e) => {
      if (e.target === box || e.target.closest('.lb__x')) close();
      else if (e.target.closest('.lb__prev')) go(-1);
      else if (e.target.closest('.lb__next')) go(1);
    });
    document.addEventListener('keydown', (e) => {
      if (box.hidden) return;
      if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') go(-1); if (e.key === 'ArrowRight') go(1);
    });
    let sx = null;
    box.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', (e) => { if (sx === null) return; const d = e.changedTouches[0].clientX - sx; if (Math.abs(d) > 50) go(d < 0 ? 1 : -1); sx = null; });
  }
  function show() {
    const it = list[i], img = box.querySelector('img');
    img.src = it.src; img.alt = it.alt || it.caption || '';
    box.querySelector('figcaption').innerHTML = esc(it.caption);
    box.querySelectorAll('.lb__nav').forEach((b) => (b.hidden = list.length < 2));
  }
  function go(d) { i = (i + d + list.length) % list.length; show(); }
  function close() { box.hidden = true; document.body.style.overflow = ''; }
  window.WWLightbox = {
    open(items, start = 0) {
      if (!box) build();
      list = items; i = start; show(); box.hidden = false; document.body.style.overflow = 'hidden';
      box.querySelector('.lb__x').focus();
    },
  };
})();
