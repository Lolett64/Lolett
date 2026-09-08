// Public pageviews only. The filter remains active across client-side navigation.
(function () {
  var domains = 'lolettshop.com,www.lolettshop.com'.split(',');
  if (domains.indexOf(window.location.hostname) === -1) return;
  if (document.getElementById('umami-tracker')) return;

  window.umamiBeforeSend = function (type, payload) {
    if (type !== 'event' || payload.name) return false;
    try {
      var consent = document.cookie.match(/(?:^|; )lolett-consent=([^;]*)/);
      if (!consent || JSON.parse(decodeURIComponent(consent[1])).analytics !== true) return false;
    } catch {
      return false;
    }
    var publicRoute = /^\/(?:shop(?:\/(?:homme|femme)(?:\/[^/]+)?)?|produit\/[^/]+|looks(?:\/[^/]+)?|nouveautes|notre-histoire|contact|livraison|mentions-legales|cgv|confidentialite|politique-cookies|cartes-cadeaux(?:\/\d+)?)?\/?$/;
    if (!publicRoute.test(window.location.pathname)) return false;
    var url;
    try {
      url = new URL(payload.url, window.location.origin);
    } catch {
      return false;
    }
    if (url.origin !== window.location.origin || !publicRoute.test(url.pathname)) return false;
    var referrer = '';
    try {
      referrer = payload.referrer ? new URL(payload.referrer).origin : '';
    } catch {
      referrer = '';
    }
    // No query, fragment, form data, user identifier or arbitrary event properties.
    return {
      website: payload.website,
      hostname: window.location.hostname,
      screen: payload.screen,
      language: payload.language,
      title: url.pathname,
      url: url.pathname,
      referrer: referrer,
    };
  };

  var script = document.createElement('script');
  script.id = 'umami-tracker';
  script.src = 'https://stats.propulseo-site.com/script.js';
  script.async = true;
  script.setAttribute('data-website-id', '2b878ed4-2538-4e83-abd5-1e092177ed85');
  script.setAttribute('data-domains', domains.join(','));
  script.setAttribute('data-exclude-search', 'true');
  script.setAttribute('data-exclude-hash', 'true');
  script.setAttribute('data-do-not-track', 'true');
  script.setAttribute('data-before-send', 'umamiBeforeSend');
  document.head.appendChild(script);
})();
