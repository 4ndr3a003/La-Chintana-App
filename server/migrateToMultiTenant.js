import 'dotenv/config';
import admin from 'firebase-admin';

// Ensure we connect to local emulators since we are in dev
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";

if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'chintana-events-handler', // Adjust if needed
    });
}
const db = admin.firestore();

const appId = "default-app-id";
const assocId = "assoc_chintana";
const assocName = "La Chintana Fenix";

const COLLECTIONS_TO_MIGRATE = [
    'profiles',
    'events',
    'communications',
    'vehicles',
    'equipment',
    'uniforms',
    'planning_notes',
    'settings'
];

async function migrate() {
    console.log(`Starting migration for appId: ${appId}...`);
    
    const rootDataRef = db.collection('artifacts').doc(appId).collection('public').doc('data');
    const assocRef = rootDataRef.collection('associations').doc(assocId);

    // 1. Create the association document
    console.log(`Creating association document ${assocId}...`);
    await assocRef.set({
        id: assocId,
        name: assocName,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 2. Migrate each collection
    for (const collName of COLLECTIONS_TO_MIGRATE) {
        console.log(`Migrating collection: ${collName}...`);
        const oldCollRef = rootDataRef.collection(collName);
        const newCollRef = assocRef.collection(collName);

        const snapshot = await oldCollRef.get();
        if (snapshot.empty) {
            console.log(`  - No documents found in ${collName}. Skipping.`);
            continue;
        }

        console.log(`  - Found ${snapshot.size} documents in ${collName}.`);
        
        // We will process in batches to handle larger collections
        let batch = db.batch();
        let count = 0;

        for (const doc of snapshot.docs) {
            const data = doc.data();
            
            // For settings, keep the same ID ('validity'), otherwise copy ID
            const newDocRef = newCollRef.doc(doc.id);
            
            // Additionally, inject associationId in profiles for easier querying if needed
            if (collName === 'profiles') {
                data.associationId = assocId;
            }

            batch.set(newDocRef, data);
            
            // Delete old doc
            batch.delete(doc.ref);

            count++;
            
            if (count % 400 === 0) {
                await batch.commit();
                batch = db.batch();
                console.log(`    - Committed ${count} documents...`);
            }
        }
        
        if (count % 400 !== 0) {
            await batch.commit();
            console.log(`    - Committed remaining documents. Total: ${count}`);
        }
    }

    console.log("Migration completed successfully!");
    process.exit(0);
}

migrate().catch(console.error);
