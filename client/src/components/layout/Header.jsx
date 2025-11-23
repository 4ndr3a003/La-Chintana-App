import React from 'react';
import { useLocation } from 'react-router-dom';
import { IonHeader, IonToolbar, IonButtons, IonButton } from '@ionic/react';
import { LayoutDashboard, Calendar, MessageSquare, Settings } from 'lucide-react';
import logo from '../../assets/logo_chintanta.png';
import Avatar from '../ui/Avatar';
import { hasAdminAccess, ROLE_LABELS } from '../../utils/constants';

const NavButton = ({ children, to, active, icon }) => (
  <IonButton
    routerLink={to}
    shape="round"
    fill={active ? "solid" : "clear"}
    className={`font-bold text-sm nav-button ${active ? 'nav-button-active' : 'nav-button-inactive'}`}
  >
    <span className="flex items-center gap-2 normal-case">
      {icon} {children}
    </span>
  </IonButton>
);

const Header = ({ userProfile }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <IonHeader className="ion-no-border">
      <IonToolbar className="header-toolbar">
        <div className="flex justify-between items-center w-full px-4 lg:px-6">
          {/* Logo Section */}
          <IonButtons slot="start">
            <IonButton routerLink="/" fill="clear" className="h-auto">
              <div className="flex items-center gap-3">
                <img src={logo} alt="Logo" className="h-11 w-auto" />
                <div className="leading-none text-left hidden sm:block">
                  <h1 className="text-base font-black tracking-tight text-slate-900">LA CHINTANA</h1>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Protezione Civile</p>
                </div>
              </div>
            </IonButton>
          </IonButtons>

          {/* Navigation Buttons - Desktop Only */}
          <IonButtons slot="primary" className="hidden xl:flex gap-2">
            <NavButton active={isActive('/')} to="/" icon={<LayoutDashboard size={16} />}>Home</NavButton>
            <NavButton active={isActive('/events')} to="/events" icon={<Calendar size={16} />}>Bacheca</NavButton>
            <NavButton active={isActive('/comms')} to="/comms" icon={<MessageSquare size={16} />}>Comunicazioni</NavButton>
            {hasAdminAccess(userProfile) && (
              <NavButton active={isActive('/admin')} to="/admin" icon={<Settings size={16} />}>Gestione</NavButton>
            )}
          </IonButtons>

          {/* User Profile Section */}
          <IonButtons slot="end">
            <IonButton
              routerLink="/profile"
              shape="round"
              fill={isActive('/profile') ? "solid" : "clear"}
              className={`nav-button ${isActive('/profile') ? 'nav-button-active' : 'nav-button-inactive'}`}
              style={{ height: 'auto' }}
            >
              <div className="flex items-center gap-3 py-1">
                <div className="text-right leading-none hidden lg:block">
                  <div className={`text-sm font-bold ${isActive('/profile') ? 'text-blue-700' : 'text-slate-800'}`}>{userProfile.name.split(' ').slice(0, 2).join(' ')}</div>
                  <div className={`text-[10px] font-medium uppercase mt-0.5 ${isActive('/profile') ? 'text-blue-500' : 'text-slate-500'}`}>{ROLE_LABELS[userProfile.role]}</div>
                </div>
                <Avatar src={userProfile.photoUrl} name={userProfile.name} size="sm" className="ring-2 ring-slate-200 shadow-sm" />
              </div>
            </IonButton>
          </IonButtons>
        </div>
      </IonToolbar>
    </IonHeader>
  );
};

export default Header;
