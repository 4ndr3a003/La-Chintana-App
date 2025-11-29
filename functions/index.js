const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

// Helper function to send notifications
async function sendNotificationToAll(appId, title, body, options = {}) {
  try {
    // 1. Get all profiles to find tokens
    // Path: artifacts/{appId}/public/data/profiles
    const profilesRef = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('profiles');
    const snapshot = await profilesRef.get();

    const tokens = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.fcmTokens && Array.isArray(data.fcmTokens)) {
        tokens.push(...data.fcmTokens);
      }
    });

    if (tokens.length === 0) {
      console.log('No tokens found.');
      return;
    }

    // Remove duplicates
    const uniqueTokens = [...new Set(tokens)];

    // 2. Send Multicast Message
    // Note: sendEachForMulticast handles up to 500 tokens. 
    // If you expect more, you should chunk the array.
    const message = {
      notification: {
        title: title,
        body: body,
      },
      tokens: uniqueTokens,
    };

    if (options.isUrgent) {
      message.android = {
        notification: {
          color: "#FF0000", // Rosso per le notifiche urgenti
        },
      };
      // Per iOS, si potrebbero aggiungere personalizzazioni come suoni specifici
      message.apns = {
        payload: {
          aps: {
            sound: "default",
          },
        },
      };
    }

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
      // Optional: Cleanup invalid tokens here
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

// Trigger: New Event Created
exports.onEventCreated = functions.firestore.document("artifacts/{appId}/public/data/events/{eventId}").onCreate(async (snap, context) => {
  const data = snap.data();
  const appId = context.params.appId;
  
  // Format date for display
  let dateStr = data.date;
  try {
      const dateObj = new Date(data.date);
      dateStr = dateObj.toLocaleDateString('it-IT');
  } catch (e) {
      // keep original string if parse fails
  }

  const title = `Nuovo Evento: ${data.title}`;
  const body = `È stato aggiunto un nuovo evento per il ${dateStr}. Controlla l'app!`;

  await sendNotificationToAll(appId, title, body);
});

// Trigger: New Communication Created
exports.onCommunicationCreated = functions.firestore.document("artifacts/{appId}/public/data/communications/{commId}").onCreate(async (snap, context) => {
  const data = snap.data();
  const appId = context.params.appId;

  let title = `Nuova Comunicazione: ${data.title}`;
  const options = {};

  if (data.level === 'URGENTE') {
    title = `⚠️ ${title}`;
    options.isUrgent = true;
  }
  
  // Truncate body if too long
  let bodyContent = data.content || '';
  if (bodyContent.length > 100) {
      bodyContent = bodyContent.substring(0, 100) + '...';
  }
  const body = bodyContent;

  await sendNotificationToAll(appId, title, body, options);
});

// Sync user role to custom claims
exports.syncUserRole = functions.firestore
  .document("artifacts/{appId}/public/data/profiles/{userId}")
  .onWrite(async (change, context) => {
    const userData = change.after.exists ? change.after.data() : null;
    const oldUserData = change.before.exists ? change.before.data() : null;

    if (!userData) {
      // User profile was deleted, do nothing for claims
      return null;
    }
    
    // Role or email changed?
    const role = userData.role || 'Volontario';
    const oldRole = oldUserData ? oldUserData.role || 'Volontario' : null;
    
    if (role === oldRole) {
      // Role hasn't changed, no need to update claims
      return null;
    }

    try {
      // Find the user by email
      const user = await admin.auth().getUserByEmail(userData.email);

      // Set custom claims
      await admin.auth().setCustomUserClaims(user.uid, { role: role });
      
      console.log(`Custom claim for role '${role}' set for user ${user.uid}`);
      return null;

    } catch (error) {
      console.error("Error syncing user role:", error);
      return null;
    }
  });
