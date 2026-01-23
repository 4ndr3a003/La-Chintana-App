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
  console.log('[firebase-messaging-sw.js] Notification click received. Notification data:', event.notification.data);

  event.notification.close();

  // 1. Construct the absolute URL to open
  //    Default to root if no URL provided in data
  const connectionString = event.notification.data?.url || '/';

  // Ensure we have a full URL (important for matching client.url)
  const urlToOpen = new URL(connectionString, self.location.origin).href;

  console.log('[firebase-messaging-sw.js] Attempting to open custom URL:', urlToOpen);

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function (clientList) {
      // 2. Check if there is already a window/tab open with the app
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];

        // Check if the client matches our origin
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          console.log('[firebase-messaging-sw.js] Found existing client, focusing:', client.url);
          return client.focus().then((focusedClient) => {
            // After focusing, navigate if it's a different URL
            if (focusedClient.url !== urlToOpen) {
              return focusedClient.navigate(urlToOpen);
            }
            return focusedClient;
          });
        }
      }

      // 3. If no window is open, open a new one
      if (clients.openWindow) {
        console.log('[firebase-messaging-sw.js] No existing client found, opening new window.');
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
