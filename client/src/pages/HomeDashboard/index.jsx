import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gauge, List, CalendarDays } from 'lucide-react';
import { useHomeDashboard } from './HomeDashboardLogic';
import { hasAdminAccess } from '../../utils/constants';
import EventCard from '../../components/ui/EventCard';
import CommunicationItem from '../../components/ui/CommunicationItem';
import AvailabilityWidget from '../../components/ui/AvailabilityWidget';
import Avatar from '../../components/ui/Avatar';
import './HomeDashboard.css';

const HomeDashboard = ({ userProfile }) => {
  const { nextEvent, nextEmergency, recentComms, monthEvents, currentMonth, changeMonth, loading } = useHomeDashboard(userProfile);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'

  return (
    <div className="home-dashboard-container">
      {/* Header - Yellow Banner */}
      <header className="mb-4 md:mb-8 pt-0 md:pt-4 px-4 md:px-0">
        <div className="bg-[var(--color-pc-yellow)] p-3 md:p-8 flex items-center gap-6 premium-header-card">
          <div className="hidden md:block">
            <Avatar src={userProfile.photoUrl} name={userProfile.name} size="lg" className="border-4 border-white/30" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5 md:mb-1">
              <span className="bg-blue-500 dark:bg-slate-100 text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                {new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-0.5 md:mb-1">Ciao, {userProfile.name}</h1>
          </div>

          {/* Direttivo Dashboard Button */}
          {hasAdminAccess(userProfile) && (
            <div className="ml-auto">
              <Link
                to="/direttivo"
                className="bg-blue-600 dark:bg-slate-100 hover:bg-blue-700 text-white p-3 rounded-2xl shadow-lg transition-all hover:scale-105 flex items-center justify-center"
                title="Dashboard Direttivo"
              >
                <Gauge strokeWidth={1.5} size={32} />
              </Link>
            </div>
          )}
        </div>
      </header>

      <div className="dashboard-content-grid">
        {/* Left Column: Events & Comms */}
        <div className="dashboard-main-col">

          {/* Events Section */}
          <section className="dashboard-section">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-heading mb-0">Eventi</h2>
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-yellow-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                  title="Vista Lista"
                >
                  <List size={18} />
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-yellow-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                  title="Vista Calendario"
                >
                  <CalendarDays size={18} />
                </button>
              </div>
            </div>

            {viewMode === 'list' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                  <>
                    <div className="h-40 bg-slate-100 rounded-xl animate-pulse"></div>
                    <div className="h-40 bg-slate-100 rounded-xl animate-pulse"></div>
                  </>
                ) : (
                  <>
                    {/* Next Event */}
                    {nextEvent ? (
                      <div className={nextEvent.type === 'Emergenza' ? 'animate-pulse-red' : ''}>
                        <EventCard event={nextEvent} />
                      </div>
                    ) : (
                      <div className="col-span-full h-40">
                        <div className="p-6 text-center bg-white rounded-xl border border-slate-100 dark:border-slate-200 text-slate-400 h-full flex items-center justify-center">
                          <p>Nessun evento in programma</p>
                        </div>
                      </div>
                    )}

                    {/* Next Emergency (if exists) */}
                    {nextEmergency && nextEmergency.id !== nextEvent?.id && (
                      <div className="animate-pulse-red">
                        <EventCard event={nextEmergency} />
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <AvailabilityWidget
                currentMonth={currentMonth}
                onMonthChange={changeMonth}
                events={monthEvents}
              />
            )}
          </section>

        </div>

        {/* Right Column: Communications */}
        <div className="dashboard-side-col">
          <section className="dashboard-section">
            <h2 className="section-heading">Comunicazioni Importanti</h2>
            <div className="flex flex-col gap-4">
              {recentComms.length > 0 ? (
                recentComms.map(comm => (
                  <CommunicationItem key={comm.id} comm={comm} />
                ))
              ) : (
                <div className="h-40">
                  <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-100 dark:border-slate-200">
                    <p>Nessuna comunicazione recente</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HomeDashboard;

