import 'dotenv/config';
import admin from 'firebase-admin';

process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
if (!admin.apps.length) admin.initializeApp({ projectId: 'chintana-events-handler' });
const db = admin.firestore();

async function run() {
    const artifacts = await db.collection('artifacts').get();
    console.log(`Found ${artifacts.size} artifacts.`);
    for (const doc of artifacts.docs) {
        console.log(`Artifact ID: ${doc.id}`);
        const publicCol = await doc.ref.collection('public').get();
        for (const pub of publicCol.docs) {
             console.log(`  - public doc: ${pub.id}`);
             const dataCol = await pub.ref.collection('data').get(); // wait, data is a document, not a collection?
             console.log(`    data is doc?`);
        }
    }
    
    // Also, query collectionGroup for profiles to see if any exist at all
    const allProfiles = await db.collectionGroup('profiles').get();
    console.log(`Total profiles in DB: ${allProfiles.size}`);
    allProfiles.forEach(p => console.log(`Profile: ${p.ref.path} - ${p.data().email}`));
    
    process.exit(0);
}
run().catch(console.error);
