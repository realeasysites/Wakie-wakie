// Wakie Wakie's front end
(() => {
  // Real photos: map a slot / dish name to an image in /img. Anything not listed keeps its placeholder.
  const PHOTOS = {
    slots: {},
    dishes: {
      'Ocean Toast': '/img/ocean-toast.jpg',
      'Thai Milk Tea': '/img/thai-milk-tea.jpg',
      'Cottage Paradise': '/img/cottage-paradise.jpg',
      'Green Boost Smoothie': '/img/green-boost.jpg',
      'Summer Garden Smoothie': '/img/summer-garden.jpg',
    },
  };

  // Hours (0 = Sunday). null = closed.
  const HOURS = { 0: [7, 15], 1: null, 2: [7, 15], 3: [7, 15], 4: [7, 15], 5: [7, 15], 6: [7, 15] };
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const ORDER = [2, 3, 4, 5, 6, 0, 1];
  const fmt = (h) => (h === 12 ? '12pm' : h > 12 ? `${h - 12}pm` : `${h}am`);

  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- photos ----------
  function photo(el, src, alt) {
    if (!el || !src) return;
    el.innerHTML = `<img src="${src}" alt="${esc(alt || '')}" loading="lazy">`;
  }
  document.querySelectorAll('[data-slot]').forEach((f) => {
    const s = PHOTOS.slots[f.dataset.slot];
    if (s) photo(f, s.src || s, s.alt || f.textContent.trim());
  });

  // ---------- nav ----------
  const burger = $('#burger'), nav = $('#nav');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) { nav.classList.remove('open'); burger.setAttribute('aria-expanded', false); } });

  // ---------- hours + open status (Westbrook time) ----------
  function nowInMaine() {
    const p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
    const get = (t) => p.find((x) => x.type === t).value;
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    return { day, h: (Number(get('hour')) % 24) + Number(get('minute')) / 60 };
  }
  const { day, h } = nowInMaine();
  const today = HOURS[day];
  const st = $('#status'), stT = $('#statusText');
  if (today && h >= today[0] && h < today[1]) {
    st.classList.add('is-open'); stT.textContent = `Open now · until ${fmt(today[1])}`;
  } else {
    st.classList.add('is-closed');
    let d = day, label = '';
    for (let i = 0; i < 8; i++) {
      const hrs = HOURS[d];
      if (hrs && (i > 0 || h < hrs[0])) { label = `${i === 0 ? 'today' : i === 1 ? 'tomorrow' : DAYS[d]} at ${fmt(hrs[0])}`; break; }
      d = (d + 1) % 7;
    }
    stT.textContent = `Closed now · opens ${label}`;
  }
  $('#hoursBody').innerHTML = ORDER.map((d) => `<tr class="${d === day ? 'today' : ''}"><td>${DAYS[d]}</td><td>${HOURS[d] ? `${fmt(HOURS[d][0])} – ${fmt(HOURS[d][1])}` : 'Closed'}</td></tr>`).join('');
  $('#yr').textContent = new Date().getFullYear();

  // ---------- sleepy eyes wake up ----------
  const eyes = $('.eyes');
  if (eyes) setTimeout(() => eyes.classList.add('awake'), 900);

  // ---------- menu ----------
  let MENU = null, active = window.matchMedia('(max-width:620px)').matches ? 'Breakfast & Brunch' : 'All';
  const tabs = $('#tabs'), list = $('#menuList'), search = $('#menuSearch'), shelf = $('#shelf');

  const blurb = {
    'Crab Out Loud!': 'Thai crispy omelet', 'Kai Kra Ta': 'Thai skillet breakfast', 'Ocean Toast': 'Shrimp + tom yum',
    'Koi Sao (Khao Soi)': 'Northern Thai curry', 'Fluffy Blue': 'Maine blueberry', 'Aloha Jungle Bowl': 'Crowd favorite',
    'Thai Milk Tea': 'Iced & creamy', 'Cottage Paradise': 'Ricotta + maple',
    'Green Boost Smoothie': 'Bee pollen boost', 'Summer Garden Smoothie': 'Mango + passion fruit',
  };

  function renderShelf() {
    const all = MENU.categories.flatMap((c) => c.items);
    const order = ['Ocean Toast', 'Crab Out Loud!', 'Thai Milk Tea', 'Cottage Paradise', 'Kai Kra Ta', 'Green Boost Smoothie', 'Koi Sao (Khao Soi)', 'Summer Garden Smoothie'];
    const favs = order.map((n) => all.find((i) => i.name === n && i.fav)).filter(Boolean);
    shelf.innerHTML = favs.map((i) => {
      const src = PHOTOS.dishes[i.name];
      const tag = `<span class="dish__tag">${esc(blurb[i.name] || (i.thai ? 'Thai-inspired' : 'House favorite'))}</span>`;
      if (!src) {
        // No photo yet: a deliberate type-only card in the brand's hand-drawn style
        return `<article class="dish dish--type">${tag}<img class="dish__doodle" src="/img/star-doodle.png" alt="" loading="lazy">
          <h3>${esc(i.name)}</h3><p>${esc(i.desc)}</p><span class="dish__price">$${esc(i.price)}</span></article>`;
      }
      return `<article class="dish"><div class="dish__img"><img src="${src}" alt="${esc(i.name)}" loading="lazy">${tag}</div>
        <div class="dish__body"><h3>${esc(i.name)} <span>$${esc(i.price)}</span></h3><p>${esc(i.desc)}</p></div></article>`;
    }).join('');
  }

  function renderTabs() {
    const names = ['All', ...MENU.categories.map((c) => c.name)];
    tabs.innerHTML = names.map((n) => `<button class="tab" role="tab" aria-selected="${n === active}" data-cat="${esc(n)}">${esc(n)}</button>`).join('');
  }
  tabs.addEventListener('click', (e) => {
    const b = e.target.closest('.tab'); if (!b) return;
    active = b.dataset.cat; renderTabs(); renderMenu();
  });

  function hl(text, q) {
    const safe = esc(text);
    if (!q) return safe;
    const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
    return safe.replace(re, '<mark>$1</mark>');
  }
  function renderMenu() {
    const q = search.value.trim().toLowerCase();
    const cats = MENU.categories.filter((c) => active === 'All' || c.name === active || q);
    const html = cats.map((c) => {
      const items = c.items.filter((i) => !q || (i.name + ' ' + i.desc).toLowerCase().includes(q));
      if (!items.length) return '';
      return `<section class="menu__cat"><h3>${esc(c.name)}</h3>${items.map((i) => `
        <div class="mi"><div class="mi__top"><span class="mi__name">${hl(i.name, q)}${i.thai ? '<span class="thai" title="Thai-inspired">✦</span>' : ''}</span><span class="mi__dots"></span><span class="mi__price">$${esc(i.price)}</span></div>
        ${i.desc ? `<p class="mi__desc">${hl(i.desc, q)}</p>` : ''}</div>`).join('')}</section>`;
    }).join('');
    list.innerHTML = html || `<p class="menu__empty">Nothing matches “${esc(q)}” — but ask us, we might make it anyway.</p>`;
  }
  search.addEventListener('input', renderMenu);

  fetch('/api/menu').then((r) => r.json()).then((m) => { MENU = m; renderShelf(); renderTabs(); renderMenu(); })
    .catch(() => { list.innerHTML = '<p class="menu__empty">Menu didn’t load — see it on our <a href="https://wakiewakies.square.site/">order page</a>.</p>'; });

  // drag-to-scroll shelf on desktop
  let down = false, sx = 0, sl = 0;
  shelf.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = shelf.scrollLeft; shelf.style.cursor = 'grabbing'; });
  window.addEventListener('pointerup', () => { down = false; shelf.style.cursor = ''; });
  shelf.addEventListener('pointermove', (e) => { if (down) shelf.scrollLeft = sl - (e.clientX - sx); });

  // ---------- contact form ----------
  const form = $('#helloForm'), msg = $('#formMsg'), reason = $('#reason');
  const syncReason = () => form.classList.toggle('is-group', /Group|Event/.test(reason.value));
  reason.addEventListener('change', syncReason); syncReason();
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    msg.className = 'form__msg';
    if (!data.name.trim()) { msg.textContent = 'Please add your name.'; msg.classList.add('err'); return; }
    if (!data.phone.trim() && !data.email.trim()) { msg.textContent = 'Add a phone or email so we can reply.'; msg.classList.add('err'); return; }
    const btn = form.querySelector('button'); btn.disabled = true; msg.textContent = 'Sending…';
    try {
      const r = await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Something went wrong.');
      form.reset(); syncReason();
      msg.textContent = 'Got it! We’ll be in touch soon ✦'; msg.classList.add('ok');
    } catch (err) {
      msg.textContent = `${err.message} You can also call 207-591-0090.`; msg.classList.add('err');
    } finally { btn.disabled = false; }
  });

  // ---------- reveal on scroll ----------
  const els = document.querySelectorAll('.favs__head, .menu__head, .story__copy, .press, .social, .strip, .visit__grid, .hello__grid');
  els.forEach((el) => el.classList.add('reveal'));
  const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: 0.12 });
  els.forEach((el) => io.observe(el));
})();
