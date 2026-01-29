import React, { useState } from 'react';
import { Settings, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { SPECIALIZATIONS_DATA } from '../../utils/constants';
import './ValiditySettingsWidget.css';

const ValiditySettingsWidget = ({ settings, onUpdate, loading, headless = false }) => {
    const [localSettings, setLocalSettings] = useState(settings || {});
    const [hasChanges, setHasChanges] = useState(false);

    // Sync with props when they change (initial load)
    React.useEffect(() => {
        if (settings && Object.keys(settings).length > 0) {
            setLocalSettings(settings);
        }
    }, [settings]);

    const handleChange = (course, value) => {
        const val = parseInt(value);
        if (val < 0) return;

        setLocalSettings(prev => ({
            ...prev,
            [course]: val
        }));
        setHasChanges(true);
    };

    const handleSave = () => {
        onUpdate(localSettings);
        setHasChanges(false);
    };

    const containerClass = headless ? "settings-widget-headless" : "settings-widget-container";
    const headerClass = headless ? "settings-header-headless" : "settings-header";

    return (
        <div className={containerClass}>
            <div className={`${headerClass} flex justify-between items-center`}>
                <h3 className="settings-title">
                    <Settings size={20} className="text-blue-600" />
                    Impostazioni Scadenze (in anni)
                </h3>
                {hasChanges && (
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all animate-in fade-in"
                    >
                        {loading ? '...' : <><Save size={14} /> Salva</>}
                    </button>
                )}
            </div>

            <div className="settings-content custom-scrollbar">
                {hasChanges && (
                    <div className="mb-4 text-xs bg-amber-50 text-amber-700 p-2 rounded-lg border border-amber-200 flex items-center gap-2">
                        <AlertCircle size={14} />
                        <span>Modifiche non salvate. Premi 'Salva' per applicare.</span>
                    </div>
                )}

                {Object.entries(SPECIALIZATIONS_DATA).map(([category, data]) => {
                    // Skip "Patenti di Guida" if they don't have custom validity management in list
                    // But actually user might want to set validity for B, C, etc.
                    // Constants have implicit validities (like 5 years for everything as per previous change).
                    // We only show items that are listed in SPECIALIZATIONS_DATA items.

                    if (!data.items) return null;
                    if (category === 'Patenti di Guida') return null;

                    return (
                        <div key={category} className="settings-category">
                            <h4 className={`settings-cat-title ${data.titleColor}`}>
                                {data.icon} {category}
                            </h4>
                            <div className="settings-grid">
                                {data.items.map(item => {
                                    // Check if we have a default in constants to fallback display
                                    const defaultVal = data.validityYears?.[item] ?? 5;
                                    const val = localSettings[item] !== undefined ? localSettings[item] : defaultVal;

                                    return (
                                        <div key={item} className="setting-item">
                                            <span className="setting-label">{item}</span>
                                            <div className="setting-input-wrapper">
                                                <input
                                                    type="number"
                                                    className="setting-input"
                                                    value={val}
                                                    onChange={(e) => handleChange(item, e.target.value)}
                                                    min="0"
                                                />
                                                <span className="setting-unit">Anni</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ValiditySettingsWidget;
