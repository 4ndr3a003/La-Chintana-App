import React from 'react';
import { useLocation } from 'react-router-dom';
import { IonTabBar, IonTabButton, IonLabel } from '@ionic/react';
import { MessageSquare, LayoutDashboard, Calendar } from 'lucide-react';

const MobileNav = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="px-6 pb-6 pt-2 bg-slate-50">
      <IonTabBar className="rounded-2xl shadow-xl border border-slate-100 overflow-hidden h-16 md:max-w-md md:mx-auto mobile-tab-bar">
        <IonTabButton tab="comms" href="/comms" selected={isActive('/comms')} className="mobile-tab-btn">
          <MessageSquare size={24} className={isActive('/comms') ? "mobile-tab-icon-active" : "mobile-tab-icon-inactive"} />
          <IonLabel className={isActive('/comms') ? "mobile-tab-label-active" : "mobile-tab-label-inactive"}>Avvisi</IonLabel>
        </IonTabButton>

        <IonTabButton tab="home" href="/" selected={isActive('/')} className="mobile-tab-btn">
          <LayoutDashboard size={24} className={isActive('/') ? "mobile-tab-icon-active" : "mobile-tab-icon-inactive"} />
          <IonLabel className={isActive('/') ? "mobile-tab-label-active" : "mobile-tab-label-inactive"}>Home</IonLabel>
        </IonTabButton>

        <IonTabButton tab="events" href="/events" selected={isActive('/events')} className="mobile-tab-btn">
          <Calendar size={24} className={isActive('/events') ? "mobile-tab-icon-active" : "mobile-tab-icon-inactive"} />
          <IonLabel className={isActive('/events') ? "mobile-tab-label-active" : "mobile-tab-label-inactive"}>Eventi</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </div>
  );
};

export default MobileNav;
