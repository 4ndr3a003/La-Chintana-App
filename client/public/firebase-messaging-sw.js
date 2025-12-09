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
        // If the client is already on the same origin
        // We can just focus it and navigate
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          return client.focus().then(focusedClient => {
            // Navigate the focused client to the new URL if needed
            if (focusedClient && 'navigate' in focusedClient) {
              return focusedClient.navigate(urlToOpen);
            }
            return focusedClient;
          });
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
