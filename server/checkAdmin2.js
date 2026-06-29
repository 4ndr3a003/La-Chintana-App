import 'dotenv/config';
import admin from 'firebase-admin';

process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
if (!admin.apps.length) admin.initializeApp({ projectId: 'chintana-events-handler' });
const db = admin.firestore();

async function run() {
    const profiles = await db.collectionGroup('profiles').where('email', '==', 'admin@mail.com').get();
    profiles.forEach(doc => {
        console.log(`Found: ${doc.id} | Path: ${doc.ref.path} | Data: ${JSON.stringify(doc.data())}`);
    });
    process.exit(0);
}
run().catch(console.error);
