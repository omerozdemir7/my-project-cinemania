document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.main-nav');
  const logo = document.querySelector('.logo');
  const openBtn = document.querySelector('.mobile-menu-btn');
  let overlay = null;

  if (!nav || !logo) return;

  const isMobile = () => window.innerWidth <= 768;

  function openNav(e) {
    if (!isMobile()) return;
    if (e) e.preventDefault();

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'mobile-overlay';
      overlay.addEventListener('click', closeNav);
      document.body.appendChild(overlay);
    }

    nav.classList.add('is-open');
    document.body.classList.add('menu-open');
  }

  function closeNav() {
    nav.classList.remove('is-open');
    document.body.classList.remove('menu-open');

    if (overlay) {
      overlay.removeEventListener('click', closeNav);
      overlay.remove();
      overlay = null;
    }
  }

  let closeBtn = nav.querySelector('.mobile-nav-close');
  if (!closeBtn) {
    closeBtn = document.createElement('button');
    closeBtn.type = 'button';

    closeBtn.className = 'mobile-nav-close';
    closeBtn.innerHTML = '&times;';
    nav.appendChild(closeBtn);
  }
  closeBtn.addEventListener('click', closeNav);

  logo.addEventListener('click', openNav);

  if (openBtn) {
    openBtn.addEventListener('click', openNav);
  }

  nav.querySelectorAll('a.nav-link').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  window.addEventListener('resize', () => {
    if (!isMobile()) {
      closeNav();
    }
  });
});
