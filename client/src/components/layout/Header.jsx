import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IonHeader, IonToolbar, IonButtons, IonButton } from '@ionic/react';
import { LayoutDashboard, Calendar, MessageSquare, Users, House, Bell, Settings, UserCircle, LogOut } from 'lucide-react';
import logo from '../../assets/logo_chintanta.png';
import Avatar from '../ui/Avatar';
import NotificationPanel from '../notifications/NotificationPanel';
import ProfileMenu from './ProfileMenu';
import { hasAdminAccess, ROLE_LABELS } from '../../utils/constants';

const NavButton = React.forwardRef(({ children, to, active, icon, onClick }, ref) => (
  <IonButton
    ref={ref}
    onClick={onClick}
    shape="round"
    fill="clear"
    className={`font-bold text-sm tracking-wide transition-colors duration-300 z-10 relative ${active ? 'scale-105' : 'hover:scale-105 opacity-90 hover:opacity-100'}`}
    style={{
      '--background': 'transparent',
      '--background-hover': 'transparent',
      '--color': active ? 'var(--color-pc-blue-900)' : 'var(--color-slate-50)',
      '--border-radius': '20px',
      '--padding-start': '16px',
      '--padding-end': '16px',
      '--box-shadow': 'none',
      height: '40px',
      margin: '0 2px'
    }}
  >
    <span className="flex items-center gap-2.5 normal-case">
      {React.cloneElement(icon, { size: 18, strokeWidth: active ? 2.5 : 2, className: `transition-colors duration-300 ${active ? 'text-blue-900' : 'text-blue-200'}` })}
      <span className={`transition-colors duration-300 ${active ? 'text-blue-900' : 'text-blue-50'}`}>{children}</span>
    </span>
  </IonButton>
));

const Header = ({ userProfile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState(false);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const navContainerRef = useRef(null);
  const navRefs = useRef({});
  const notifButtonRef = useRef(null);

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileButtonRef = useRef(null);

  const navItems = useMemo(() => {
    const items = [
      { path: '/', label: 'Home', icon: <House strokeWidth={1.5} /> },
      { path: '/events', label: 'Bacheca', icon: <Calendar /> },
      { path: '/comms', label: 'Comunicazioni', icon: <MessageSquare /> },
    ];

    if (hasAdminAccess(userProfile)) {
      items.push({ path: '/admin', label: 'Volontari', icon: <Users /> });
    }
    return items;
  }, [userProfile]);

  useEffect(() => {
    const updatePill = () => {
      const activeItem = navItems.find(item => isActive(item.path));
      if (activeItem && navRefs.current[activeItem.path] && navContainerRef.current) {
        const element = navRefs.current[activeItem.path];
        const container = navContainerRef.current;

        const eleRect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        setPillStyle({
          left: eleRect.left - containerRect.left,
          width: eleRect.width,
          opacity: 1
        });
      } else {
        setPillStyle(prev => ({ ...prev, opacity: 0 }));
      }
    };

    const timer = setTimeout(updatePill, 50);
    window.addEventListener('resize', updatePill);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePill);
    };
  }, [location.pathname, navItems]);

  return (
    <IonHeader className="ion-no-border pt-0 px-0 pb-0 md:pt-4 md:px-4 md:pb-2 !overflow-visible" style={{ '--background': 'transparent' }}>
      <IonToolbar
        className="rounded-none md:rounded-[2rem] shadow-xl backdrop-blur-xl border-b md:border border-white/10 !overflow-visible"
        style={{
          '--background': 'var(--color-pc-blue-700)',
          '--min-height': '80px',
          '--padding-start': '16px',
          '--padding-end': '16px',
          overflow: 'visible'
        }}
      >
        <div className="flex justify-between items-center w-full px-0 lg:px-4">
          {/* Logo Section */}
          <IonButtons slot="start">
            <IonButton onClick={() => navigate('/')} fill="clear" className="h-auto hover:opacity-80 transition-opacity">
              <div className="flex items-center gap-2 md:gap-3.5">
                <img src={logo} alt="Logo" className="h-12 w-auto drop-shadow-sm" />
                <div className="leading-none text-left block whitespace-nowrap">
                  <h1 className="text-lg font-black tracking-tighter text-white">LA CHINTANA</h1>
                  <p className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest">Protezione Civile</p>
                </div>
              </div>
            </IonButton>
          </IonButtons>

          {/* Navigation Buttons - Desktop Only */}
          <IonButtons slot="primary" className="!hidden xl:!block">
            <div
              ref={navContainerRef}
              className="flex relative items-center bg-blue-900/40 p-1.5 rounded-full border border-blue-500/30 shadow-inner"
            >
              {/* The Pill */}
              <div
                className="absolute bg-yellow-500 rounded-[20px] shadow-sm transition-all duration-300 ease-in-out"
                style={{
                  left: pillStyle.left,
                  width: pillStyle.width,
                  height: '40px',
                  opacity: pillStyle.opacity,
                  top: '6px'
                }}
              />

              {navItems.map((item) => (
                <NavButton
                  key={item.path}
                  to={item.path}
                  active={isActive(item.path)}
                  icon={item.icon}
                  onClick={() => navigate(item.path)}
                  ref={el => navRefs.current[item.path] = el}
                >
                  {item.label}
                </NavButton>
              ))}
            </div>
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
                  '--padding-start': '8px',
                  '--padding-end': '8px',
                  '--color': isNotifPanelOpen ? 'var(--color-pc-yellow)' : 'var(--color-slate-50)'
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

              <div className="h-8 w-px bg-blue-500/50 hidden lg:block"></div>
              <div className="relative">
                <IonButton
                  ref={profileButtonRef}
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  shape="round"
                  fill="clear"
                  className={`group transition-all duration-300 ease-in-out ${isActive('/profile') ? 'scale-105 profile-button-active' : 'hover:scale-105 profile-button'}`}
                  style={{
                    height: 'auto',
                    '--padding-start': '12px',
                    '--padding-end': '12px',
                    '--border-radius': '20px',
                    '--background': isActive('/profile') || isProfileMenuOpen ? 'var(--color-pc-yellow)' : 'transparent',
                    '--background-hover': isActive('/profile') || isProfileMenuOpen ? 'var(--color-pc-yellow-400)' : 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div className="flex items-center gap-3 py-1.5 px-1">
                    <div className="text-right leading-none hidden lg:block group-hover:translate-x-[-2px] transition-transform duration-300">
                      <div className={`text-sm font-bold uppercase transition-colors duration-300 ${isActive('/profile') || isProfileMenuOpen ? 'text-blue-900' : 'text-white'}`}>{userProfile.name.split(' ').slice(0, 2).join(' ')}</div>
                      <div className={`text-[10px] font-semibold uppercase mt-0.5 transition-colors duration-300 ${isActive('/profile') || isProfileMenuOpen ? 'text-blue-800' : 'text-blue-200'}`}>{ROLE_LABELS[userProfile.role]}</div>
                    </div>
                    <Avatar src={userProfile.photoUrl} name={userProfile.name} size="sm" className={`ring-2 shadow-md transition-all duration-300 ${isActive('/profile') || isProfileMenuOpen ? 'ring-blue-900/20' : 'ring-blue-400/50 group-hover:ring-yellow-400'}`} />
                  </div>
                </IonButton>

                <ProfileMenu
                  isOpen={isProfileMenuOpen}
                  onClose={() => setIsProfileMenuOpen(false)}
                  anchorRef={profileButtonRef}
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
