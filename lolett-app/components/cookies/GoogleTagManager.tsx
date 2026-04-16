'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-NQF4X8KF';

export function GoogleTagManager() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    // Vérifier le consentement existant au montage
    const match = document.cookie.match(/(?:^|; )lolett-consent=([^;]*)/);
    if (match) {
      try {
        const prefs = JSON.parse(decodeURIComponent(match[1]));
        if (prefs.analytics) setAllowed(true);
      } catch { /* ignore */ }
    }

    // Écouter les changements de consentement
    function onConsent(e: Event) {
      const detail = (e as CustomEvent).detail;
      setAllowed(!!detail?.analytics);
    }
    window.addEventListener('lolett-consent', onConsent);
    return () => window.removeEventListener('lolett-consent', onConsent);
  }, []);

  if (!allowed) return null;

  return (
    <>
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
        }}
      />
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  );
}
