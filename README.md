# 🛡️ La Chintana Fenix - Portale Protezione Civile

Applicazione gestionale moderna per il coordinamento dei volontari della Protezione Civile **"La Chintana Fenix"**. Il sistema unifica la gestione operativa, le comunicazioni, la logistica e le attività di volontariato in un'unica piattaforma accessibile via **Web (PWA)** e **App Mobile Android** (via Capacitor).

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

### 🏠 Home Dashboard
-   **Banner di Benvenuto**: Saluto personalizzato con avatar, data corrente e ruolo dell'utente.
-   **Evento Imminente**: Visualizzazione dell'evento più prossimo con card interattiva. Le emergenze vengono evidenziate con un'animazione a impulsi rossi.
-   **Calendario Disponibilità**: Widget calendario mensile con navigazione tra mesi e visualizzazione degli eventi pianificati.
-   **Comunicazioni Recenti**: Lista delle ultime comunicazioni ricevute nella sidebar laterale (o sotto la sezione eventi su mobile).
-   **Accesso Rapido alla Dashboard**: Pulsante dedicato per Presidente e Direttivo per accedere direttamente al Pannello di Controllo.

---

### 👥 Gestione Utenti e Ruoli

#### Ruoli Gerarchici
| Ruolo | Permessi |
|---|---|
| **Presidente** | Super-admin con controllo totale. Può resettare le password degli utenti. |
| **Direttivo** | Gestione operativa completa: eventi, comunicazioni, volontari, logistica. Ruoli interni: Vicepresidente, Segretario, Tesoriere, Consigliere, Responsabile Mezzi, Responsabile Unità Cinofila, Responsabile Cucina. |
| **Volontario** | Accesso a eventi, comunicazioni, profilo personale e impostazioni. Può avere il ruolo speciale "Cinofilo". |

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
-   **Widget Meteo**: Integrazione meteo per informazioni operative.
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

## 🛠️ Installazione e Setup

### Prerequisiti
-   Node.js (v18+ raccomandato)
-   npm
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

---

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