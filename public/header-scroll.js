// Adjust the fixed header background as the visitor scrolls down the page.
(() => {
  const header = document.querySelector('.site-header');
  const headerSurface = header?.querySelector('.header-inner');
  if (!header || !headerSurface) return;

  let framePending = false;
  const updateHeader = () => {
    framePending = false;
    const progress = Math.min(Math.max(window.scrollY, 0) / 160, 1);
    header.classList.toggle('is-compact', window.scrollY > 24);
    header.style.setProperty('--header-opacity', String((0.68 + progress * 0.29).toFixed(3)));
    header.style.setProperty('--header-light-opacity', String((0.78 + progress * 0.2).toFixed(3)));
  };
  const scheduleUpdate = () => {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(updateHeader);
  };

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate, { passive: true });
  updateHeader();
})();
