import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import {
    CloudRain,
    Sun,
    Cloud,
    Wind,
    Thermometer,
    Droplets,
    MapPin,
    AlertTriangle,
    ShieldCheck,
    CloudLightning,
    Snowflake,
    ExternalLink
} from 'lucide-react';
import './WeatherWidget.css';

const WeatherWidget = ({ userProfile }) => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [loadingAlerts, setLoadingAlerts] = useState(true);
    const [coords, setCoords] = useState(null);

    // Hardcoded fallback location for Morano sul Po (AL)
    const DEFAULT_COORDS = { lat: 45.1667, lon: 8.3667, name: 'Morano sul Po' };

    useEffect(() => {
        const fetchLocationAndWeather = async () => {
            let city = 'Morano sul Po';
            let currentCoords = DEFAULT_COORDS;

            if (userProfile?.associationId) {
                try {
                    const docSnap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'associations', userProfile.associationId));
                    if (docSnap.exists() && docSnap.data().city) {
                        city = docSnap.data().city;
                    }
                } catch (e) {
                    console.error("Error fetching city:", e);
                }
            }

            try {
                const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=it`);
                if (geoRes.ok) {
                    const geoData = await geoRes.json();
                    if (geoData.results && geoData.results.length > 0) {
                        currentCoords = {
                            lat: geoData.results[0].latitude,
                            lon: geoData.results[0].longitude,
                            name: city
                        };
                    }
                }
            } catch (e) {
                console.error("Geocoding error:", e);
            }
            
            setCoords(currentCoords);

            try {
                // Fetch Weather from Open-Meteo
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${currentCoords.lat}&longitude=${currentCoords.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
                );

                if (!response.ok) throw new Error('Meteo unavailable');
                const data = await response.json();
                setWeather(data);
                setLoading(false);
            } catch (err) {
                console.error("Weather fetch error:", err);
                setError('Dati meteo non disponibili');
                setLoading(false);
            }
        };

        const fetchArpaAlerts = async () => {
            try {
                // Fetch Arpa Piemonte Widget HTML via Proxy
                // Using the specific code for Morano sul Po: 006109
                const response = await fetch('/api/arpa_widget/006109');

                if (!response.ok) throw new Error('Arpa widget unavailable');

                const text = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, "text/html");

                const newAlerts = [];

                // Helper to map color classes to severity and colors
                const getSeverityFromClass = (className) => {
                    if (className.includes('td_all_3')) return { level: 'Extreme', color: 'text-red-600', label: 'Allerta Rossa' };
                    if (className.includes('td_all_2')) return { level: 'Severe', color: 'text-orange-500', label: 'Allerta Arancione' };
                    if (className.includes('td_all_1')) return { level: 'Moderate', color: 'text-yellow-500', label: 'Allerta Gialla' };
                    // td_all_0 is Green, td_all_4 is White
                    return null;
                };

                // Parse the specific table rows we identified in the widget HTML
                // The table contains rows like: <th>Idrogeologico</th> <td class="td_all_0">VERDE</td>
                const rows = doc.querySelectorAll('table.allerta tbody tr');

                rows.forEach((row, index) => {
                    const th = row.querySelector('th');
                    if (!th) return;

                    const riskType = th.textContent.trim();
                    // Skip header rows or irrelevant rows
                    if (!['Idrogeologico', 'Idraulico', 'Temporali', 'Neve', 'Valanghe'].includes(riskType)) return;

                    // The status is usually in the first td
                    const td = row.querySelector('td');
                    if (!td) return;

                    const className = td.className || '';
                    const statusText = td.textContent.trim();
                    const severityInfo = getSeverityFromClass(className);

                    if (severityInfo) {
                        newAlerts.push({
                            id: index,
                            title: severityInfo.label,
                            severity: severityInfo.level,
                            desc: `${riskType}: ${statusText}`,
                            time: 'Oggi/Domani' // Widget usually shows 24/48h view, simplifying for now
                        });
                    }
                });

                setAlerts(newAlerts);
                setLoadingAlerts(false);

            } catch (err) {
                console.warn("Arpa Widget fetch failed:", err);
                setLoadingAlerts(false);
            }
        };

        fetchLocationAndWeather();
        fetchArpaAlerts();
    }, [userProfile?.associationId]);

    // WMO Weather interpretation codes
    const getWeatherIcon = (code) => {
        if (code === 0) return <Sun className="weather-icon-large" />; // Clear sky
        if (code >= 1 && code <= 3) return <Cloud className="weather-icon-large" />; // Partly cloudy
        if (code >= 45 && code <= 48) return <Cloud className="weather-icon-large" />; // Fog
        if (code >= 51 && code <= 67) return <CloudRain className="weather-icon-large" />; // Drizzle/Rain
        if (code >= 71 && code <= 77) return <Snowflake className="weather-icon-large" />; // Snow
        if (code >= 80 && code <= 82) return <CloudRain className="weather-icon-large" />; // Showers
        if (code >= 95) return <CloudLightning className="weather-icon-large" />; // Thunderstorm
        return <Sun className="weather-icon-large" />;
    };

    const getWeatherDesc = (code) => {
        const codes = {
            0: 'Cielo Sereno',
            1: 'Poco Nuvoloso',
            2: 'Parzialmente Nuvoloso',
            3: 'Nuvoloso',
            45: 'Nebbia',
            48: 'Nebbia con brina',
            51: 'Pioggerella Leggera',
            53: 'Pioggerella Moderata',
            55: 'Pioggerella Intensa',
            61: 'Pioggia Debole',
            63: 'Pioggia Moderata',
            65: 'Pioggia Forte',
            71: 'Neve Debole',
            73: 'Neve Moderata',
            75: 'Neve Forte',
            95: 'Temporale',
            96: 'Temporale con Grandine',
            99: 'Temporale Forte'
        };
        return codes[code] || 'Condizioni Variabili';
    };

    if (loading) return <div className="weather-widget animate-pulse h-64 bg-slate-100 rounded-xl"></div>;
    if (error) return (
        <div className="weather-widget error">
            <div className="text-red-500 font-bold">Meteo non disponibile</div>
            <div className="text-sm text-slate-500">Controlla la connessione</div>
        </div>
    );

    const current = weather.current;

    return (
        <div className="weather-widget">
            <div className="weather-header">
                <div className="weather-location">
                    <MapPin size={16} />
                    <span>{coords ? coords.name : DEFAULT_COORDS.name}</span>
                </div>
                {/* Status Indicator */}
                <div className={`text-xs font-bold px-2 py-1 rounded-full ${alerts.length > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {alerts.length > 0 ? 'ALLERTA ATTIVA' : 'NESSUNA CRITICITÀ'}
                </div>
            </div>

            <div className="weather-main">
                <div className="weather-temp-group">
                    {getWeatherIcon(current.weather_code)}
                    <div>
                        <div className="weather-temp">
                            {Math.round(current.temperature_2m)}°
                        </div>
                        <div className="weather-condition">
                            {getWeatherDesc(current.weather_code)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="weather-stats">
                <div className="weather-stat-item">
                    <Wind size={20} className="stat-icon" />
                    <span className="stat-value">{current.wind_speed_10m} <span className="text-xs font-normal">km/h</span></span>
                    <span className="stat-label">Vento</span>
                </div>
                <div className="weather-stat-item">
                    <Droplets size={20} className="stat-icon" />
                    <span className="stat-value">{current.relative_humidity_2m}%</span>
                    <span className="stat-label">Umidità</span>
                </div>
                <div className="weather-stat-item">
                    <Thermometer size={20} className="stat-icon" />
                    <span className="stat-value">{Math.round(current.temperature_2m - (current.wind_speed_10m * 0.1))}°</span>
                    <span className="stat-label">Percepita</span>
                </div>
            </div>

            {/* Alerts Section */}
            <div className="alerts-section">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                        Allerte Arpa Piemonte
                    </h4>
                    <a href="https://www.arpa.piemonte.it/rischi_naturali/widget/comuni/006109" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                        <ExternalLink size={14} />
                    </a>
                </div>

                {loadingAlerts ? (
                    <div className="text-xs text-slate-400 italic">Verifica allerte in corso...</div>
                ) : alerts.length > 0 ? (
                    alerts.map((alert, idx) => (
                        <div key={idx} className={`alert-item severity-${alert.severity}`}>
                            <AlertTriangle className={`alert-icon ${alert.severity === 'Severe' || alert.severity === 'Extreme' ? 'text-red-500' : 'text-yellow-500'}`} size={20} />
                            <div className="alert-content">
                                <div className="alert-title">{alert.title}</div>
                                <div className="text-xs text-slate-600 mb-1 font-medium">{alert.desc}</div>
                                <div className="alert-time">{alert.time}</div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-alerts">
                        <ShieldCheck size={18} />
                        <span>Nessuna allerta ufficiale rilevata</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeatherWidget;
