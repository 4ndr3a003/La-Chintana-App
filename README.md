# 🛡️ Gestionale Associativo PC - Portale Protezione Civile

Applicazione gestionale multi-tenant moderna per il coordinamento dei volontari di diverse associazioni della Protezione Civile. Il sistema unifica la gestione operativa, le comunicazioni, la logistica e le attività di volontariato in un'unica piattaforma accessibile via **Web (PWA)** e **App Mobile Android** (via Capacitor).

---

## 🏗️ Architettura del Progetto

Il progetto è strutturato come **monorepo** con i seguenti componenti:

| Cartella | Tecnologia | Funzione |
|---|---|---|
| `client/` | React 19 + Vite + Tailwind CSS + Ionic | Frontend PWA con interfaccia responsive |
| `functions/` | Firebase Cloud Functions | Trigger automatici (es. notifiche push alla creazione eventi/comunicazioni) |
| `server/` | Node.js + Express | API custom e invio centralizzato notifiche push (FCM) |
| `android/` | Capacitor | Progetto nativo per la compilazione APK Android |

---

## 🚀 Funzionalità Dettagliate

### 🔐 Autenticazione e Login
-   **Login con Email e Password**: Autenticazione tramite credenziali registrate dal Direttivo.
-   **Sessione Persistente**: Il profilo viene salvato in `localStorage` e sincronizzato in tempo reale con Firestore tramite `onSnapshot`.
-   **Protezione Route**: Tutte le pagine dell'app sono protette tramite un componente `ProtectedRoute`. Accesso alla Dashboard Direttivo e alla Logistica è riservato ai ruoli Presidente e Direttivo.

---

### 🏢 Architettura Multi-Tenant e Gestione Associazioni
-   **Selezione dell'Associazione (Hub)**: La schermata iniziale di benvenuto mostra esclusivamente la lista delle associazioni a cui accedere, offrendo un hub ordinato e pulito.
-   **Gestione Associazioni (Superadmin Dashboard)**: Accessibile all'amministratore per creare, modificare ed eliminare associazioni.
-   **Dati dell'Associazione**: Possibilità di impostare il nome, il logo e la città di riferimento per ciascun tenant.
-   **Eliminazione Protetta**: L'eliminazione di un'associazione richiede l'inserimento della password dell'account amministratore globale (`admin@mail.com`) a scopo di sicurezza.

---

### 🏠 Home Dashboard
-   **Banner di Benvenuto**: Saluto personalizzato con avatar, data corrente, ruolo dell'utente e il nome dell'associazione corrente a cui si è connessi.
-   **Meteo Dinamico**: Mostra il meteo locale in base alla città configurata per l'associazione corrente (geocodificata tramite Open-Meteo API).
-   **Evento Imminente**: Visualizzazione dell'evento più prossimo con card interattiva. Le emergenze vengono evidenziate con un'animazione a impulsi rossi.
-   **Calendario Disponibilità**: Widget calendario mensile con navigazione tra mesi e visualizzazione degli eventi pianificati.
-   **Comunicazioni Recenti**: Lista delle ultime comunicazioni ricevute nella sidebar laterale (o sotto la sezione eventi su mobile).
-   **Accesso Rapido alla Dashboard**: Pulsante dedicato per Presidente e Direttivo per accedere direttamente al Pannello di Controllo.

---

### 👥 Gestione Utenti e Ruoli

#### Ruoli Gerarchici
| Ruolo | Permessi |
|---|---|
| **Amministratore di Sistema** (`admin@mail.com`) | Gestione globale delle associazioni (Superadmin) e abilitato allo **Switch Profile** per impersonare qualsiasi volontario. |
| **Presidente** | Controllo totale a livello di singola associazione. Può resettare le password degli utenti. |
| **Direttivo** | Gestione operativa completa: eventi, comunicazioni, volontari, logistica. Ruoli interni: Vicepresidente, Segretario, Tesoriere, Consigliere, Responsabile Mezzi, Responsabile Unità Cinofila, Responsabile Cucina. |
| **Volontario** | Accesso a eventi, comunicazioni, profilo personale e impostazioni. Può avere il ruolo speciale "Cinofilo". |

