import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Il percorso target è android/app/google-services.json
const targetPath = path.join(__dirname, '..', 'android', 'app', 'google-services.json');

const content = process.env.GOOGLE_SERVICES_JSON;

if (content) {
    try {
        fs.writeFileSync(targetPath, content);
        console.log(`✅ google-services.json creato con successo in: ${targetPath}`);
    } catch (e) {
        console.error("❌ Errore durante la creazione di google-services.json", e);
        process.exit(1);
    }
} else {
    console.log("ℹ️ Variabile GOOGLE_SERVICES_JSON non trovata. Salto la creazione del file (ok se sei in locale e hai già il file).");
}
