const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

// Helper function to send notifications
async function sendNotificationToAll(appId, title, body, options = {}, data = {}) {
  try {
    // 0. Constants (Mirroring Client Constants)
    const EVENT_VISIBILITY = {
      ALL: 'Tutti',
      BOARD_ONLY: 'Solo Direttivo',
      K9_ONLY: 'Solo Cinofili'
    };

    // 1. Get all profiles to find tokens
    // Path: artifacts/{appId}/public/data/profiles
    const profilesRef = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('profiles');
    const snapshot = await profilesRef.get();

    const tokens = [];
    snapshot.forEach(doc => {
      const data = doc.data();

      // Apply Target Filter if provided
      if (options.targetFilter && typeof options.targetFilter === 'function') {
        if (!options.targetFilter(data)) {
          return; // Skip this user
        }
      }

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

    // [CUSTOMIZATION] Add Icon/Badge
    const BASE_URL = 'https://chintana-events-handler.firebaseapp.com';
    const DEFAULT_ICON = `${BASE_URL}/logo_chintana_fenix.png`;
    // For web badge, we use the white transparent icon we just copied to public
    const DEFAULT_BADGE = `${BASE_URL}/ic_stat_icon.png`;

    const destUrl = data.url ? `${BASE_URL}${data.url}` : BASE_URL;

    const message = {
      notification: {
        title: title,
        body: body,
        // REMOVED top-level icon to avoid confusing Android Native client
      },
      webpush: {
        notification: {
          title: title,
          body: body,
          icon: DEFAULT_ICON, // URL for Web
          badge: DEFAULT_BADGE, // URL for Web
          actions: [
            { action: 'open_app', title: 'Apri App' }
          ]
        },
        fcm_options: {
          link: destUrl
        },
        data: data
      },
      android: {
        notification: {
          icon: 'ic_stat_icon', // Resource Name for Android Native
          color: '#254E2A'
        }
      },
      data: data, // Add data payload here
      tokens: uniqueTokens,
    };

    if (options.isUrgent) {
      message.android = {
        notification: {
          color: "#FF0000", // Rosso per le notifiche urgenti
          icon: "ic_stat_notification", // Native Android resource name if available
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
  const eventId = context.params.eventId;

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

  const payloadData = {
    url: '/events',
    type: 'event',
    id: eventId
  };

  // Define specific filtering logic for this event
  let targetFilter = null;

  // Constants
  const EVENT_VISIBILITY = {
    ALL: 'Tutti',
    BOARD_ONLY: 'Solo Direttivo',
    K9_ONLY: 'Solo Cinofili'
  };

  const isDirettivoEvent = data.type === 'Direttivo';
  const visibility = data.visibility || EVENT_VISIBILITY.ALL;

  if (isDirettivoEvent || visibility === EVENT_VISIBILITY.BOARD_ONLY) {
    targetFilter = (user) => {
      // STRICT FILTER: Only Board Members and President
      return user.role === 'direttivo' || user.role === 'presidente';
    };
  } else if (visibility === EVENT_VISIBILITY.K9_ONLY) {
    targetFilter = (user) => {
      const isBoard = user.role === 'direttivo' || user.role === 'presidente';
      const isK9 = user.volunteerRole === 'Cinofilo'; // Using string 'Cinofilo' matching client constant
      return isBoard || isK9;
    };
  }

  await sendNotificationToAll(appId, title, body, { targetFilter }, payloadData);
});

// Trigger: New Communication Created
exports.onCommunicationCreated = functions.firestore.document("artifacts/{appId}/public/data/communications/{commId}").onCreate(async (snap, context) => {
  const data = snap.data();
  const appId = context.params.appId;
  const commId = context.params.commId;

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

  const payloadData = {
    url: '/comms',
    type: 'communication',
    id: commId
  };

  // Filter for specific topics or visibility
  let targetFilter = null;

  // Constants (Mirroring Client)
  const VISIBILITY = {
    BOARD_ONLY: 'Solo Direttivo',
    K9_ONLY: 'Solo Cinofili'
  };

  const isDirettivoTarget = data.topic === 'Direttivo' || data.visibility === VISIBILITY.BOARD_ONLY;
  const isK9Target = data.topic === 'Cinofili' || data.visibility === VISIBILITY.K9_ONLY;

  if (isDirettivoTarget) {
    targetFilter = (user) => {
      // STRICT FILTER: Only Board Members and President
      return user.role === 'direttivo' || user.role === 'presidente';
    };
  } else if (isK9Target) {
    targetFilter = (user) => {
      // Board Members AND K9 Volunteers
      const isBoard = user.role === 'direttivo' || user.role === 'presidente';
      const isK9 = user.volunteerRole === 'Cinofilo';
      return isBoard || isK9;
    };
  }

  // Pass filter in options
  await sendNotificationToAll(appId, title, body, { ...options, targetFilter }, payloadData);
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

// --- iCalendar Feed Cloud Function ---
exports.calendarFeed = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  try {
    // Use the default appId or get it from query params
    const appId = req.query.appId || 'default-app-id';
    const userId = req.query.userId || null;

    // Read all events from Firestore
    const eventsRef = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('events');
    const snapshot = await eventsRef.get();

    const events = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      events.push({ id: doc.id, ...data });
    });

    // Filter events:
    // 1. If userId is provided, show events where user is participating (regardless of visibility)
    // 2. If no userId, show only public events ('Tutti' or undefined)
    const filteredEvents = events.filter(e => {
      const isParticipant = (e.participants && e.participants.includes(userId)) || 
                           (e.shifts && e.shifts.some(s => s.participants && s.participants.includes(userId)));
      
      if (userId && isParticipant) return true;
      
      const visibility = e.visibility || 'Tutti';
      return visibility === 'Tutti';
    });

    // Helper: format Date to iCal DTSTART/DTEND format (YYYYMMDDTHHmmssZ)
    const formatICalDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };

    // Helper: format Date to iCal local time format (YYYYMMDDTHHmmss)
    const formatICalLocal = (date) => {
      // Italian time is UTC+1 (Winter) or UTC+2 (Summer)
      // We use the timezone definition in the VCALENDAR to let the client handle it,
      // but for shifts we need to construct a date object that represents the local time.
      const pad = (n) => n.toString().padStart(2, '0');
      return date.getFullYear() +
             pad(date.getMonth() + 1) +
             pad(date.getDate()) + 'T' +
             pad(date.getHours()) +
             pad(date.getMinutes()) +
             pad(date.getSeconds());
    };

    // Helper: escape iCal text values
    const escapeICalText = (text) => {
      if (!text) return '';
      return text
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n');
    };

    // Build iCalendar content
    let ical = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//La Chintana Fenix//Eventi//IT',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:La Chintana Fenix - ${userId ? 'I Miei Turni' : 'Eventi'}`,
      'X-WR-TIMEZONE:Europe/Rome',
      'BEGIN:VTIMEZONE',
      'TZID:Europe/Rome',
      'X-LIC-LOCATION:Europe/Rome',
      'BEGIN:DAYLIGHT',
      'TZOFFSETFROM:+0100',
      'TZOFFSETTO:+0200',
      'TZNAME:CEST',
      'DTSTART:19700329T020000',
      'RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3',
      'END:DAYLIGHT',
      'BEGIN:STANDARD',
      'TZOFFSETFROM:+0200',
      'TZOFFSETTO:+0100',
      'TZNAME:CET',
      'DTSTART:19701025T030000',
      'RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10',
      'END:STANDARD',
      'END:VTIMEZONE',
    ];

    filteredEvents.forEach(event => {
      const baseDate = new Date(event.date);
      
      // If the event has shifts, create a VEVENT for each shift
      if (event.shifts && event.shifts.length > 0) {
        event.shifts.forEach((shift, idx) => {
          // If filtering by user, only show the shift the user is in
          if (userId && (!shift.participants || !shift.participants.includes(userId))) {
            return;
          }

          const shiftDate = new Date(event.date);
          
          // Parse shift start/end times (assumed to be in Europe/Rome)
          if (shift.startTime) {
            const [sh, sm] = shift.startTime.split(':');
            shiftDate.setHours(parseInt(sh), parseInt(sm), 0, 0);
          }
          
          let endDate = new Date(shiftDate);
          if (shift.endTime) {
            const [eh, em] = shift.endTime.split(':');
            endDate.setHours(parseInt(eh), parseInt(em), 0, 0);
            if (endDate <= shiftDate) {
              endDate.setDate(endDate.getDate() + 1);
            }
          } else {
            endDate = new Date(shiftDate.getTime() + 2 * 60 * 60 * 1000); // 2h default
          }

          const shiftLabel = `Turno ${idx + 1}`;
          const description = [
            `Tipo: ${event.type || 'Evento'}`,
            shift.startTime && shift.endTime ? `Orario: ${shift.startTime} - ${shift.endTime}` : '',
            shift.maxParticipants ? `Max Partecipanti: ${shift.maxParticipants}` : '',
            event.description || ''
          ].filter(Boolean).join('\\n');

          ical.push('BEGIN:VEVENT');
          ical.push(`UID:${event.id}-shift${idx}@chintana-events-handler.firebaseapp.com`);
          ical.push(`DTSTAMP:${formatICalDate(new Date())}`);
          // Using TZID for floating local time as specified in VTIMEZONE
          ical.push(`DTSTART;TZID=Europe/Rome:${formatICalLocal(shiftDate)}`);
          ical.push(`DTEND;TZID=Europe/Rome:${formatICalLocal(endDate)}`);
          ical.push(`SUMMARY:${escapeICalText(event.title)} (${shiftLabel})`);
          if (event.location) ical.push(`LOCATION:${escapeICalText(event.location)}`);
          ical.push(`DESCRIPTION:${escapeICalText(description)}`);
          ical.push(`URL:https://chintana-events-handler.firebaseapp.com/events?eventId=${event.id}`);
          ical.push('END:VEVENT');
        });
      } else {
        // Single event (no shifts)
        let endDate = new Date(baseDate.getTime() + 2 * 60 * 60 * 1000); 

        const description = [
          `Tipo: ${event.type || 'Evento'}`,
          event.description || ''
        ].filter(Boolean).join('\\n');

        ical.push('BEGIN:VEVENT');
        ical.push(`UID:${event.id}@chintana-events-handler.firebaseapp.com`);
        ical.push(`DTSTAMP:${formatICalDate(new Date())}`);
        // Base events are usually created with ISO strings which are UTC
        ical.push(`DTSTART:${formatICalDate(baseDate)}`);
        ical.push(`DTEND:${formatICalDate(endDate)}`);
        ical.push(`SUMMARY:${escapeICalText(event.title)}`);
        if (event.location) ical.push(`LOCATION:${escapeICalText(event.location)}`);
        ical.push(`DESCRIPTION:${escapeICalText(description)}`);
        ical.push(`URL:https://chintana-events-handler.firebaseapp.com/events?eventId=${event.id}`);
        ical.push('END:VEVENT');
      }
    });


    ical.push('END:VCALENDAR');

    const icalContent = ical.join('\r\n');

    // Set headers for iCal download
    res.set('Content-Type', 'text/calendar; charset=utf-8');
    res.set('Content-Disposition', 'inline; filename="la-chintana-eventi.ics"');
    res.set('Cache-Control', 'public, max-age=300'); // Cache 5 min
    res.status(200).send(icalContent);

  } catch (error) {
    console.error('Error generating iCal feed:', error);
    res.status(500).send('Error generating calendar feed');
  }
});
