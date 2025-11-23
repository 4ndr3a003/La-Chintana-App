import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const CalendarGrid = ({ events, userProfile, onEventClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Filtra solo gli eventi a cui l'utente partecipa
  const myEvents = events.filter(event => event.participants?.includes(userProfile.id));

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    const firstDayAdjusted = firstDay === 0 ? 6 : firstDay - 1; 
    return { days, firstDay: firstDayAdjusted };
  };

  const { days, firstDay } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });

  const changeMonth = (delta) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800 capitalize">{monthName}</h3>
        <div className="flex gap-2">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 rounded-full"><ChevronDown className="rotate-90" size={20}/></button>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 rounded-full"><ChevronDown className="-rotate-90" size={20}/></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(d => (
          <div key={d} className="text-center text-xs font-bold text-slate-400 uppercase py-2">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square"></div>
        ))}
        {Array.from({ length: days }).map((_, i) => {
          const day = i + 1;
          const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
          const dayEvents = myEvents.filter(e => e.date.startsWith(dateStr));
          const isToday = new Date().toISOString().split('T')[0] === dateStr;

          return (
            <div key={day} className={`min-h-[100px] rounded-xl border ${isToday ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-blue-200'} p-1 flex flex-col items-start justify-start transition-colors relative group overflow-hidden`}>
              <span className={`text-xs font-bold mb-1 ml-1 ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>{day}</span>
              <div className="flex flex-col gap-1 w-full px-1 overflow-y-auto max-h-[80px]">
                {dayEvents.map(ev => {
                  const timeStr = new Date(ev.date).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'});
                  return (
                    <div 
                      key={ev.id} 
                      onClick={() => onEventClick(ev)}
                      className={`text-[9px] font-bold px-1.5 py-1 rounded w-full cursor-pointer hover:opacity-80 transition-opacity ${ev.type === 'Emergenza' ? 'bg-red-100 text-red-700' : ev.type === 'Esercitazione' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-800'}`} 
                      title={`${ev.title} \n${timeStr} - ${ev.location}`}
                    >
                      <div className="truncate">{ev.title}</div>
                      <div className="flex items-center gap-1 font-normal opacity-80 text-[8px] mt-0.5">
                        <span className="whitespace-nowrap">{timeStr}</span>
                        <span>•</span>
                        <span className="truncate">{ev.location}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
