import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createRequire } from 'module';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

dotenv.config();

const require = createRequire(import.meta.url);
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Firebase Admin
// NOTE: You must download your serviceAccountKey.json from Firebase Console -> Project Settings -> Service Accounts
// and place it in the server folder.
let db;
let messaging;

try {
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    initializeApp({
      projectId: 'chintana-events-handler'
    });
    console.log("Firebase Admin initialized for local emulator");
  } else {
    const serviceAccount = require('./serviceAccountKey.json');
    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log("Firebase Admin initialized successfully with Service Account");
  }
  db = getFirestore();
  messaging = getMessaging();
} catch (error) {
  console.warn("Warning: Failed to initialize Firebase Admin. Error:", error.message);
  console.warn("Please check your configuration or make sure serviceAccountKey.json is present for production mode.");
}

app.use(cors());
app.use(express.json());

app.post('/api/send-notification', async (req, res) => {
  if (!db || !messaging) {
    return res.status(500).json({ error: 'Firebase Admin not initialized' });
  }

  const { title, body, appId, associationId } = req.body;

  if (!title || !body || !appId || !associationId) {
    return res.status(400).json({ error: 'Missing title, body, appId, or associationId' });
  }

  try {
    // 1. Get all profiles to find tokens
    const profilesRef = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('associations').doc(associationId).collection('profiles');
    const snapshot = await profilesRef.get();

    const tokens = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.fcmTokens && Array.isArray(data.fcmTokens)) {
        tokens.push(...data.fcmTokens);
      }
    });

    if (tokens.length === 0) {
      return res.status(200).json({ message: 'No tokens found, no notifications sent.' });
    }

    // Remove duplicates
    const uniqueTokens = [...new Set(tokens)];

    // 2. Send Multicast Message
    // Firebase allows up to 500 tokens per batch. If more, we need to split.
    // For this demo, assuming < 500.

    // [CUSTOMIZATION] Add Icon/Badge
    const BASE_URL = 'https://chintana-events-handler.firebaseapp.com';
    const DEFAULT_ICON = `${BASE_URL}/logo_chintana_fenix.png`;
    const DEFAULT_BADGE = `${BASE_URL}/logo_chintana_fenix.png`;

    const message = {
      notification: {
        title: title,
        body: body,
        icon: DEFAULT_ICON,
      },
      webpush: {
        notification: {
          icon: DEFAULT_ICON,
          badge: DEFAULT_BADGE,
        }
      },
      tokens: uniqueTokens,
    };

    const response = await messaging.sendEachForMulticast(message);
    console.log(response.successCount + ' messages were sent successfully');

    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(uniqueTokens[idx]);
        }
      });
      console.log('List of tokens that caused failures: ' + failedTokens);
      // Optional: Remove invalid tokens from DB
    }

    res.status(200).json({ success: true, sentCount: response.successCount });

  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});