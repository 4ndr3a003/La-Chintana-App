import React from 'react';
import { Settings as SettingsIcon, Bell, BellOff } from 'lucide-react';

const Settings = ({ enableNotifications, disableNotifications, isNotificationsEnabled }) => {
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
        <div className="bg-white rounded-3xl shadow-sm p-4 md:p-8 border border-[var(--color-slate-100)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-[var(--color-slate-900)]">Notifiche</h3>
          </div>

          <div className="flex flex-wrap md:flex-nowrap items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isNotificationsEnabled ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                {isNotificationsEnabled ? <Bell size={24} /> : <BellOff size={24} />}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-800 truncate">Notifiche Push</h4>
              </div>
            </div>

            <button
              onClick={isNotificationsEnabled ? disableNotifications : enableNotifications}
              className={`relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none shrink-0 ml-auto md:ml-0 ${isNotificationsEnabled ? 'bg-[var(--color-pc-green)]' : 'bg-slate-300'}`}
            >
              <span
                className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${isNotificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`}
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
