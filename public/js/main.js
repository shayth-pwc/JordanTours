(() => {
  if (window.lucide) window.lucide.createIcons({ attrs: { 'stroke-width': 1.5 } });
  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');
  const setHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 24 || !document.body.classList.contains('page-home'));
  setHeader();
  window.addEventListener('scroll', setHeader, { passive: true });

  function closeMenu(returnFocus = false) {
    if (!menuButton || !nav) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation menu');
    nav.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    if (returnFocus) menuButton.focus();
  }
  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  });
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(true); });

  document.querySelectorAll('.accordion-item button').forEach((button) => {
    button.addEventListener('click', () => {
      const panel = document.getElementById(button.getAttribute('aria-controls'));
      const open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
    });
  });

  document.querySelectorAll('.js-prefill').forEach((link) => link.addEventListener('click', () => {
    const form = document.querySelector('[data-contact-form]');
    if (!form) return;
    const service = form.elements.service;
    const destination = form.elements.destination;
    if (link.dataset.service && [...service.options].some((option) => option.value === link.dataset.service)) service.value = link.dataset.service;
    if (link.dataset.destination) destination.value = link.dataset.destination;
    window.setTimeout(() => service.focus({ preventScroll: true }), 500);
  }));

  document.querySelectorAll('[data-year]').forEach((node) => { node.textContent = new Date().getFullYear(); });
})();
