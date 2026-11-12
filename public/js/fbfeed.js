// Live Facebook feed via the official Page Plugin (JS SDK).
// Uses data-show-posts="true" — the iframe "timeline" tab no longer returns posts for this page.
(() => {
  const PAGE = 'https://www.facebook.com/profile.php?id=61574930262556';
  const boxes = [...document.querySelectorAll('[data-fb-feed]')];
  if (!boxes.length) return;
  let lastW = 0;
  function build() {
    boxes.forEach((box) => {
      const w = Math.max(280, Math.min(500, Math.floor(box.clientWidth)));
      const h = Number(box.dataset.height || 680);
      lastW = w;
      box.innerHTML = `<div class="fb-page" data-href="${PAGE}" data-show-posts="true" data-width="${w}" data-height="${h}"
        data-small-header="false" data-adapt-container-width="true" data-hide-cover="false" data-show-facepile="false">
        <blockquote cite="${PAGE}" class="fb-xfbml-parse-ignore"><a href="${PAGE}">See our latest posts on Facebook</a></blockquote></div>`;
    });
    if (window.FB && FB.XFBML) FB.XFBML.parse();
  }
  build();
  // Load the SDK only when the feed is near the screen
  const io = new IntersectionObserver((ents) => {
    if (!ents.some((e) => e.isIntersecting)) return;
    io.disconnect();
    if (!document.getElementById('fb-root')) { const r = document.createElement('div'); r.id = 'fb-root'; document.body.prepend(r); }
    const s = document.createElement('script');
    s.async = true; s.defer = true; s.crossOrigin = 'anonymous';
    s.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v21.0';
    document.body.appendChild(s);
  }, { rootMargin: '600px' });
  boxes.forEach((b) => io.observe(b));
  let t;
  window.addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(() => { const w = Math.min(500, Math.floor(boxes[0].clientWidth)); if (Math.abs(w - lastW) > 40) build(); }, 300);
  });
})();
