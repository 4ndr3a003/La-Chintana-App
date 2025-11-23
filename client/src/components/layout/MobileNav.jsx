import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, LayoutDashboard, Calendar } from 'lucide-react';

const MobileNav = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-6 left-4 right-4 bg-white/90 backdrop-blur-md border border-slate-200 shadow-2xl rounded-2xl p-2 flex justify-between items-center z-50">
      <Link 
        to="/comms"
        className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${isActive('/comms') ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <MessageSquare size={20} />
        <span className="text-[10px] font-bold">Avvisi</span>
      </Link>

      <Link 
        to="/"
        className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${isActive('/') ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <LayoutDashboard size={20} />
        <span className="text-[10px] font-bold">Home</span>
      </Link>

      <Link 
        to="/events"
        className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${isActive('/events') ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <Calendar size={20} />
        <span className="text-[10px] font-bold">Eventi</span>
      </Link>
    </div>
  );
};

export default MobileNav;
