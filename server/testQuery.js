import 'dotenv/config';
import admin from 'firebase-admin';

process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
if (!admin.apps.length) admin.initializeApp({ projectId: 'chintana-events-handler' });
const db = admin.firestore();

async function run() {
    try {
        const q = db.collectionGroup('profiles')
            .where('email', '==', 'dev.admin@lachintana.it')
            .where('password', '==', 'devTestUser123!');
        const snapshot = await q.get();
        console.log(`Query success! Found ${snapshot.size} profiles.`);
    } catch (e) {
        console.error("Query failed:", e.message);
    }
    process.exit(0);
}
run().catch(console.error);
