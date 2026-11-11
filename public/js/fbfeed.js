// Live Facebook feed via the official Page Plugin. Re-sizes to its container (plugin max width is 500px).
(() => {
  const PAGE = 'https://www.facebook.com/profile.php?id=61574930262556';
  document.querySelectorAll('[data-fb-feed]').forEach((box) => {
    let last = 0;
    const render = () => {
      const w = Math.max(280, Math.min(500, Math.floor(box.clientWidth)));
      if (w === last) return; last = w;
      const h = Number(box.dataset.height || 640);
      const q = new URLSearchParams({ href: PAGE, tabs: 'timeline', width: w, height: h, small_header: 'false', adapt_container_width: 'true', hide_cover: 'false', show_facepile: 'false' });
      box.innerHTML = `<iframe title="Wakie Wakie's latest Facebook posts" src="https://www.facebook.com/plugins/page.php?${q}" width="${w}" height="${h}" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" loading="lazy"></iframe>`;
    };
    render();
    let t; window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(render, 250); });
  });
})();
