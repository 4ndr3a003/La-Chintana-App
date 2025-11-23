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
          <div className="welcome-date-wrapper">
             <span className="date-badge">
               {new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
             </span>
          </div>
          <h2 className="welcome-title">Ciao, {userProfile.name.split(' ')[0]}! 👋</h2>
          <p className="welcome-subtitle">
            Benvenuto nel portale operativo. Ecco cosa c'è in programma per te oggi.
          </p>
        </div>
      </div>

      {/* Quick Overview Section */}
      <div className="section-grid">
        {/* Next Event Card */}
        <div className="dashboard-section-wrapper">
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
                <div className={`card-overlay-strip ${nextEvent.type === 'Emergenza' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                <div className="card-header-row">
                   <Badge text={nextEvent.type} color={nextEvent.type === 'Emergenza' ? 'red' : 'blue'} />
                   <span className="card-date-label">
                      {new Date(nextEvent.date).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })}
                   </span>
                </div>
                <h4 className="card-title">{nextEvent.title}</h4>
                <div className="card-meta-row">
                   <div className="card-meta-item">
                      <Clock size={14} />
                      <span>{new Date(nextEvent.date).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}</span>
                   </div>
                   <div className="card-meta-item">
                      <MapPin size={14} />
                      <span className="card-meta-text-truncate">{nextEvent.location}</span>
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
        <div className="dashboard-section-wrapper">
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
                <div className={`card-overlay-strip ${latestComm.importance === 'Alta' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                <div className="card-header-row">
                   <Badge text={latestComm.topic} color="gray" />
                   {latestComm.importance === 'Alta' && <Badge text="Importante" color="red" />}
                </div>
                <h4 className="card-title">{latestComm.title}</h4>
                <p className="comm-preview-text">{latestComm.content}</p>
                <div className="comm-footer-row">
                   <span>{new Date(latestComm.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}</span>
                   <span className="comm-author">da {latestComm.authorName}</span>
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
        <h3 className="quick-actions-title">Accesso Rapido</h3>
        <div className="quick-actions-grid">
          <Link 
            to="/events"
            className="quick-action-button group"
          >
            <div className="quick-action-icon-wrapper quick-action-icon-blue">
              <Calendar size={24} />
            </div>
            <span className="quick-action-label">Bacheca Eventi</span>
          </Link>

          <Link 
            to="/comms"
            className="quick-action-button group"
          >
            <div className="quick-action-icon-wrapper quick-action-icon-emerald">
              <MessageSquare size={24} />
            </div>
            <span className="quick-action-label">Comunicazioni</span>
          </Link>

          <Link 
            to="/profile"
            className="quick-action-button group"
          >
            <div className="quick-action-icon-wrapper quick-action-icon-orange">
              <User size={24} />
            </div>
            <span className="quick-action-label">Il Mio Profilo</span>
          </Link>

          {hasAdminAccess(userProfile) && (
            <Link 
              to="/admin"
              className="quick-action-button group"
            >
              <div className="quick-action-icon-wrapper quick-action-icon-purple">
                <Users size={24} />
              </div>
              <span className="quick-action-label">Gestione</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeDashboard;
