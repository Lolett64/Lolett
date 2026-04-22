'use client';

export function CookieSettingsButton() {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event('lolett-open-cookie-settings'))}
      className="text-lolett-gray-400 inline-block py-1 transition-colors hover:text-white"
    >
      Gérer les cookies
    </button>
  );
}
