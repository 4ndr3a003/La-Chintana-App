import React, { useState, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, House, Calendar, MessageSquare, Users, Truck, ShieldAlert, UserCircle, Settings as SettingsIcon, Building2 } from 'lucide-react';
import Avatar from '../ui/Avatar';
import NotificationPanel from '../notifications/NotificationPanel';
import ProfileMenu from './ProfileMenu';
import { ROLE_LABELS } from '../../utils/constants';

const PAGE_META = [
  { path: '/', label: 'Home', icon: House },
  { path: '/events', label: 'Calendario Attività', icon: Calendar },
  { path: '/comms', label: 'Comunicazioni', icon: MessageSquare },
  { path: '/admin', label: 'Gestione Volontari', icon: Users },
  { path: '/logistics', label: 'Logistica & Mezzi', icon: Truck },
  { path: '/direttivo', label: 'Pannello di Controllo', icon: ShieldAlert },
  { path: '/profile', label: 'Profilo Volontario', icon: UserCircle },
  { path: '/settings', label: 'Impostazioni', icon: SettingsIcon },
  { path: '/superadmin', label: 'Gestione Associazioni', icon: Building2 },
];

const Topbar = ({ userProfile }) => {
  const location = useLocation();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notifBtnRef = useRef(null);
  const profileBtnRef = useRef(null);

  const meta = useMemo(() => {
    const match = PAGE_META.find((m) => (m.path === '/' ? location.pathname === '/' : location.pathname.startsWith(m.path)));
    return match || { label: 'Gestionale', icon: House };
  }, [location.pathname]);

  const PageIcon = meta.icon;

  return (
    <header className="hidden lg:flex items-center justify-between h-20 px-8 bg-white dark:bg-[var(--color-slate-100)] border-b border-slate-200 dark:border-slate-700 flex-shrink-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
          <PageIcon size={20} strokeWidth={2.5} />
        </div>
        <h1 className="text-xl font-extrabold text-slate-800 dark:text-white truncate">{meta.label}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          ref={notifBtnRef}
          onClick={() => setIsNotifOpen((o) => !o)}
          className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-colors ${isNotifOpen ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'}`}
        >
          <Bell size={20} strokeWidth={isNotifOpen ? 2.5 : 2} />
        </button>
        <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} userProfile={userProfile} anchorRef={notifBtnRef} />

        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1"></div>

        <button
          ref={profileBtnRef}
          onClick={() => setIsProfileOpen((o) => !o)}
          className={`flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-2xl transition-all ${isProfileOpen ? 'bg-[var(--color-pc-yellow)]' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
        >
          <Avatar src={userProfile.photoUrl} name={userProfile.name} size="sm" className="ring-2 ring-slate-100 dark:ring-slate-700" />
          <div className="text-left leading-none">
            <div className="text-sm font-bold text-slate-800 dark:text-white">{userProfile.name.split(' ').slice(0, 2).join(' ')}</div>
            <div className="text-[10px] font-semibold uppercase text-slate-400 mt-0.5">{ROLE_LABELS[userProfile.role]}</div>
          </div>
        </button>
        <ProfileMenu isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} anchorRef={profileBtnRef} userProfile={userProfile} />
      </div>
    </header>
  );
};

export default Topbar;
