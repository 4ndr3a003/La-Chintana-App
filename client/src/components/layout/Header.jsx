import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, MessageSquare, Settings } from 'lucide-react';
import logo from '../../assets/logo_chintanta.png';
import Avatar from '../ui/Avatar';
import { hasAdminAccess, ROLE_LABELS } from '../../utils/constants';

const NavButton = ({ children, to, active, icon }) => (
  <Link 
    to={to} 
    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${active ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
  >
    {icon} {children}
  </Link>
);

const Header = ({ userProfile }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center relative">
          
          <Link to="/" className="flex items-center gap-3 cursor-pointer group">
            <img src={logo} alt="Logo" className="h-10 w-auto sm:h-12 group-hover:scale-105 transition-transform" />
            <div className="leading-none">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900">LA CHINTANA</h1>
              <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest">Protezione Civile</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <NavButton active={isActive('/')} to="/" icon={<LayoutDashboard size={16} />}>Home</NavButton>
            <NavButton active={isActive('/events')} to="/events" icon={<Calendar size={16} />}>Bacheca</NavButton>
            <NavButton active={isActive('/comms')} to="/comms" icon={<MessageSquare size={16} />}>Comunicazioni</NavButton>
            {hasAdminAccess(userProfile) && (
              <NavButton active={isActive('/admin')} to="/admin" icon={<Settings size={16} />}>Gestione</NavButton>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link 
              to="/profile"
              className={`flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full transition-all border ${isActive('/profile') ? 'bg-blue-50 border-blue-200 text-blue-700 ring-2 ring-blue-100' : 'bg-transparent border-transparent hover:bg-slate-50 text-slate-600'}`}
            >
               <div className="text-right leading-none hidden lg:block">
                 <div className="text-xs font-bold">{userProfile.name.split(' ').slice(0,2).join(' ')}</div>
                 <div className="text-[10px] font-medium text-slate-400 uppercase mt-0.5">{ROLE_LABELS[userProfile.role]}</div>
               </div>
               <Avatar src={userProfile.photoUrl} name={userProfile.name} size="sm" className="ring-2 ring-white shadow-sm" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
