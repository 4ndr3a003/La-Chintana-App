importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDws3XJdK47wXhUy0ki_ke5A4jMQ4mQykk",
  authDomain: "chintana-events-handler.firebaseapp.com",
  projectId: "chintana-events-handler",
  storageBucket: "chintana-events-handler.firebasestorage.app",
  messagingSenderId: "1008502310698",
  appId: "1:1008502310698:web:ed845464f36ee2d6cc8053"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo_chintana.png', // Main icon
    badge: '/logo_chintana.png', // Small monochrome icon for status bar (Android)
    image: payload.notification.image, // Support for large images
    vibrate: [200, 100, 200, 100, 200], // Vibration pattern
    tag: 'general-notification', // Group notifications by tag to avoid stacking
    renotify: true, // Vibrate again even if replacing an old notification with same tag
    requireInteraction: false, // Default: auto-dismiss
    actions: [
      {
        action: 'open_app',
        title: 'Apri App'
      }
    ],
    data: {
      url: '/' // Default URL to open
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function (event) {
  console.log('[firebase-messaging-sw.js] Notification click received.');

  event.notification.close();

  // Define the URL to open
  const urlToOpen = event.notification.data?.url || '/';

  // This looks to see if the current window is already open and focuses if it is
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function (clientList) {
      // Check if there's already a tab open with this URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
