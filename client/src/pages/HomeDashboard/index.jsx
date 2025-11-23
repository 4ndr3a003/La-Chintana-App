import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MessageSquare, User, Users, Clock, MapPin } from 'lucide-react';
import { hasAdminAccess } from '../../utils/constants';
import Badge from '../../components/ui/Badge';
import { useHomeDashboard } from './HomeDashboardLogic';
import './HomeDashboard.css';

const HomeDashboard = ({ userProfile }) => {
  const { nextEvent, latestComm } = useHomeDashboard();

  return (
    <div className="home-dashboard-container">
      {/* Welcome Header */}
      <div className="welcome-header">
        <div className="welcome-header-bg-1"></div>
        <div className="welcome-header-bg-2"></div>
        
        <div className="welcome-content">
          <div className="flex items-center gap-3 mb-2 opacity-90">
             <span className="date-badge">
               {new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
             </span>
          </div>
          <h2 className="text-3xl font-black mb-2">Ciao, {userProfile.name.split(' ')[0]}! 👋</h2>
          <p className="text-blue-100 font-medium text-lg max-w-md">
            Benvenuto nel portale operativo. Ecco cosa c'è in programma per te oggi.
          </p>
        </div>
      </div>

      {/* Quick Overview Section */}
      <div className="section-grid">
        {/* Next Event Card */}
        <div className="space-y-3">
           <div className="section-header">
              <h3 className="section-title">
                <Calendar className="text-blue-600" size={20} /> Prossimo Evento
              </h3>
              <Link to="/events" className="see-all-link">Vedi tutti</Link>
           </div>
           
           {nextEvent ? (
             <Link 
               to="/events"
               className="dashboard-card group block"
             >
                <div className={`absolute top-0 left-0 w-1 h-full ${nextEvent.type === 'Emergenza' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                <div className="flex justify-between items-start mb-3">
                   <Badge text={nextEvent.type} color={nextEvent.type === 'Emergenza' ? 'red' : 'blue'} />
                   <span className="text-xs font-bold text-slate-400 uppercase">
                      {new Date(nextEvent.date).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })}
                   </span>
                </div>
                <h4 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">{nextEvent.title}</h4>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                   <div className="flex items-center gap-1.5">
                      <Clock size={14} />
                      <span>{new Date(nextEvent.date).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <MapPin size={14} />
                      <span className="truncate max-w-[100px]">{nextEvent.location}</span>
                   </div>
                </div>
             </Link>
           ) : (
             <div className="empty-state-card">
                <Calendar size={24} className="text-slate-300 mb-2" />
                <p className="text-slate-400 text-sm font-medium">Nessun evento in programma</p>
             </div>
           )}
        </div>

        {/* Latest Communication Card */}
        <div className="space-y-3">
           <div className="section-header">
              <h3 className="section-title">
                <MessageSquare className="text-emerald-600" size={20} /> Ultimo Avviso
              </h3>
              <Link to="/comms" className="see-all-link">Vedi tutti</Link>
           </div>

           {latestComm ? (
             <Link 
               to="/comms"
               className="dashboard-card group block"
             >
                <div className={`absolute top-0 left-0 w-1 h-full ${latestComm.importance === 'Alta' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                <div className="flex justify-between items-start mb-3">
                   <Badge text={latestComm.topic} color="gray" />
                   {latestComm.importance === 'Alta' && <Badge text="Importante" color="red" />}
                </div>
                <h4 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">{latestComm.title}</h4>
                <p className="text-sm text-slate-500 line-clamp-2 mb-3">{latestComm.content}</p>
                <div className="text-xs text-slate-400 font-medium flex justify-between items-center">
                   <span>{new Date(latestComm.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}</span>
                   <span className="italic">da {latestComm.authorName}</span>
                </div>
             </Link>
           ) : (
             <div className="empty-state-card">
                <MessageSquare size={24} className="text-slate-300 mb-2" />
                <p className="text-slate-400 text-sm font-medium">Nessuna comunicazione recente</p>
             </div>
           )}
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h3 className="font-bold text-slate-800 text-lg mb-4 px-1">Accesso Rapido</h3>
        <div className="quick-actions-grid">
          <Link 
            to="/events"
            className="quick-action-button group"
          >
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
              <Calendar size={24} />
            </div>
            <span className="font-bold text-slate-700 text-sm">Bacheca Eventi</span>
          </Link>

          <Link 
            to="/comms"
            className="quick-action-button group"
          >
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
              <MessageSquare size={24} />
            </div>
            <span className="font-bold text-slate-700 text-sm">Comunicazioni</span>
          </Link>

          <Link 
            to="/profile"
            className="quick-action-button group"
          >
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl group-hover:scale-110 transition-transform">
              <User size={24} />
            </div>
            <span className="font-bold text-slate-700 text-sm">Il Mio Profilo</span>
          </Link>

          {hasAdminAccess(userProfile) && (
            <Link 
              to="/admin"
              className="quick-action-button group"
            >
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <span className="font-bold text-slate-700 text-sm">Gestione</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeDashboard;
