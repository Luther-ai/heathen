export function registerServiceWorker() {
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[ServiceWorker] Registered successfully with scope:', registration.scope);
        })
        .catch((error) => {
          console.warn('[ServiceWorker] Registration failed:', error);
        });
    });
  }
}
