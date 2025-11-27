# 🛡️ La Chintana - Portale Protezione Civile

Applicazione web gestionale per il coordinamento dei volontari della Protezione Civile "La Chintana".
Il portale permette la gestione operativa di eventi, comunicazioni, turni e anagrafica dei volontari.

## 🚀 Funzionalità Principali

### 👥 Gestione Utenti e Ruoli
- **Autenticazione**: Accesso sicuro con email/password.
- **Ruoli**:
  - **Presidente**: Accesso completo a tutte le funzionalità.
  - **Direttivo**: Gestione operativa e amministrativa.
  - **Volontario**: Accesso alle proprie attività e comunicazioni.
- **Profilo Utente**: Gestione dati anagrafici, contatti e specializzazioni (es. Patenti, Corsi Sicurezza, Primo Soccorso).

### 📅 Gestione Eventi e Attività
- **Calendario**: Visualizzazione mensile e lista delle attività.
- **Tipologie Eventi**: Servizi, Esercitazioni, Riunioni, Emergenze, Formazione.
- **Iscrizioni**: I volontari possono dare la propria disponibilità per gli eventi.
- **Monitoraggio**: Visualizzazione dei partecipanti in tempo reale.

### 📢 Comunicazioni
- **Bacheca Avvisi**: Sistema di messaggistica interna per comunicazioni ufficiali.
- **Priorità**: Avvisi con diversi livelli di importanza (Alta, Normale, Bassa).
- **Filtri**: Ricerca per argomento e priorità.

### 🛠️ Pannello di Amministrazione
- **Gestione Organico**: Aggiunta, modifica e visualizzazione dettagliata dei volontari.
- **Assegnazione Ruoli**: Gestione delle cariche e delle specializzazioni.

## 💻 Stack Tecnologico

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS, Lucide React (Icone)
- **Backend & Database**: Firebase (Authentication, Firestore, Storage)
- **Linguaggio**: JavaScript (ESModules)

## 📦 Installazione e Avvio

1.  **Clona il repository**
    ```bash
    git clone https://github.com/tuo-username/protezione-civile.git
    cd protezione-civile
    ```

2.  **Installa le dipendenze**
    ```bash
    npm install
    ```

3.  **Configura Firebase**
    Assicurati di avere le credenziali Firebase configurate nel file `src/App.jsx` (o meglio, in variabili d'ambiente `.env`).

4.  **Avvia l'ambiente di sviluppo**
    ```bash
    npm run dev
    ```

5.  **Build per produzione**
    ```bash
    npm run build
    ```

6.  **Anteprima della build**
    Per visualizzare l'anteprima della build di produzione (accessibile anche da rete locale):
    ```bash
    npm run preview -- --host
    ```

## 📂 Struttura del Progetto

```
src/
├── assets/         # Immagini e risorse statiche
├── App.jsx         # Componente principale e logica dell'applicazione
├── main.jsx        # Entry point React
├── index.css       # Stili globali e direttive Tailwind
└── ...
```

## 🔐 Sicurezza e Privacy

L'applicazione gestisce dati sensibili dei volontari. L'accesso è protetto tramite autenticazione Firebase e le regole di sicurezza del database garantiscono che solo gli utenti autorizzati possano accedere alle informazioni riservate.

## 📱 Build Android (APK)

Per generare l'applicazione Android installabile (.apk):

1.  **Genera la build web e sincronizza con Android**
    Esegui questi comandi nella cartella `client`:
    ```bash
    npm run build
    npx cap sync
    ```

2.  **Apri Android Studio**
    ```bash
    npx cap open android
    ```
    Oppure apri manualmente la cartella `client/android` con Android Studio.

3.  **Genera l'APK**
    - In Android Studio, vai su **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
    - Al termine, clicca su "locate" nella notifica per trovare il file `.apk` (solitamente in `client/android/app/build/outputs/apk/debug/app-debug.apk`).

## 🔄 Live Updates (Appflow)

L'app è configurata per ricevere aggiornamenti "over-the-air" senza dover rilasciare una nuova versione sugli store.

### Rilasciare un aggiornamento
Per aggiornare il codice web (JS/CSS/HTML) sui dispositivi che hanno già l'app installata:

1.  **Build Web**:
    ```bash
    npm run build
    ```
2.  **Deploy su Appflow**:
    ```bash
    ionic deploy build --app-id="ff632d26" --channel-name="Production"
    ```
    *Nota: Richiede login a Ionic Appflow.*

Gli utenti riceveranno l'aggiornamento automaticamente al successivo riavvio dell'app.

## Credenziali di Test

**Presidente**
- email: mantelli.alessandro@gmail.com
- password: 1234

**Volontario**
- email: andrea8102003@gmail.com
- password: 1234

