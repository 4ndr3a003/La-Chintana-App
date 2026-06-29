import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Calendar,
    ShieldAlert,
    ArrowLeft,
    Megaphone,
    Plus,
    Trash2
} from 'lucide-react';
import { useDirettivoDashboard } from './DirettivoDashboardLogic';
import './DirettivoDashboard.css';
import WeatherWidget from '../../components/WeatherWidget/WeatherWidget';
import ExpirationWidget from '../../components/ExpirationWidget/ExpirationWidget';
import ValiditySettingsWidget from '../../components/ValiditySettingsWidget/ValiditySettingsWidget';

const DirettivoDashboard = ({ userProfile }) => {
    const navigate = useNavigate();
    const { stats, monthlyStats, planningNotes, addNote, deleteNote, loading, users, validitySettings, updateValiditySettings } = useDirettivoDashboard(userProfile);
    const [newNote, setNewNote] = useState('');
    const [noteType, setNoteType] = useState('event');

    // Mobile Tab State: 'operative' or 'management'
    const [activeTab, setActiveTab] = useState('operative');

    // Mobile Sub-Tab for Expiration/Settings: 'list' or 'settings'
    const [expiryTab, setExpiryTab] = useState('list');

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    const handleAddNote = () => {
        if (newNote.trim()) {
            addNote(newNote, noteType);
            setNewNote('');
        }
    };

    const maxEvents = Math.max(...monthlyStats, 1);

    return (
        <div className="direttivo-dashboard-container">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <button
                            onClick={() => navigate('/')}
                            className="back-btn"
                        >
                            <ArrowLeft size={20} className="text-slate-600" />
                        </button>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2 sm:gap-3 leading-tight"><ShieldAlert className="text-blue-600 shrink-0 w-6 h-6 sm:w-8 sm:h-8" /> Pannello di Controllo</h1>
                    </div>
                </div>
            </header>

            <div className="dashboard-content">

                {/* Mobile Tabs Navigation (Visible only on < 1024px via CSS) */}
                <div className="mobile-tabs-container">
                    <button
                        className={`mobile-tab-btn ${activeTab === 'operative' ? 'active' : ''}`}
                        onClick={() => setActiveTab('operative')}
                    >
                        <ShieldAlert size={18} />
                        <span>Operativo</span>
                    </button>
                    <button
                        className={`mobile-tab-btn ${activeTab === 'management' ? 'active' : ''}`}
                        onClick={() => setActiveTab('management')}
                    >
                        <Calendar size={18} />
                        <span>Gestione</span>
                    </button>
                </div>

                {/* Stats Cards Row (Horizontal Scroll on Mobile) */}
                <div className="stats-grid">
                    {/* Volunteers Card */}
                    <div className="stat-card">
                        <div>
                            <div className="stat-header">
                                <span className="stat-title">Volontari Attivi</span>
                                <span className="stat-badge badge-success">Attivi</span>
                            </div>
                            <div className="dashboard-stat-value">{stats.volunteers.active}</div>
                            <div className="stat-subtext">su {stats.volunteers.total} registrati</div>
                        </div>
                        {/* Progress Bar for Active/Total */}
                        <div className="mt-4">
                            <div className="flex justify-between text-xs mb-1 text-slate-500 font-medium">
                                <span>Tasso Operatività</span>
                                <span>{Math.round((stats.volunteers.active / (stats.volunteers.total || 1)) * 100)}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                                    style={{ width: `${(stats.volunteers.active / (stats.volunteers.total || 1)) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Events Card */}
                    <div className="stat-card">
                        <div>
                            <div className="stat-header">
                                <span className="stat-title">Eventi in Corso</span>
                                <span className="stat-badge badge-warning">In Corso</span>
                            </div>
                            <div className="dashboard-stat-value">{stats.events.inProgress}</div>
                            <div className="stat-subtext">{stats.events.upcoming} in programma</div>
                        </div>
                        {/* 6-Month Trend Chart */}
                        <div className="stat-chart-mini">
                            {stats.events.trend && stats.events.trend.map((val, i) => (
                                <div
                                    key={i}
                                    className={`stat-bar ${i === 5 ? 'active bar-warning' : ''}`}
                                    style={{ height: `${Math.max((val / (Math.max(...stats.events.trend) || 1)) * 100, 20)}%` }}
                                ></div>
                            ))}
                        </div>
                    </div>

                    {/* New Members Card */}
                    <div className="stat-card">
                        <div>
                            <div className="stat-header">
                                <span className="stat-title">Nuove Iscrizioni</span>
                                <span className="stat-badge badge-info">Mese</span>
                            </div>
                            <div className="dashboard-stat-value">{stats.volunteers.newThisMonth}</div>
                            <div className="stat-subtext">Ultimi 30 giorni</div>
                        </div>
                        {/* 6-Month Trend Chart */}
                        <div className="stat-chart-mini">
                            {stats.volunteers.trend && stats.volunteers.trend.map((val, i) => (
                                <div
                                    key={i}
                                    className={`stat-bar ${i === 5 ? 'active bar-info' : ''}`}
                                    style={{ height: `${Math.max((val / (Math.max(...stats.volunteers.trend) || 1)) * 100, 20)}%` }}
                                ></div>
                            ))}
                        </div>
                    </div>

                    {/* Alerts Card */}
                    <div className="stat-card alert">
                        <div>
                            <div className="stat-header">
                                <span className="stat-title alert-text">Allerte Urgenti</span>
                                <ShieldAlert size={16} className="icon-danger" />
                            </div>
                            <div className="dashboard-stat-value alert-text">{stats.alerts.urgent}</div>
                            <div className="stat-subtext alert-text">Richiedono attenzione</div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="dashboard-main-grid">

                    {/* Left Column (Operational: Weather, Expiry, Validity) */}
                    <div className={`left-column ${activeTab !== 'operative' ? 'mobile-hidden' : ''}`}>

                        <section>
                            <WeatherWidget userProfile={userProfile} />
                        </section>

                        {/* DESKTOP LAYOUT (>= 1024px) - Side by Side, no unified card */}
                        <div className="desktop-widgets-grid hidden lg:grid grid-cols-2 gap-6">
                            <section className="h-[400px]">
                                <ExpirationWidget users={users} />
                            </section>
                            <section className="h-[400px]">
                                <ValiditySettingsWidget
                                    settings={validitySettings}
                                    onUpdate={updateValiditySettings}
                                    loading={loading}
                                />
                            </section>
                        </div>

                        {/* MOBILE LAYOUT (< 1024px) - Unified Card with Toggle */}
                        <div className="mobile-unified-card lg:hidden dashboard-card h-[500px] flex flex-col p-4">
                            {/* Card Header with Toggle */}
                            <div className="flex flex-col items-center gap-4 mb-4">
                                <div className="mobile-sub-toggle">
                                    <button
                                        className={`sub-toggle-btn ${expiryTab === 'list' ? 'active' : ''}`}
                                        onClick={() => setExpiryTab('list')}
                                    >
                                        Scadenze
                                    </button>
                                    <button
                                        className={`sub-toggle-btn ${expiryTab === 'settings' ? 'active' : ''}`}
                                        onClick={() => setExpiryTab('settings')}
                                    >
                                        Impostazioni
                                    </button>
                                </div>
                            </div>

                            {/* Headless Content */}
                            <div className="flex-1 overflow-hidden">
                                {expiryTab === 'list' ? (
                                    <ExpirationWidget users={users} headless={true} />
                                ) : (
                                    <ValiditySettingsWidget
                                        settings={validitySettings}
                                        onUpdate={updateValiditySettings}
                                        loading={loading}
                                        headless={true}
                                    />
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column (Management: Planning) */}
                    <div className={`right-column ${activeTab !== 'management' ? 'mobile-hidden' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Planning Board */}
                        <section className="dashboard-card h-full">
                            <div className="card-header">
                                <h3 className="card-title">Bacheca Programmazione</h3>
                            </div>

                            {/* Input Area */}
                            <div className="planning-input-container">
                                <input
                                    type="text"
                                    placeholder="Nuova idea o appunto..."
                                    className="planning-input"
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                                />
                                <div className="planning-controls">
                                    <select
                                        className="planning-type-select"
                                        value={noteType}
                                        onChange={(e) => setNoteType(e.target.value)}
                                    >
                                        <option value="event">Evento</option>
                                        <option value="comm">Avviso</option>
                                    </select>
                                    <button className="planning-add-btn" onClick={handleAddNote}>
                                        <Plus size={18} />
                                        <span>Aggiungi</span>
                                    </button>
                                </div>
                            </div>

                            {/* Notes List */}
                            <div className="planning-list">
                                {planningNotes.length > 0 ? (
                                    planningNotes.map(note => (
                                        <div key={note.id} className="planning-item">
                                            <div className={`planning-icon ${note.type}`}>
                                                {note.type === 'event' ? <Calendar size={16} /> : <Megaphone size={16} />}
                                            </div>
                                            <div className="planning-content">
                                                <p className="planning-text">{note.text}</p>
                                                <p className="planning-date">
                                                    {note.createdAt ? new Date(note.createdAt.seconds * 1000).toLocaleDateString('it-IT') : 'Adesso'}
                                                </p>
                                            </div>
                                            <button className="planning-delete-btn" onClick={() => deleteNote(note.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">Nessun appunto in bacheca</div>
                                )}
                            </div>
                        </section>

                    </div>

                </div>


            </div>
        </div>
    );
};

export default DirettivoDashboard;


