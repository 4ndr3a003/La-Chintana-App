import React from 'react';
import { Settings as SettingsIcon, Bell, BellOff, Moon, Sun } from 'lucide-react';

const Settings = ({ enableNotifications, disableNotifications, isNotificationsEnabled, toggleDarkMode, darkMode }) => {
  return (
    <div className="min-h-[80vh] relative">
      <div className="flex flex-col gap-4 px-1 mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <SettingsIcon className="text-blue-600" size={28} /> Impostazioni
            </h3>
          </div>
        </div>
      </div>

      <div className="space-y-6 mt-6">
        {/* Notifications Section */}
        {/* Notifications Section */}
        {/* Notifications Section */}
        <div className="bg-white dark:bg-[var(--color-slate-100)] rounded-3xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.06)] p-4 md:p-8 border border-slate-100 dark:border-slate-200 transition-colors duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-900">Notifiche</h3>
          </div>

          <div className="flex flex-wrap md:flex-nowrap items-center justify-between p-4 bg-slate-50 dark:bg-[var(--color-slate-50)] rounded-2xl border border-slate-100 dark:border-slate-200 gap-4 transition-colors duration-300">
            <div className="flex items-center gap-4 min-w-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isNotificationsEnabled ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                {isNotificationsEnabled ? <Bell size={24} /> : <BellOff size={24} />}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-800 truncate">Notifiche Push</h4>
              </div>
            </div>

            <button
              onClick={isNotificationsEnabled ? disableNotifications : enableNotifications}
              className={`relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none shrink-0 ml-auto md:ml-0 ${isNotificationsEnabled ? 'bg-[var(--color-pc-green)]' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <span
                className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${isNotificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`}
              />
            </button>
          </div>
        </div>

        {/* Dark Mode Section */}
        <div className="bg-white dark:bg-[var(--color-slate-100)] rounded-3xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.06)] p-4 md:p-8 border border-slate-100 dark:border-slate-200 transition-colors duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-900">Aspetto</h3>
          </div>

          <div className="flex flex-wrap md:flex-nowrap items-center justify-between p-4 bg-slate-50 dark:bg-[var(--color-slate-50)] rounded-2xl border border-slate-100 dark:border-slate-200 gap-4 transition-colors duration-300">
            <div className="flex items-center gap-4 min-w-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${darkMode ? 'bg-indigo-900/50 text-indigo-400' : 'bg-orange-100 text-orange-500'}`}>
                {darkMode ? <Moon size={24} /> : <Sun size={24} />}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-800 truncate">Tema Scuro</h4>
                <p className="text-sm text-slate-500 truncate">
                  {darkMode ? 'Attivato' : 'Disattivato'}
                </p>
              </div>
            </div>

            <button
              onClick={toggleDarkMode}
              className={`relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none shrink-0 ml-auto md:ml-0 ${darkMode ? 'bg-[var(--color-pc-green)]' : 'bg-slate-300'}`}
            >
              <span
                className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${darkMode ? 'translate-x-6' : 'translate-x-0'}`}
              />
            </button>
          </div>
        </div>

        {/* Debug Section - Only visible on Native App */}
        {window.Capacitor?.isNativePlatform() && (
          <div className="bg-red-50 rounded-3xl shadow-sm p-4 md:p-8 border border-red-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-red-900">Area Debug (Native)</h3>
            </div>
            <button
              onClick={async () => {
                try {
                  const module = await import('@capacitor/live-updates');
                  // Check direct exports or default or named 'LiveUpdates'
                  let Plugin = module.LiveUpdates || module.default || module;

                  if (!Plugin || typeof Plugin.sync !== 'function') {
                    if (typeof module.sync === 'function') {
                      Plugin = module;
                    } else {
                      alert('ERRORE: Plugin non riconosciuto. Keys: ' + Object.keys(module).join(', '));
                      return;
                    }
                  }

                  alert('Avvio sync...');
                  try {
                    const result = await Plugin.sync();
                    alert('RISULTATO SYNC: ' + JSON.stringify(result));
                  } catch (syncError) {
                    alert('ERRORE SYNC: ' + (syncError.message || JSON.stringify(syncError)));
                  }
                } catch (e) {
                  alert('ERRORE IMPORT: ' + (e.message || JSON.stringify(e)));
                }
              }}
              className="w-full py-3 px-4 bg-red-600 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-transform"
            >
              Controllo Aggiornamenti Live
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
