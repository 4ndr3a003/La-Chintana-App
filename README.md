# 🛡️ La Chintana - Portale Protezione Civile

Applicazione gestionale moderna per il coordinamento dei volontari della Protezione Civile "La Chintana". Il sistema unifica la gestione operativa, le comunicazioni e le attività di volontariato in un'unica piattaforma accessibile via Web e App Mobile (Android).

## 🏗️ Architettura del Progetto

Il progetto è strutturato come monorepo diviso in componenti distinti:

-   **`client/`**: Frontend sviluppato con **React 19**, **Vite** e **Tailwind CSS**. Gestisce l'interfaccia utente, la PWA e la logica lato client. Utilizza **Capacitor** per la build nativa Android.
-   **`functions/`**: Backend serverless su **Firebase Cloud Functions**. Gestisce i trigger automatici (es. notifiche alla creazione di eventi/comunicazioni) e la sincronizzazione sicura dei ruoli (Custom Claims).
-   **`server/`**: Server **Node.js/Express** addizionale per API custom e gestione centralizzata delle notifiche push (FCM) al di fuori dei trigger automatici.
-   **`android/`**: Progetto nativo generato da Capacitor per la compilazione dell'APK Android.

## 🚀 Funzionalità

### 👥 Gestione Utenti e Ruoli
-   **Ruoli Gerarchici**:
    -   **Presidente**: Super-admin con controllo totale.
    -   **Direttivo**: Gestione operativa (eventi, comunicazioni, volontari).
    -   **Volontario**: Accesso limitato a calendari personali e avvisi.
-   **Specializzazioni**: Gestione profili con tracciamento certificazioni (es. Primo Soccorso, Cinofili) e scadenze.
-   **Sicurezza**: Autenticazione Firebase e sincronizzazione ruoli tramite Cloud Functions.

### 📅 Eventi e Operatività
-   **Calendario Interattivo**: Visualizzazione turni, esercitazioni e servizi.
-   **Iscrizioni**: Sistema di adesione agli eventi con monitoraggio presenze in tempo reale.
-   **Filtri Ruolo**: Eventi visibili solo a gruppi specifici (es. "Solo Direttivo", "Cinofili").

### 📢 Comunicazioni e Notifiche
-   **Bacheca Avvisi**: Messaggi prioritari (Alta/Normale/Bassa).
-   **Notifiche Push**: Sistema integrato (FCM) che notifica gli utenti su Web e Android alla creazione di nuovi eventi o comunicazioni urgenti.
-   **Targeting**: Le notifiche vengono inviate solo agli utenti interessati (es. notifiche "Cinofili" arrivano solo ai cinofili).

### 🚚 Logistica
-   **Parco Mezzi**: Gestione completa della flotta veicoli.
    -   Stato operativo (Operativo/In Manutenzione/Guasto).
    -   Scadenze amministrative e manutenzioni programmate.
-   **Magazzino & Attrezzature**: Inventario dettagliato del materiale tecnico.
    -   Categorizzazione (Elettrico, Idraulico, DPI, Radio, ecc.).
    -   Tracciamento ubicazione (Sede, Magazzino Cementeria o assegnato su specifico Mezzo).
    -   Stato di funzionamento e necessità di revisione.
-   **Ricerca e Filtri**: Funzionalità di ricerca globale e filtri avanzati per stato, categoria e posizione per rapida consultazione operativa.

## 🛠️ Installazione e Setup

### Prerequisiti
-   Node.js (v18+ raccomandato)
-   Nonde Package Manager (npm)
-   Firebase CLI (`npm install -g firebase-tools`)

### 1. Setup Client (Frontend)
```bash
cd client
npm install
```
Configura le variabili d'ambiente creando un file `.env` nella cartella `client` con le chiavi del tuo progetto Firebase.

### 2. Setup Server (Opzionale)
Il server Express è necessario se si desidera utilizzare le API manuali per le notifiche.
```bash
cd server
npm install
```
*Nota: Scarica `serviceAccountKey.json` dalla console Firebase e posizionalo nella cartella `server/`.*

### 3. Setup Functions (Backend)
```bash
cd functions
npm install
```

## ▶️ Avvio Sviluppo

### Frontend (Web App)
Lancia l'applicazione in modalità sviluppo (con Hot Module Replacement):
```bash
cd client
npm run dev
```
L'app sarà accessibile su `http://localhost:5173`.

### Server API
```bash
cd server
node index.js
```
Il server girerà su `http://localhost:3000`.

## 📱 Sviluppo Mobile (Android)
Il progetto utilizza Capacitor per il runtime nativo.

1.  **Build del frontend**:
    ```bash
    cd client
    npm run build
    ```
2.  **Sincronizzazione risorse native**:
    ```bash
    npx cap sync
    ```
3.  **Apertura Android Studio**:
    ```bash
    npx cap open android
    ```
    Da qui puoi avviare l'emulatore o compilare l'APK.

## 🌍 Deployment

### Web Hosting (Firebase)
Per pubblicare la versione web (PWA):
```bash
cd client
npm run build
firebase deploy --only hosting
```

### Cloud Functions
Per aggiornare la logica di backend (trigger notifiche):
```bash
firebase deploy --only functions
```