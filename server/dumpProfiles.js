import 'dotenv/config';
import admin from 'firebase-admin';

process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
if (!admin.apps.length) admin.initializeApp({ projectId: 'chintana-events-handler' });
const db = admin.firestore();

async function run() {
    const profiles = await db.collection('artifacts').doc('default-app-id').collection('public').doc('data').collection('associations').doc('assoc_chintana').collection('profiles').get();
    profiles.forEach(doc => {
        const data = doc.data();
        console.log(`${data.email} | Role: ${data.role} | VolunteerRole: ${data.volunteerRole}`);
    });
    process.exit(0);
}
run().catch(console.error);
