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

## 🌍 Deployment & Aggiornamenti
Questo progetto vive su due piattaforme simultaneamente. Usa il metodo corretto per aggiornare la versione desiderata.

### 1. Versione Web (PC, iOS, Browser)
Per aggiornare il sito web (PWA) che usi da computer o iPhone.

1.  **Build & Deploy**:
    ```bash
    npm run build --prefix client
    firebase deploy
    ```
2.  **Verifica**: Visita l'URL del sito. Potrebbe servire un refresh forzato o svuotare la cache.

*Nota: I plugin nativi (come LiveUpdates) sono disabilitati automaticamente sul web.*

---

### 2. Versione Nativa (App Android)
Per aggiornare l'applicazione `.apk` installata sui telefoni Android.

**A. Prima Installazione (o modifiche Native)**
Se hai modificato plugin, icone o configurazioni native:
1.  Sincronizza: `npx cap sync`
2.  Apri Android Studio: `npx cap open android`
3.  Genera APK e installa col cavo USB / invia file.

**B. Aggiornamento Rapido (Live Updates)**
Se hai modificato solo codice React (pagine, logica JS, CSS):
1.  Assicurati che `capacitor.config.json` abbia `"autoUpdateMethod": "background"`.
2.  Fai una **Web Build** su Ionic Appflow (dashboard online) o da riga di comando:
    ```bash
    ionic deploy build --app-id="ff632d26" --channel-name="Production"
    ```
3.  L'app scaricherà l'aggiornamento in background mentre la usi. Al **prossimo riavvio** (chiudi e riapri), vedrai le novità.

**Debug Live Updates**:
Nelle Impostazioni dell'app (solo Android) c'è un'area "Debug" visibile solo su nativo per forzare il controllo aggiornamenti.

## Credenziali di Test

**Presidente**
- email: mantelli.alessandro@gmail.com
- password: 1234

**Volontario**
- email: andrea8102003@gmail.com
- password: 1234
