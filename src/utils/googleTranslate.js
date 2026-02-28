const TRANSLATE_COOKIE_NAME = 'googtrans';
const TRANSLATE_SCRIPT_SELECTOR = 'script[data-google-translate="true"]';
const TRANSLATE_CALLBACK = '__cinemaniaGoogleTranslateInit';

let translateScriptPromise = null;

function ensureTranslateContainer() {
  let container = document.getElementById('google_translate_element');

  if (!container) {
    container = document.createElement('div');
    container.id = 'google_translate_element';
    container.setAttribute('aria-hidden', 'true');
    container.style.display = 'none';
    document.body.appendChild(container);
  }

  return container;
}

export function getGoogleTranslateCookieLanguage() {
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${TRANSLATE_COOKIE_NAME}=([^;]+)`),
  );

  if (!match?.[1]) return '';

  const decoded = decodeURIComponent(match[1]);
  const parts = decoded.split('/').filter(Boolean);
  return (parts[parts.length - 1] || '').toLowerCase();
}

export function setGoogleTranslateCookie(langCode) {
  const cookieValue = `/auto/${langCode}`;
  document.cookie = `${TRANSLATE_COOKIE_NAME}=${cookieValue}; path=/; domain=${window.location.hostname}`;
  document.cookie = `${TRANSLATE_COOKIE_NAME}=${cookieValue}; path=/;`;
}

export async function loadGoogleTranslateScript() {
  if (window.google?.translate?.TranslateElement) return;
  if (translateScriptPromise) return translateScriptPromise;

  translateScriptPromise = new Promise((resolve, reject) => {
    ensureTranslateContainer();

    window[TRANSLATE_CALLBACK] = function () {
      try {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            autoDisplay: false,
          },
          'google_translate_element',
        );

        resolve();
      } catch (error) {
        reject(error);
      } finally {
        delete window[TRANSLATE_CALLBACK];
      }
    };

    const existingScript = document.querySelector(TRANSLATE_SCRIPT_SELECTOR);
    if (existingScript) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.defer = true;
    script.setAttribute('data-google-translate', 'true');
    script.src = `https://translate.google.com/translate_a/element.js?cb=${TRANSLATE_CALLBACK}`;
    script.onerror = (error) => {
      translateScriptPromise = null;
      delete window[TRANSLATE_CALLBACK];
      reject(error);
    };

    document.body.appendChild(script);
  });

  return translateScriptPromise;
}