#### 🔄 Switch Profile (Impersonation)
-   **Accesso Rapido**: Riservato solo per l'account `admin@mail.com`. Di fianco ad ogni volontario nell'elenco di gestione (`/admin`) è presente un pulsante per effettuare lo switch di profilo ed impersonare l'utente.
-   **Ritorno Istantaneo**: Durante l'impersonificazione, viene mostrato un pulsante fluttuante a schermo ("Torna all'account Admin") per ripristinare all'istante la sessione principale di amministratore.

#### Pannello Amministrazione Volontari (`/admin`)
-   **CRUD Completo**: Creazione, lettura, modifica ed eliminazione di profili volontari.
-   **Dati Anagrafici Dettagliati**: Nome (supporto nomi composti con campi separati nome/cognome), cognome, data e luogo di nascita, codice fiscale, email, telefono, indirizzo, città di residenza, ID Emercomnet.
-   **Dati Aggiuntivi**: Gruppo sanguigno, lingue parlate, informazioni datore di lavoro.
-   **Documenti d'Identità**: Carta d'identità, patente, passaporto con relative scadenze.
-   **Foto Profilo con Crop**: Upload immagine con ritaglio circolare interattivo (`react-image-crop`) e upload su Firebase Storage.
-   **Specializzazioni e Certificazioni**: Gestione di 6 categorie di abilitazioni con tracciamento date di conseguimento e scadenza:
    -   *Formazione Base & Sicurezza*: Corso 4 ore, Corso 12 ore, Caposquadra.
    -   *Radio & Sala Operativa*: Radio Emercomnet, Radio FIRCB, Sala operativa.
    -   *Sanità & Igiene*: HACCP, BLSD, Primo soccorso, Visita medica, Manovre di disostruzione, Corso operatore 118.
    -   *Operatività*: Motosega, Muletto, Pilota droni.
    -   *Unità Cinofila*: Corso figurante, Corso addestratore.
    -   *Patenti di Guida*: B, BE, C, CE, D, DE.
-   **Alert Scadenze**: Segnalazione automatica di certificazioni in scadenza (≤ 30 giorni) o già scadute nella scheda volontario.
-   **Stato Operativo**: Ogni volontario può essere impostato come "Operativo" o "Non Operativo".
-   **Ricerca e Filtri Avanzati**: Ricerca per nome, filtro per ruolo (incluso Unità Cinofila) e per stato operativo.
-   **Selezione Multipla e Eliminazione di Massa**: Checkbox per selezione e pulsante di eliminazione batch.
-   **Esportazione CSV**: Download dei dati volontari come file CSV.
-   **Importazione CSV**: Upload file CSV per aggiornamento/creazione massiva di profili.
-   **Switch Profile**: Pulsante dedicato accanto a ciascun volontario (visibile solo a `admin@mail.com`) per accedere temporaneamente a quel profilo.
-   **Layout Responsive**: Vista tabella su desktop, vista card su mobile con pulsante floating per aggiungere.

---

### 📅 Calendario Attività (`/events`)
-   **Creazione e Modifica Eventi**: Form completo con titolo, tipologia, data, ora, luogo, descrizione e visibilità.
-   **Tipologie Evento**: Servizio, Esercitazione, Riunione, Emergenza, Formazione — ciascuna con colore tematico.
-   **Visibilità Evento**: Tutti, Solo Direttivo, Solo Cinofili.
-   **Gestione Turni**: Possibilità di definire più turni per evento con orario inizio/fine e numero massimo partecipanti.
-   **Iscrizione agli Eventi**: I volontari possono iscriversi/disiscriversi dagli eventi. Monitoraggio presenze in tempo reale con lista partecipanti visibile nel dettaglio evento.
-   **Vista Lista e Calendario**: Toggle tra visualizzazione a lista cronologica e griglia calendario mensile interattiva.
-   **Filtri Avanzati**: Filtro per tipologia, per data, per partecipazione personale ("I miei eventi") e ricerca testuale.
-   **Deep Link**: Supporto per link diretto a un evento specifico via query parameter (`?eventId=`) o `location.state`.
-   **Sezione Eventi Conclusi**: Gli eventi passati vengono raggruppati in una sezione separata.
-   **Eliminazione con Conferma Modale**: Modal dedicato di conferma per cancellazione sicura.

