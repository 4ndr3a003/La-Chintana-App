import React, { useState, useEffect } from 'react';
import {
    Sun,
    Cloud,
    CloudRain,
    CloudLightning,
    Snowflake,
    ShieldCheck,
    ShieldAlert,
    CheckCircle,
    XCircle
} from 'lucide-react';

const HeaderInfoWidget = ({ userProfile }) => {
    const [weather, setWeather] = useState(null);
    const [alertLevel, setAlertLevel] = useState('green'); // green, yellow, orange, red
    const [loading, setLoading] = useState(true);

    // Morano sul Po coordinates
    const MORANO_COORDS = { lat: 45.1667, lon: 8.3667 };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch weather
                const weatherRes = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${MORANO_COORDS.lat}&longitude=${MORANO_COORDS.lon}&current=temperature_2m,weather_code&timezone=auto`
                );
                if (weatherRes.ok) {
                    const data = await weatherRes.json();
                    setWeather(data.current);
                }
            } catch (err) {
                console.warn('Weather fetch failed:', err);
            }

            try {
                // Fetch Arpa alerts
                const alertRes = await fetch('https://www.arpa.piemonte.it/export/xmlcap/allerta.xml');
                if (alertRes.ok) {
                    const text = await alertRes.text();
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(text, "text/xml");
                    const infoElements = xmlDoc.getElementsByTagName('info');

                    let maxSeverity = 'green';
                    for (let i = 0; i < infoElements.length; i++) {
                        const severity = infoElements[i].getElementsByTagName('severity')[0]?.textContent;
                        if (severity === 'Extreme') maxSeverity = 'red';
                        else if (severity === 'Severe' && maxSeverity !== 'red') maxSeverity = 'orange';
                        else if (severity === 'Moderate' && maxSeverity === 'green') maxSeverity = 'yellow';
                    }
                    setAlertLevel(maxSeverity);
                }
            } catch (err) {
                console.warn('Alert fetch failed (likely CORS):', err);
            }

            setLoading(false);
        };

        fetchData();
    }, []);

    // Weather icon based on WMO code
    const getWeatherIcon = (code) => {
        if (code === 0) return <Sun size={18} className="text-amber-400" />;
        if (code >= 1 && code <= 3) return <Cloud size={18} className="text-slate-400" />;
        if (code >= 45 && code <= 48) return <Cloud size={18} className="text-slate-500" />;
        if (code >= 51 && code <= 67) return <CloudRain size={18} className="text-blue-400" />;
        if (code >= 71 && code <= 77) return <Snowflake size={18} className="text-cyan-300" />;
        if (code >= 80 && code <= 82) return <CloudRain size={18} className="text-blue-500" />;
        if (code >= 95) return <CloudLightning size={18} className="text-purple-500" />;
        return <Sun size={18} className="text-amber-400" />;
    };

    // Alert badge config
    const alertConfig = {
        green: { label: 'VERDE', bg: 'bg-emerald-500', icon: ShieldCheck },
        yellow: { label: 'GIALLO', bg: 'bg-yellow-400', icon: ShieldAlert },
        orange: { label: 'ARANCIONE', bg: 'bg-orange-500', icon: ShieldAlert },
        red: { label: 'ROSSO', bg: 'bg-red-600 animate-pulse', icon: ShieldAlert }
    };

    // Calculate user operational status (same logic as UserProfileViewLogic)
    const calculateStatus = () => {
        const dbStatus = userProfile?.status || 'Operativo';
        if (dbStatus.toLowerCase() === 'non operativo') return false;

        if (!userProfile?.birthDate) return false;

        const birthDate = new Date(userProfile.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

        const has12HoursCourse = userProfile?.specializations?.includes('Corso 12 ore');
        if (age > 75 || !has12HoursCourse) return false;

        return true;
    };

    const isOperativo = calculateStatus();
    const currentAlert = alertConfig[alertLevel];
    const AlertIcon = currentAlert.icon;

    if (loading) {
        return (
            <div className="flex items-center gap-2">
                <div className="w-16 h-8 md:w-24 md:h-10 bg-white/30 rounded-xl animate-pulse"></div>
                <div className="w-16 h-8 md:w-28 md:h-10 bg-white/30 rounded-xl animate-pulse"></div>
                <div className="w-8 h-8 md:w-28 md:h-10 bg-white/30 rounded-xl animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="header-info-widget flex items-center gap-2 md:gap-3 flex-wrap justify-center md:justify-end">
            {/* Mini Weather Card */}
            {weather && (
                <div className="flex items-center gap-1.5 md:gap-2 bg-white/90 backdrop-blur-md px-2.5 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl shadow-lg shadow-black/5 border border-white/50">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                        {getWeatherIcon(weather.weather_code)}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-extrabold text-sm md:text-lg text-slate-800 leading-tight">{Math.round(weather.temperature_2m)}°</span>
                        <span className="text-[8px] md:text-[10px] text-slate-500 font-medium uppercase tracking-wide hidden md:block">Morano</span>
                    </div>
                </div>
            )}

            {/* Alert Badge */}
            <div className={`flex items-center gap-1.5 md:gap-2 ${currentAlert.bg} text-white px-2.5 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl shadow-lg ${alertLevel === 'red' ? 'shadow-red-500/30' : alertLevel === 'orange' ? 'shadow-orange-500/30' : 'shadow-black/10'}`}>
                <AlertIcon size={16} className="md:w-[18px] md:h-[18px]" strokeWidth={2.5} />
                <div className="flex flex-col">
                    <span className="font-extrabold text-xs md:text-sm leading-tight">{currentAlert.label}</span>
                    <span className="text-[8px] md:text-[9px] font-medium uppercase tracking-wide opacity-80 hidden md:block">Allerta Meteo</span>
                </div>
            </div>

            {/* User Status - Red for non-operativo */}
            <div className={`flex items-center gap-1.5 md:gap-2 ${isOperativo ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-red-500 shadow-red-500/30'} text-white px-2.5 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl shadow-lg`}>
                {isOperativo ? (
                    <CheckCircle size={16} className="md:w-[18px] md:h-[18px]" strokeWidth={2.5} />
                ) : (
                    <XCircle size={16} className="md:w-[18px] md:h-[18px]" strokeWidth={2.5} />
                )}
                <div className="flex flex-col">
                    <span className="font-extrabold text-xs md:text-sm leading-tight">
                        {isOperativo ? 'OK' : 'NO'}
                        <span className="hidden md:inline"> - {isOperativo ? 'OPERATIVO' : 'NON OPERATIVO'}</span>
                    </span>
                    <span className="text-[8px] md:text-[9px] font-medium uppercase tracking-wide opacity-80 hidden md:block">Stato Volontario</span>
                </div>
            </div>
        </div>
    );
};

export default HeaderInfoWidget;
