import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IonTabBar, IonTabButton, IonLabel } from '@ionic/react';
import { MessageSquare, LayoutDashboard, Calendar, Users, House } from 'lucide-react';
import { ROLES } from '../../utils/constants';

const MobileNav = ({ userProfile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;

  const showAdmin = userProfile && (userProfile.role === ROLES.PRESIDENT || userProfile.role === ROLES.BOARD);

  return (
    <div className="px-6 pb-6 pt-2 bg-transparent pointer-events-none">
      <IonTabBar
        className="rounded-2xl shadow-xl border border-white/10 overflow-hidden h-16 md:max-w-md md:mx-auto pointer-events-auto backdrop-blur-xl"
        style={{
          '--background': 'var(--color-pc-blue-700)',
        }}
      >
        <IonTabButton
          tab="comms"
          onClick={() => navigate('/comms')}
          selected={isActive('/comms')}
          className="mobile-tab-btn"
          style={{ '--background': 'transparent' }}
        >
          <MessageSquare size={24} className={isActive('/comms') ? "text-yellow-400 scale-110 transition-all duration-200" : "text-blue-200 transition-all duration-200"} />
          <IonLabel className={isActive('/comms') ? "text-yellow-400 font-bold text-[10px] mt-1 transition-all duration-200" : "text-blue-200 font-medium text-[10px] mt-1 transition-all duration-200"}>Avvisi</IonLabel>
        </IonTabButton>

        <IonTabButton
          tab="home"
          onClick={() => navigate('/')}
          selected={isActive('/')}
          className="mobile-tab-btn"
          style={{ '--background': 'transparent' }}
        >
          <House strokeWidth={1.5} size={24} className={isActive('/') ? "text-yellow-400 scale-110 transition-all duration-200" : "text-blue-200 transition-all duration-200"} />
          <IonLabel className={isActive('/') ? "text-yellow-400 font-bold text-[10px] mt-1 transition-all duration-200" : "text-blue-200 font-medium text-[10px] mt-1 transition-all duration-200"}>Home</IonLabel>
        </IonTabButton>

        <IonTabButton
          tab="events"
          onClick={() => navigate('/events')}
          selected={isActive('/events')}
          className="mobile-tab-btn"
          style={{ '--background': 'transparent' }}
        >
          <Calendar size={24} className={isActive('/events') ? "text-yellow-400 scale-110 transition-all duration-200" : "text-blue-200 transition-all duration-200"} />
          <IonLabel className={isActive('/events') ? "text-yellow-400 font-bold text-[10px] mt-1 transition-all duration-200" : "text-blue-200 font-medium text-[10px] mt-1 transition-all duration-200"}>Eventi</IonLabel>
        </IonTabButton>

        {showAdmin && (
          <IonTabButton
            tab="admin"
            onClick={() => navigate('/admin')}
            selected={isActive('/admin')}
            className="mobile-tab-btn"
            style={{ '--background': 'transparent' }}
          >
            <Users size={24} className={isActive('/admin') ? "text-yellow-400 scale-110 transition-all duration-200" : "text-blue-200 transition-all duration-200"} />
            <IonLabel className={isActive('/admin') ? "text-yellow-400 font-bold text-[10px] mt-1 transition-all duration-200" : "text-blue-200 font-medium text-[10px] mt-1 transition-all duration-200"}>Gestione</IonLabel>
          </IonTabButton>
        )}
      </IonTabBar>
    </div>
  );
};

export default MobileNav;