---

### 📢 Comunicazioni (`/comms`)
-   **Creazione e Modifica**: Form con titolo, argomento, importanza, visibilità, data di scadenza opzionale e contenuto.
-   **Argomenti**: Generale, Servizio, Formazione, Urgente, Direttivo, Cinofili, Altro — ciascuno con tema colore dedicato.
-   **Livelli di Importanza**: Alta, Normale, Bassa.
-   **Visibilità**: Tutti, Solo Direttivo, Solo Cinofili.
-   **Scadenza Automatica**: Le comunicazioni con data di scadenza scompaiono dopo la data impostata.
-   **Filtri Avanzati**: Filtro per argomento e per priorità con dropdown animati, più ricerca testuale.
-   **Dettaglio Modale**: Visualizzazione completa della comunicazione con autore, data e contenuto.

---

### 📊 Pannello di Controllo Direttivo (`/direttivo`)
-   **Statistiche in Tempo Reale**:
    -   Volontari attivi vs totali con barra progresso tasso operatività.
    -   Eventi in corso e in programma con grafico trend a 6 mesi.
    -   Nuove iscrizioni nel mese corrente con grafico trend a 6 mesi.
    -   Allerte urgenti che richiedono attenzione.
-   **Widget Meteo**: Visualizzazione meteo per informazioni operative basata sulla città configurata per l'associazione corrente (con integrazione geocoding ed Open-Meteo).
-   **Widget Scadenze**: Elenco delle certificazioni e documenti in scadenza di tutti i volontari.
-   **Impostazioni Validità**: Configurazione della durata di validità predefinita (in anni) per ogni tipo di certificazione.
-   **Bacheca Programmazione**: Board per annotazioni operative (tipo Evento o Avviso) con creazione, visualizzazione e cancellazione.
-   **Layout Adattivo**: Su desktop, vista a 2 colonne (Operativo + Gestione). Su mobile, navigazione a tab con toggle Operativo/Gestione e sub-toggle Scadenze/Impostazioni.

---

### 🚚 Logistica e Mezzi (`/logistics`)

Modulo completo per la gestione di asset, diviso in **3 tab**:

#### 🚗 Mezzi (Vehicles)
-   **CRUD Completo**: Aggiunta, modifica, visualizzazione dettagliata ed eliminazione veicoli.
-   **Dati Veicolo**: Modello, targa, stato (Operativo / Manutenzione / Guasto), patente richiesta, posti, radio, note.
-   **Upload Documenti**: Caricamento e gestione documenti associati al mezzo (es. assicurazione, revisione) con upload su Firebase Storage.
-   **Eliminazione Documenti**: Rimozione documenti con aggiornamento UI immediato.

#### 📦 Magazzino / Attrezzature (Equipment)
-   **CRUD Completo**: Creazione, modifica, visualizzazione dettagliata ed eliminazione attrezzature.
-   **Dati Attrezzatura**: Nome, categoria (Elettrico, Idraulico, Sanitario, DPI, Radio, Logistica, Altro), sede, stato (Funzionante / Da Revisionare / Rotto), quantità, data scadenza, note.
-   **Ubicazione**: Tracciamento posizione (Sede, Cementeria/Magazzino, o assegnato su specifico Mezzo).
-   **Filtri Avanzati**: Filtro per stato, categoria e ubicazione.

#### 👕 Divise (Uniforms)
-   **CRUD Completo**: Gestione completa del vestiario.
-   **Dati Divisa**: Nome, taglia (XS-3XL, Unica), stagione (Estiva, Invernale, 4 Stagioni), stato (Nuova / Buona / Usurata / Da Sostituire), quantità, note.
-   **Filtri Avanzati**: Filtro per stato, taglia e stagione.

