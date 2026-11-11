// Moon theme: parallax star field + "to the moon" altitude tracker
(() => {
  const sky = document.querySelector('.sky'), alt = document.querySelector('.alt'), cow = document.querySelector('.alt__cow');
  const story = document.getElementById('story');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let ticking = false;
  function update() {
    ticking = false;
    const y = window.scrollY;
    if (sky && !reduce) sky.style.backgroundPosition = `0 ${-y * 0.18}px, 220px ${-y * 0.32}px`;
    if (alt && story) {
      const target = story.offsetTop + story.offsetHeight * 0.3 - window.innerHeight;
      const p = Math.max(0, Math.min(1, y / Math.max(1, target)));
      alt.style.setProperty('--p', p.toFixed(3));
      alt.classList.toggle('arrived', p >= 0.999);
      alt.classList.toggle('show', y > 400);
    }
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
