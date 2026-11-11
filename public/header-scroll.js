// Adjust the fixed header background as the visitor scrolls down the page.
(() => {
  const header = document.querySelector('.site-header');
  const headerSurface = header?.querySelector('.header-inner');
  if (!header || !headerSurface) return;

  let framePending = false;
  const updateHeader = () => {
    framePending = false;
    header.classList.toggle('is-compact', window.scrollY > 24);
    // Keep the scroll state fixed; it must not become darker as the page continues scrolling.
    header.style.setProperty('--header-opacity', '0.25');
    header.style.setProperty('--header-light-opacity', '0.25');
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