#### Funzionalità Trasversali (tutti i tab)
-   **Ricerca Globale**: Ricerca per nome, targa, sede, volontario.
-   **Esportazione CSV**: Download della lista filtrata in formato CSV.
-   **Importazione CSV**: Upload CSV per aggiornamento/creazione massiva.
-   **Eliminazione con Conferma Modale**.
-   **FAB Mobile**: Pulsante floating per aggiunta rapida.

---

### 👤 Profilo Volontario (`/profile`)
-   **Visualizzazione Dati Personali**: Data di nascita, codice fiscale, luogo di nascita, residenza, indirizzo.
-   **Informazioni di Contatto**: Email e telefono.
-   **Documenti d'Identità**: Carta d'identità, patente, passaporto con relative scadenze.
-   **Ulteriori Informazioni**: Gruppo sanguigno, lingue parlate, dati datore di lavoro.
-   **Specializzazioni e Patenti**: Raggruppate per categoria con icone e colori dedicati.
-   **Alert Scadenze**: Notifica in-page per certificazioni e documenti in scadenza o scaduti (≤ 30 giorni).
-   **Upload Foto Profilo**: Con ritaglio circolare interattivo.
-   **Modifica Password**: Form dedicato con verifica password corrente, nuova password e conferma.
-   **Logout**: Disconnessione dal profilo con pulizia sessione.

---

### ⚙️ Impostazioni (`/settings`)
-   **Notifiche Push**: Toggle per attivare/disattivare le notifiche push (Web e Native).
-   **Accessibilità — Testo Maiuscolo**: Toggle per forzare il testo in maiuscolo su tutta l'interfaccia (modalità accessibilità).
-   **Tema Scuro**: Toggle per il dark mode (disponibile solo per account developer).

---

### 🔔 Notifiche Push
-   **Multipiattaforma**: Supporto contemporaneo per Web Push (FCM con Service Worker) e Push Native Android (Capacitor).
-   **Attivazione Interattiva Web**: Richiesta permessi con feedback toast e bottone floating per attivare le notifiche.
-   **Notifiche in Foreground**: Le notifiche ricevute con l'app in primo piano vengono mostrate come toast personalizzati animati.
-   **Sincronizzazione Token FCM**: Il token viene automaticamente salvato nel profilo Firestore dell'utente per targeting accurato.
-   **Targeting per Ruolo**: Le Cloud Functions inviano notifiche solo ai volontari interessati (es. comunicazioni "Cinofili" solo ai cinofili).
-   **Disattivazione**: Rimozione token da Firestore e revoca permessi.

---

### 📱 PWA & Mobile
-   **Progressive Web App**: Service Worker per notifiche in background e funzionamento offline.
-   **Prompt Installazione**: Modal personalizzato per l'installazione dell'app come PWA con intercettazione dell'evento `beforeinstallprompt`.
-   **Bottom Navigation**: Barra di navigazione fissa in basso su mobile con icone per Home, Eventi, Comunicazioni, Profilo e Impostazioni.
-   **Android Nativo**: Compilazione via Capacitor con supporto push notifications native, canali di notifica Android e Live Updates.
-   **Anti-Zoom**: Disabilitazione dello zoom touch nativo per una migliore esperienza utente in-app.

---

## 🛠️ Sviluppo Locale e Firebase Emulator Suite

Per lo sviluppo e il testing locale senza intaccare il database di produzione, utilizziamo la **Firebase Local Emulator Suite**. Questo sistema emula in locale Firestore, Authentication, Storage, Functions e Hosting.

### 📋 Prerequisiti
-   Node.js (v18+) e npm
-   Firebase CLI (`npm install -g firebase-tools`)
-   **Java JRE/JDK** (necessario per far girare gli emulatori locali di Firestore/Storage). Verifica con `java -version` o installalo con `brew install openjdk`.

---

### 1. Configurazione Iniziale

#### Client (Frontend)
1. Installa le dipendenze:
   ```bash
   cd client
   npm install
   ```
