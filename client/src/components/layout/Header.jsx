import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IonHeader, IonToolbar, IonButtons, IonButton } from '@ionic/react';
import { Bell } from 'lucide-react';
import logo from '../../assets/logo_app.png';
import Avatar from '../ui/Avatar';
import NotificationPanel from '../notifications/NotificationPanel';
import ProfileMenu from './ProfileMenu';
import { useAppSettings } from '../../context/AssociationSettingsContext';

const Header = ({ userProfile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState(false);
  const notifButtonRef = useRef(null);

  const { associationInfo } = useAppSettings();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileButtonRef = useRef(null);

  // Branding is now globally applied by AssociationSettingsProvider

  return (
    <IonHeader className="ion-no-border pt-0 px-0 pb-0 md:pt-4 md:px-4 md:pb-2 !overflow-visible lg:hidden" style={{ '--background': 'transparent' }}>
      <IonToolbar
        className="rounded-none md:rounded-[2rem] shadow-xl backdrop-blur-xl border-b md:border border-white/10 !overflow-visible"
        style={{
          '--background': 'var(--bg-header, #1e40af)',
          '--min-height': '5rem',
          '--padding-start': '1rem',
          '--padding-end': '1rem',
          overflow: 'visible'
        }}
      >
        <div className="flex justify-between items-center w-full px-0 lg:px-4">
          {/* Logo Section */}
          <IonButtons slot="start">
            <IonButton onClick={() => navigate('/')} fill="clear" className="h-auto hover:opacity-80 transition-opacity">
              <div className="flex items-center gap-2 md:gap-3.5">
                <img 
                  src={associationInfo?.logoUrl || logo} 
                  alt="Logo" 
                  className="h-12 w-auto max-w-[120px] object-contain drop-shadow-sm" 
                  style={associationInfo?.logoUrl ? { borderRadius: '8px' } : {}}
                />
                <div className="leading-none text-left block">
                  <h1 className="text-base sm:text-lg font-black tracking-tighter text-white">
                    {associationInfo?.name ? associationInfo.name.toUpperCase() : "GESTIONALE ASSOCIATIVO PC"}
                  </h1>
                  <p className="text-[0.5625rem] sm:text-[0.625rem] text-yellow-400 font-bold uppercase tracking-widest leading-tight">
                    Protezione Civile
                  </p>
                </div>
              </div>
            </IonButton>
          </IonButtons>

          {/* User Profile Section */}
          <IonButtons slot="end">
            <div className="flex items-center gap-1 md:gap-3 pl-0 relative">
              {/* Notification Button */}
              <IonButton
                ref={notifButtonRef}
                onClick={() => setIsNotifPanelOpen(!isNotifPanelOpen)}
                shape="circle"
                fill="clear"
                className="hover:scale-110 transition-transform"
                style={{
                  '--padding-start': '0.5rem',
                  '--padding-end': '0.5rem',
                  '--color': isNotifPanelOpen ? 'var(--color-pc-yellow)' : '#ffffff'
                }}
              >
                <Bell size={20} strokeWidth={isNotifPanelOpen ? 2.5 : 2} />
              </IonButton>

              <NotificationPanel
                isOpen={isNotifPanelOpen}
                onClose={() => setIsNotifPanelOpen(false)}
                userProfile={userProfile}
                anchorRef={notifButtonRef}
              />

              <div className="relative">
                <IonButton
                  ref={profileButtonRef}
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  shape="round"
                  fill="clear"
                  className={`group transition-all duration-300 ease-in-out ${isActive('/profile') ? 'scale-105 profile-button-active' : 'hover:scale-105 profile-button'}`}
                  style={{
                    height: 'auto',
                    '--padding-start': '0.75rem',
                    '--padding-end': '0.75rem',
                    '--border-radius': '1.25rem',
                    '--background': isActive('/profile') || isProfileMenuOpen ? 'var(--color-pc-yellow)' : 'transparent',
                    '--background-hover': isActive('/profile') || isProfileMenuOpen ? 'var(--color-pc-yellow-400)' : 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div className="flex items-center gap-3 py-1.5 px-1">
                    <Avatar src={userProfile.photoUrl} name={userProfile.name} size="sm" className={`ring-2 shadow-md transition-all duration-300 ${isActive('/profile') || isProfileMenuOpen ? 'ring-blue-900/20' : 'ring-blue-400/50 group-hover:ring-yellow-400'}`} />
                  </div>
                </IonButton>

                <ProfileMenu
                  isOpen={isProfileMenuOpen}
                  onClose={() => setIsProfileMenuOpen(false)}
                  anchorRef={profileButtonRef}
                  userProfile={userProfile}
                />
              </div>
            </div>
          </IonButtons>
        </div>
      </IonToolbar>
    </IonHeader>
  );
};

export default Header;
