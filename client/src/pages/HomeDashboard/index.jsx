import React from 'react';
import { Link } from 'react-router-dom';
import { Gauge } from 'lucide-react';
import { useHomeDashboard } from './HomeDashboardLogic';
import { hasAdminAccess } from '../../utils/constants';
import EventCard from '../../components/ui/EventCard';
import CommunicationItem from '../../components/ui/CommunicationItem';
import AvailabilityWidget from '../../components/ui/AvailabilityWidget';
import Avatar from '../../components/ui/Avatar';
import './HomeDashboard.css';

const HomeDashboard = ({ userProfile }) => {
  const { nextEvent, nextEmergency, recentComms, monthEvents, currentMonth, changeMonth, loading } = useHomeDashboard(userProfile);

  return (
    <div className="home-dashboard-container">
      {/* Header - Yellow Banner */}
      <header className="mb-8 pt-4 px-4 md:px-0">
        <div className="bg-[var(--color-pc-yellow)] rounded-3xl p-6 md:p-8 flex items-center gap-6 shadow-sm">
          <div className="hidden md:block">
            <Avatar src={userProfile.photoUrl} name={userProfile.name} size="lg" className="border-4 border-white/30" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-1">Ciao, {userProfile.name}</h1>
            <p className="text-slate-800 font-medium opacity-80">Benvenuto nel portale operativo della Protezione Civile.</p>
          </div>

          {/* Direttivo Dashboard Button */}
          {hasAdminAccess(userProfile) && (
            <div className="ml-auto">
              <Link
                to="/direttivo"
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-2xl shadow-lg transition-all hover:scale-105 flex items-center justify-center"
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
            <h2 className="section-heading">Eventi Imminenti</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading ? (
                <>
                  <div className="h-40 bg-slate-100 rounded-2xl animate-pulse"></div>
                  <div className="h-40 bg-slate-100 rounded-2xl animate-pulse"></div>
                </>
              ) : (
                <>
                  {/* Next Event */}
                  {nextEvent ? (
                    <div className={nextEvent.type === 'Emergenza' ? 'animate-pulse-red' : ''}>
                      <EventCard event={nextEvent} />
                    </div>
                  ) : (
                    <div className="p-6 text-center bg-white rounded-2xl border border-slate-100 text-slate-400 h-full flex items-center justify-center">
                      Nessun evento in programma.
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
          </section>

          {/* Communications Section */}
          <section className="dashboard-section">
            <h2 className="section-heading">Comunicazioni Importanti</h2>
            <div className="flex flex-col gap-4">
              {recentComms.length > 0 ? (
                recentComms.map(comm => (
                  <CommunicationItem key={comm.id} comm={comm} />
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 bg-white rounded-3xl border border-slate-100">
                  Nessuna comunicazione recente.
                </div>
              )}
            </div>
          </section>

        </div>

        {/* Right Column: Calendar Widget */}
        <div className="dashboard-side-col">
          <AvailabilityWidget
            currentMonth={currentMonth}
            onMonthChange={changeMonth}
            events={monthEvents}
          />
        </div>
      </div>
    </div>
  );
};

export default HomeDashboard;
