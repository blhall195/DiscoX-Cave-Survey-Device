/* DiscoX language switcher — drives the Google Translate widget behind the
   EN/FR/DE/ES/IT buttons in the footer. English is the source; selecting
   another language sets the googtrans cookie and reloads the page.
*/
(function () {
  var LANGS = ['fr', 'de', 'es', 'it'];

  function injectStyle() {
    if (document.getElementById('gt-style')) return;
    var s = document.createElement('style');
    s.id = 'gt-style';
    s.textContent =
      'body { top: 0 !important; }' +
      '.goog-te-banner-frame, .goog-te-banner-frame.skiptranslate { display: none !important; }' +
      'iframe.goog-te-banner-frame { display: none !important; }' +
      '#google_translate_element { display: none !important; }' +
      '.goog-tooltip, .goog-tooltip:hover { background: transparent !important; box-shadow: none !important; border: none !important; }' +
      '.goog-text-highlight { background: transparent !important; box-shadow: none !important; }';
    document.head.appendChild(s);
  }

  function ensureHost() {
    var host = document.getElementById('google_translate_element');
    if (!host) {
      host = document.createElement('div');
      host.id = 'google_translate_element';
      document.body.appendChild(host);
    }
    return host;
  }

  function loadGoogleTranslate() {
    if (window.__gtLoading || (window.google && window.google.translate)) return;
    window.__gtLoading = true;
    window.googleTranslateElementInit = function () {
      new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: LANGS.join(','),
        autoDisplay: false,
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE
      }, 'google_translate_element');
    };
    var s = document.createElement('script');
    s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    s.async = true;
    document.head.appendChild(s);
  }

  function currentLang() {
    var m = document.cookie.match(/(?:^|;\s*)googtrans=\/[^\/]+\/([a-z\-]+)/);
    return m ? m[1] : 'en';
  }

  function setCookie(name, value, domain) {
    var base = name + '=' + value + '; path=/';
    if (domain) base += '; domain=' + domain;
    document.cookie = base;
  }

  function clearCookie(name, domain) {
    var expired = '; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = name + '=; path=/' + expired;
    if (domain) document.cookie = name + '=; path=/; domain=' + domain + expired;
  }

  function setLang(lang) {
    var host = location.hostname;
    var parent = host.split('.').slice(-2).join('.');
    if (lang === 'en') {
      clearCookie('googtrans');
      clearCookie('googtrans', host);
      clearCookie('googtrans', '.' + host);
      if (parent && parent !== host) clearCookie('googtrans', '.' + parent);
    } else {
      var v = '/en/' + lang;
      setCookie('googtrans', v);
      setCookie('googtrans', v, host);
      setCookie('googtrans', v, '.' + host);
      if (parent && parent !== host) setCookie('googtrans', v, '.' + parent);
    }
    location.reload();
  }

  function highlightActive(buttons) {
    var cur = currentLang();
    buttons.forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-lang') === cur);
    });
  }

  function killBanner() {
    if (document.body && document.body.style.top) document.body.style.top = '';
    var frame = document.querySelector('iframe.goog-te-banner-frame');
    if (frame && frame.parentNode) frame.parentNode.removeChild(frame);
    var box = document.querySelector('.goog-te-banner-frame');
    if (box && box.parentNode) box.parentNode.removeChild(box);
  }

  function watchBanner() {
    killBanner();
    var mo = new MutationObserver(killBanner);
    mo.observe(document.documentElement, {
      childList: true, subtree: true,
      attributes: true, attributeFilter: ['style', 'class']
    });
    setInterval(killBanner, 400);
  }

  function init() {
    injectStyle();
    ensureHost();
    watchBanner();
    var buttons = Array.prototype.slice.call(
      document.querySelectorAll('.i18n-switch [data-lang]')
    );
    if (!buttons.length) return;
    highlightActive(buttons);
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        setLang(b.getAttribute('data-lang'));
      });
    });
    loadGoogleTranslate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