2. In sviluppo locale, se avviato con `npm run dev`, il client si collegherà automaticamente agli emulatori locali se rileva l'ambiente di sviluppo. Le credenziali di Firebase sono configurate in [firebase.js](file:///Users/andrea/App%20Personali/La-Chintana-App/client/src/services/firebase.js).

#### Server (Backend Express)
1. Installa le dipendenze:
   ```bash
   cd server
   npm install
   ```
2. Crea un file `.env` dentro la cartella `/server` per forzare l'SDK Admin ad agganciarsi agli emulatori locali:
   ```env
   PORT=3000
   FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"
   FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099"
   FIREBASE_STORAGE_EMULATOR_HOST="127.0.0.1:9199"
   ```
   *Nota: Quando sono presenti queste variabili d'ambiente, il server non necessita della chiave di produzione `serviceAccountKey.json` per funzionare in locale.*

#### Cloud Functions
1. Installa le dipendenze:
   ```bash
   cd functions
   npm install
   ```

---

### 2. Sincronizzazione Dati (Produzione ↔ Locale)

#### A. Da Produzione a Locale (Sincronizzazione Iniziale)
Se hai bisogno dei dati reali di produzione per testare localmente:

1. **Esportazione Utenti (Auth)**:
   ```bash
   firebase auth:export utenti_produzione.json --project chintana-events-handler
   ```
2. **Sincronizzazione Firestore**:
   * Assicurati che la chiave `serviceAccountKey.json` sia presente nella cartella `/server`.
   * Avvia gli emulatori (vedi sezione successiva) e in un altro terminale avvia lo script:
     ```bash
     node server/sync-firestore.js
     ```
     *Lo script copierà ricorsivamente l'intera struttura di produzione sul tuo emulatore locale.*

#### B. Da Locale a Produzione (Simulatore → Firebase Cloud)
Se desideri spingere i dati Firestore ed i file Storage creati nell'emulatore locale verso l'ambiente di produzione reale:

1. Assicurati che la chiave `serviceAccountKey.json` sia presente nella cartella `/server`.
2. Esegui il comando di sincronizzazione dalla root del progetto:
   ```bash
   npm run sync:prod
   ```
   *oppure*:
   ```bash
   node server/sync-local-to-prod.js
   ```
   *Lo script sincronizzerà tutti i documenti Firestore e caricherà i file di Cloud Storage sul progetto di produzione.*

---

### 3. ▶️ Avvio del Flusso di Sviluppo

Avvia i seguenti servizi in terminali separati per avviare l'intero ambiente locale:

#### Terminale 1: Emulatori Firebase
```bash
firebase emulators:start --import=./emulator-data --export-on-exit
```
-   **Emulator UI**: Accedi a `http://127.0.0.1:4000` per gestire graficamente Firestore, Auth e Storage locali.
-   **Persistenza dei Dati**: I flag `--import` e `--export-on-exit` fanno sì che tutti i dati creati o modificati in locale (utenti e documenti) non vadano persi quando spegni l'emulatore.

#### Terminale 2: Server API Custom
```bash
cd server
npm run dev
```
Il server girerà su `http://localhost:3000` collegato al database locale dell'emulatore.

#### Terminale 3: Client Frontend (Vite)
```bash
cd client
npm run dev
```
La PWA sarà accessibile su `http://localhost:5173`. Si collegherà in automatico agli emulatori locali.

---

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

---

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

---

## 🧰 Stack Tecnologico

| Layer | Tecnologie |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Ionic Framework, Lucide Icons |
| **State & Data** | Firebase Firestore (real-time sync via `onSnapshot`), Firebase Storage |
| **Auth** | Firebase Authentication (Custom Token + Anonymous) |
| **Notifiche** | Firebase Cloud Messaging (FCM), Capacitor Push Notifications |
| **Backend** | Firebase Cloud Functions, Node.js + Express |
| **Mobile** | Capacitor (Android), Service Worker (PWA) |
| **Utilities** | react-image-crop, CSV import/export custom |