import { Workbox } from 'workbox-window';

export function register() {
  if ('serviceWorker' in navigator) {
    const wb = new Workbox('/service-worker.js');

    wb.addEventListener('installed', event => {
      if (event.isUpdate) {
        if (window.confirm('New content is available! Click OK to refresh.')) {
          window.location.reload();
        }
      }
    });

    wb.addEventListener('activated', event => {
      console.log('Service worker activated');
    });

    wb.addEventListener('waiting', event => {
      console.log('Service worker waiting');
    });

    wb.register()
      .then(registration => {
        console.log('Service Worker registered:', registration);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error(error.message);
      });
  }
}
