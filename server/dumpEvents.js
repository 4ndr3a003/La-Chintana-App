import 'dotenv/config';
import admin from 'firebase-admin';

process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
if (!admin.apps.length) admin.initializeApp({ projectId: 'chintana-events-handler' });
const db = admin.firestore();

async function run() {
    const events = await db.collection('artifacts').doc('default-app-id').collection('public').doc('data').collection('associations').doc('assoc_chintana').collection('events').get();
    events.forEach(doc => {
        const data = doc.data();
        console.log(`Event ID: ${doc.id} | Title: ${data.title} | Type: ${data.type} | Visibility: ${data.visibility}`);
    });
    process.exit(0);
}
run().catch(console.error);
