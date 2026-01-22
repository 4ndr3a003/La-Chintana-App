import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gauge, List, CalendarDays } from 'lucide-react';
import { useHomeDashboard } from './HomeDashboardLogic';
import { hasAdminAccess } from '../../utils/constants';
import EventCard from '../../components/ui/EventCard';
import CommunicationItem from '../../components/ui/CommunicationItem';
import AvailabilityWidget from '../../components/ui/AvailabilityWidget';
import Avatar from '../../components/ui/Avatar';
import HeaderInfoWidget from '../../components/ui/HeaderInfoWidget';
import './HomeDashboard.css';

const HomeDashboard = ({ userProfile }) => {
  const { nextEvent, nextEmergency, recentComms, monthEvents, currentMonth, changeMonth, loading } = useHomeDashboard(userProfile);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'

  return (
    <div className="home-dashboard-container">
      {/* Header - Yellow Banner */}
      <header className="mb-4 md:mb-8 pt-0 md:pt-4 px-4 md:px-0">
        <div className="bg-[var(--color-pc-yellow)] p-4 md:p-6 premium-header-card">
          {/* Top Row: Avatar, Greeting, Admin Button */}
          <div className={`flex items-center justify-between w-full mb-3`}>
            <div className={`flex items-center gap-4 ${!hasAdminAccess(userProfile) ? 'w-full justify-center' : ''}`}>
              <div className="hidden md:block">
                <Avatar src={userProfile.photoUrl} name={userProfile.name} size="lg" className="border-4 border-white/30" />
              </div>
              <div className={`${!hasAdminAccess(userProfile) ? 'text-center' : ''}`}>
                <div className={`flex items-center gap-2 mb-0.5 ${!hasAdminAccess(userProfile) ? 'justify-center' : ''}`}>
                  <span className="bg-blue-600 text-white text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                </div>
                <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">Ciao, {userProfile.name}</h1>
              </div>
            </div>

            {/* Direttivo Dashboard Button */}
            {hasAdminAccess(userProfile) && (
              <Link
                to="/direttivo"
                className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 md:p-3 rounded-xl shadow-lg transition-all hover:scale-105 flex items-center justify-center shrink-0"
                title="Dashboard Direttivo"
              >
                <Gauge strokeWidth={1.5} size={24} className="md:w-8 md:h-8" />
              </Link>
            )}
          </div>

          {/* Bottom Row: Info Widgets */}
          <div className="flex justify-center md:justify-start">
            <HeaderInfoWidget userProfile={userProfile} />
          </div>
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

