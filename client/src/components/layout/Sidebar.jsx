import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, MessageSquare, Users, House, Box, ShieldAlert } from 'lucide-react';
import logo from '../../assets/logo_app.png';
import { hasAdminAccess } from '../../utils/constants';
import { useAppSettings } from '../../context/AssociationSettingsContext';

const Sidebar = ({ userProfile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { associationInfo } = useAppSettings();

  const isActive = (path) => (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path));

  const navItems = hasAdminAccess(userProfile) ? [
    { path: '/', label: 'Home', icon: House },
    { path: '/comms', label: 'Comunicazioni', icon: MessageSquare },
    { path: '/events', label: 'Eventi', icon: Calendar },
    { path: '/admin', label: 'Volontari', icon: Users },
    { path: '/logistics', label: 'Logistica', icon: Box },
    { path: '/direttivo', label: 'Pannello di Controllo', icon: ShieldAlert },
  ] : [
    { path: '/', label: 'Home', icon: House },
    { path: '/events', label: 'Eventi', icon: Calendar },
    { path: '/comms', label: 'Comunicazioni', icon: MessageSquare },
  ];

  return (
    <aside
      className="hidden lg:flex flex-col w-64 h-full flex-shrink-0 overflow-hidden shadow-xl relative z-30"
      style={{ backgroundColor: 'var(--bg-header, #002e5c)' }}
    >
      <button
        onClick={() => navigate('/')}
        className="h-20 flex items-center gap-3 px-5 border-b border-white/10 flex-shrink-0 hover:bg-white/5 transition-colors text-left"
      >
        <img
          src={associationInfo?.logoUrl || logo}
          alt="Logo"
          className="h-10 w-10 object-contain rounded-lg bg-white/10 p-1 flex-shrink-0"
        />
        <div className="min-w-0 leading-tight">
          <p className="text-sm font-black text-white truncate">
            {associationInfo?.name ? associationInfo.name.toUpperCase() : 'GESTIONALE'}
          </p>
          <p className="text-[10px] text-[var(--color-pc-yellow)] font-bold uppercase tracking-widest truncate">
            Protezione Civile
          </p>
        </div>
      </button>

      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${active
                ? 'bg-[var(--color-pc-yellow)] text-blue-900 shadow-sm'
                : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
            >
              <Icon size={19} strokeWidth={active ? 2.5 : 2} className="flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-white/10 flex-shrink-0">
        <p className="text-[10px] font-semibold text-blue-200/70 uppercase tracking-wider truncate">
          {associationInfo?.name || 'Gestionale Associativo PC'}
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
