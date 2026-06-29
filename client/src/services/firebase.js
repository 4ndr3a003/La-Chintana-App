import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyDws3XJdK47wXhUy0ki_ke5A4jMQ4mQykk",
  authDomain: "chintana-events-handler.firebaseapp.com",
  projectId: "chintana-events-handler",
  storageBucket: "chintana-events-handler.firebasestorage.app",
  messagingSenderId: "1008502310698",
  appId: "1:1008502310698:web:ed845464f36ee2d6cc8053"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
let messaging = null;

// Se siamo in modalità sviluppo locale, colleghiamo gli emulatori
if (import.meta.env.DEV) {
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  connectStorageEmulator(storage, '127.0.0.1', 9199);
  console.log('🔥 Connesso agli emulatori locali di Firebase!');
}

try {
  messaging = getMessaging(app);
} catch (error) {
  console.warn('Firebase Messaging not supported in this environment.', error);
}
export { messaging };
// eslint-disable-next-line no-undef
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
