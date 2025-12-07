import './auth.js';
import { setupModal } from './modal.js';
import { setupTeamModal } from './team-modal.js';
import './mobile-nav.js';
import './theme-toggle.js';

const addGoogleScript = () => {
  if (document.querySelector('script[src*="translate.google.com"]')) return;
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src =
    '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  document.body.appendChild(script);
};

window.googleTranslateElementInit = function () {
  const langs = [...document.querySelectorAll('.lang-opt')].map(
    (el) => el.dataset.val,
  );

  new google.translate.TranslateElement(
    {
      pageLanguage: 'en',
      includedLanguages: langs.join(','),
      autoDisplay: false,
    },
    'google_translate_element',
  );
};

function changeLanguage(langCode) {
  const cookieValue = `/auto/${langCode}`;
  document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`;
  document.cookie = `googtrans=${cookieValue}; path=/;`;
  window.location.reload();
}

addGoogleScript();

document.addEventListener('DOMContentLoaded', () => {
  const { openModal } = setupModal();
  window.openMovieModal = openModal;
  setupTeamModal();

  const path = window.location.pathname;
  let moduleName = null;

  if (path.includes('catalog.html')) {
    moduleName = 'catalog.js';
  } else if (path.includes('my-library.html')) {
    moduleName = 'my-library.js';
  } else if (path === '/' || path.endsWith('index.html')) {
    moduleName = 'index.js';
  }

  if (moduleName) {
    import(`./${moduleName}`).catch((err) => console.error(err));
  }

  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach((link) => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (
      (path === '/' || path.includes('index.html')) &&
      href.includes('index.html')
    )
      link.classList.add('active');
    else if (path.includes('catalog') && href.includes('catalog'))
      link.classList.add('active');
    else if (path.includes('library') && href.includes('library'))
      link.classList.add('active');
  });
});

document.addEventListener('click', (e) => {
  const accountBtn = e.target.closest('#btn-account');
  if (accountBtn) {
    e.preventDefault();
    e.stopPropagation();
    const dropdown = document.getElementById('account-dropdown');
    if (dropdown) dropdown.classList.toggle('show');
    return;
  }

  const langBtn = e.target.closest('#btn-languages');
  if (langBtn) {
    e.preventDefault();
    e.stopPropagation();
    const langList = document.getElementById('languages-list');

    if (langList) langList.classList.toggle('show');
    langBtn.classList.toggle('open');
    return;
  }

  const langOpt = e.target.closest('.lang-opt');
  if (langOpt) {
    e.preventDefault();
    const selectedLang = langOpt.getAttribute('data-val');
    changeLanguage(selectedLang);
    return;
  }

  const dropdown = document.getElementById('account-dropdown');
  const langList = document.getElementById('languages-list');
  const langBtnRef = document.getElementById('btn-languages');

  if (dropdown && dropdown.classList.contains('show')) {
    if (!e.target.closest('#account-dropdown')) {
      dropdown.classList.remove('show');
      if (langList) langList.classList.remove('show');
      if (langBtnRef) langBtnRef.classList.remove('open');
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const langItems = document.querySelectorAll('.lang-opt');

  langItems.forEach((item) => {
    if (item.querySelector('.lang-icon')) return;

    const icon = document.createElement('i');
    icon.classList.add('fas', 'fa-language', 'lang-icon');

    item.prepend(icon);
  });
});
