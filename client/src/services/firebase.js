import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
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
export const messaging = getMessaging(app);
// eslint-disable-next-line no-undef
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
