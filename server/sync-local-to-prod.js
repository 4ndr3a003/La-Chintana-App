import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const require = createRequire(import.meta.url);

// 1. Carica la chiave di produzione Service Account
let serviceAccount;
try {
  serviceAccount = require('./serviceAccountKey.json');
} catch (err) {
  console.error("❌ ERRORE: File 'serviceAccountKey.json' non trovato nella cartella /server.");
  process.exit(1);
}

// 2. Inizializza Firestore Produzione
const prodApp = initializeApp({
  credential: cert(serviceAccount)
}, 'production');

const prodDb = getFirestore(prodApp);

// 3. Inizializza Firestore Locale (Emulatore)
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";

const localApp = initializeApp({
  projectId: serviceAccount.project_id
}, 'local');

const localDb = getFirestore(localApp);

// --- FUNZIONE SINCRONIZZAZIONE FIRESTORE ---
async function copyCollection(srcCollectionRef, destCollectionRef) {
  const docRefs = await srcCollectionRef.listDocuments();
  console.log(`📂 Firestore: Trovati ${docRefs.length} documenti nella collezione: ${srcCollectionRef.path}`);

  for (const docRef of docRefs) {
    const docSnapshot = await docRef.get();
    const destDocRef = destCollectionRef.doc(docRef.id);

    if (docSnapshot.exists) {
      await destDocRef.set(docSnapshot.data());
      console.log(`  ✅ Firestore copiato: ${docRef.path}`);
    } else {
      await destDocRef.set({});
      console.log(`  📁 Firestore segnaposto creato: ${docRef.path}`);
    }

    const subcollections = await docRef.listCollections();
    for (const subcol of subcollections) {
      const destSubcolRef = destDocRef.collection(subcol.id);
      await copyCollection(subcol, destSubcolRef);
    }
  }
}

async function syncFirestore() {
  console.log("\n🚀 Avvio sincronizzazione FIRESTORE da Locale a Produzione...");
  const rootCollections = await localDb.listCollections();
  console.log(`🔍 Rilevate ${rootCollections.length} collezioni radice nel simulatore.`);

  for (const col of rootCollections) {
    const destCol = prodDb.collection(col.id);
    await copyCollection(col, destCol);
  }
  console.log("🎉 Firestore sincronizzato con successo in Produzione!");
}

// --- FUNZIONE SINCRONIZZAZIONE STORAGE VIA NATIVE OAUTH & REST ---
function base64url(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function getJwtToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/devstorage.full_control',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedClaimSet = base64url(JSON.stringify(claimSet));
  const signatureInput = `${encodedHeader}.${encodedClaimSet}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signatureInput);
  const signature = base64url(signer.sign(serviceAccount.private_key));

  return `${signatureInput}.${signature}`;
}

async function getAccessToken() {
  const jwt = getJwtToken();
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Token error: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

async function uploadFileToStorage(accessToken, remotePath, localFilePath, contentType) {
  const bucketName = `${serviceAccount.project_id}.firebasestorage.app`;
  const fileBuffer = fs.readFileSync(localFilePath);
  const uploadUrl = `https://storage.googleapis.com/upload/storage/v1/b/${bucketName}/o?uploadType=media&name=${encodeURIComponent(remotePath)}`;

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': contentType || 'image/png'
    },
    body: fileBuffer
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Upload error: ${JSON.stringify(data)}`);
  }
  console.log(`  ✅ Storage caricato con successo: ${remotePath}`);
}

async function syncStorage() {
  console.log("\n🚀 Avvio sincronizzazione CLOUD STORAGE da Locale a Produzione...");
  const storageExportMetadataDir = path.join(rootDir, 'emulator-data', 'storage_export', 'metadata');
  const storageExportBlobsDir = path.join(rootDir, 'emulator-data', 'storage_export', 'blobs');

  if (!fs.existsSync(storageExportMetadataDir)) {
    console.log("⚠️ Nessun dato storage locale trovato in emulator-data/storage_export/metadata.");
    return;
  }

  const metaFiles = fs.readdirSync(storageExportMetadataDir).filter(f => f.endsWith('.json'));
  console.log(`🔍 Trovati ${metaFiles.length} file di metadata nel simulatore storage.`);

  if (metaFiles.length === 0) return;

  const accessToken = await getAccessToken();

  for (const metaFileName of metaFiles) {
    const metaPath = path.join(storageExportMetadataDir, metaFileName);
    const metaData = JSON.parse(fs.readFileSync(metaPath, 'utf8'));

    const remoteFilePath = metaData.name;
    const blobId = metaFileName.replace('.json', '');
    const blobPath = path.join(storageExportBlobsDir, blobId);

    if (fs.existsSync(blobPath)) {
      console.log(`  📤 Upload file: ${remoteFilePath}...`);
      await uploadFileToStorage(accessToken, remoteFilePath, blobPath, metaData.contentType);
    } else {
      console.warn(`  ⚠️ File blob non trovato per metadata ${metaFileName}`);
    }
  }

  console.log("🎉 Cloud Storage sincronizzato con successo in Produzione!");
}

async function main() {
  try {
    await syncFirestore();
    await syncStorage();
    console.log("\n==========================================");
    console.log("SUCCESS: Firestore e Storage sono stati completamente migrati alla Produzione!");
    console.log("==========================================");
    process.exit(0);
  } catch (error) {
    console.error("❌ Errore durante la migrazione dei dati:", error);
    process.exit(1);
  }
}

main();
