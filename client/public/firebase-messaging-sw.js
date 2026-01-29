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
  // [ANTI-DUPLICATE FIX]
  // Since the server sends a 'notification' payload, the browser/OS displays it automatically.
  // We MUST NOT call showNotification manually here, otherwise the user receives two notifications.
  // To customize the notification (icon, actions), the server should send those details in the payload.

  // const notificationTitle = payload.notification.title;
  // const notificationOptions = {
  //   body: payload.notification.body,
  //   icon: '/logo_chintana.png',
  //   badge: '/logo_chintana.png',
  //   image: payload.notification.image,
  //   vibrate: [200, 100, 200, 100, 200],
  //   tag: 'general-notification',
  //   renotify: true,
  //   requireInteraction: false,
  //   actions: [
  //     {
  //       action: 'open_app',
  //       title: 'Apri App'
  //     }
  //   ],
  //   data: {
  //     url: payload.data?.url || '/'
  //   }
  // };

  // self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function (event) {
  console.log('[firebase-messaging-sw.js] Notification click received. Action:', event.action);
  event.notification.close();

  // 1. Determine URL to open
  let urlToOpen = new URL(self.location.origin).href; // Default to root
  if (event.notification.data && event.notification.data.url) {
    // Construct absolute URL from relative path
    urlToOpen = new URL(event.notification.data.url, self.location.origin).href;
  }

  console.log('[firebase-messaging-sw.js] Target URL:', urlToOpen);

  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then((windowClients) => {
    // 2. Search for existing window
    let matchingClient = null;
    for (let i = 0; i < windowClients.length; i++) {
      const client = windowClients[i];
      if (client.url.startsWith(self.location.origin)) {
        matchingClient = client;
        break;
      }
    }

    if (matchingClient) {
      console.log('[firebase-messaging-sw.js] Found existing client, attempting focus.');
      return matchingClient.focus().then((focusedClient) => {
        // Optional: Navigate to specific URL if needed
        // Using 'navigate' on a focused client updates the page
        if (urlToOpen && focusedClient.url !== urlToOpen) {
          return focusedClient.navigate(urlToOpen);
        }
        return focusedClient;
      }).catch(err => {
        console.warn('[firebase-messaging-sw.js] Focus failed, trying openWindow.', err);
        return clients.openWindow(urlToOpen);
      });
    }

    // 3. No client found, open new window
    console.log('[firebase-messaging-sw.js] No client found, opening new window.');
    return clients.openWindow(urlToOpen);
  });

  event.waitUntil(promiseChain);
});
