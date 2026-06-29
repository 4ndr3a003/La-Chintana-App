import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// 1. Carica la chiave di produzione
let serviceAccount;
try {
  serviceAccount = require('./serviceAccountKey.json');
} catch (err) {
  console.error("❌ ERRORE: Per copiare i dati da produzione devi scaricare il file 'serviceAccountKey.json' dalla Firebase Console (Impostazioni Progetto -> Account di Servizio) e inserirlo nella cartella '/server'.");
  process.exit(1);
}

// 2. Inizializza l'app di produzione
const prodApp = initializeApp({
  credential: cert(serviceAccount)
}, 'production');
const prodDb = getFirestore(prodApp);

// 3. Configura le variabili per collegarsi all'emulatore locale
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
const localApp = initializeApp({
  projectId: 'chintana-events-handler'
}, 'local');
const localDb = getFirestore(localApp);

async function copyCollection(srcCollectionRef, destCollectionRef) {
  // listDocuments() restituisce anche i documenti "fittizi/segnaposto" che non hanno campi propri
  const docRefs = await srcCollectionRef.listDocuments();
  console.log(`📂 Trovati ${docRefs.length} documenti nella collezione: ${srcCollectionRef.path}`);
  
  for (const docRef of docRefs) {
    const docSnapshot = await docRef.get();
    const destDocRef = destCollectionRef.doc(docRef.id);
    
    if (docSnapshot.exists) {
      // Se il documento ha dati reali, li copiamo
      await destDocRef.set(docSnapshot.data());
      console.log(`  ✅ Copiato documento: ${docRef.path}`);
    } else {
      // Se è un documento segnaposto, lo creiamo vuoto in locale per mantenere la struttura delle sotto-collezioni
      await destDocRef.set({});
      console.log(`  📁 Creato segnaposto per: ${docRef.path}`);
    }
    
    // Trova ed esporta ricorsivamente tutte le sotto-collezioni di questo specifico documento
    const subcollections = await docRef.listCollections();
    for (const subcol of subcollections) {
      const destSubcolRef = destDocRef.collection(subcol.id);
      await copyCollection(subcol, destSubcolRef);
    }
  }
}

async function startSync() {
  console.log("🚀 Avvio della sincronizzazione Firestore da Produzione a Locale...");
  try {
    // Rileva automaticamente tutte le collezioni presenti alla radice del database di produzione
    const rootCollections = await prodDb.listCollections();
    console.log(`🔍 Rilevate ${rootCollections.length} collezioni radice in produzione.`);
    
    for (const col of rootCollections) {
      const destCol = localDb.collection(col.id);
      await copyCollection(col, destCol);
    }
    
    console.log("🎉 Sincronizzazione completata con successo!");
  } catch (error) {
    console.error("❌ Errore durante la copia dei dati:", error);
  }
}

startSync();
