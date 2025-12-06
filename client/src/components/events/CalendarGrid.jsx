import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const CalendarGrid = ({ events, userProfile, onEventClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    const firstDayAdjusted = firstDay === 0 ? 6 : firstDay - 1;
    return { days, firstDay: firstDayAdjusted };
  };

  const getEventStyle = (type) => {
    switch (type) {
      case 'Emergenza': return 'bg-red-100 text-red-800 border border-red-200';
      case 'Esercitazione': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Riunione': return 'bg-slate-100 text-slate-800 border border-slate-200';
      case 'Formazione': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      default: return 'bg-amber-100 text-amber-800 border border-amber-200';
    }
  };

  const { days, firstDay } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });

  const changeMonth = (delta) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 md:p-6">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h3 className="text-lg font-bold text-slate-800 capitalize">{monthName}</h3>
        <div className="flex gap-2">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 rounded-full"><ChevronDown className="rotate-90" size={20} /></button>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 rounded-full"><ChevronDown className="-rotate-90" size={20} /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
        {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(d => (
          <div key={d} className="text-center text-[10px] md:text-xs font-bold text-slate-400 uppercase py-1 md:py-2">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square"></div>
        ))}
        {Array.from({ length: days }).map((_, i) => {
          const day = i + 1;
          // Create a date object for the current cell (local time 00:00:00)
          const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

          // Filter events that match this specific day
          const dayEvents = events.filter(e => {
            const eventDate = new Date(e.date);
            return eventDate.getDate() === day &&
              eventDate.getMonth() === currentDate.getMonth() &&
              eventDate.getFullYear() === currentDate.getFullYear();
          });

          const today = new Date();
          const isToday = today.getDate() === day &&
            today.getMonth() === currentDate.getMonth() &&
            today.getFullYear() === currentDate.getFullYear();

          return (
            <div key={day} className={`min-h-0 md:min-h-[100px] aspect-square md:aspect-auto rounded-lg md:rounded-xl border ${isToday ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-blue-200'} p-0.5 md:p-1 flex flex-col items-start justify-start transition-colors relative group overflow-hidden`}>
              <span className={`text-[10px] md:text-xs font-bold mb-0.5 md:mb-1 ml-0.5 md:ml-1 ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>{day}</span>
              <div className="flex flex-col gap-0.5 md:gap-1 w-full px-0.5 md:px-1 overflow-y-auto max-h-[calc(100%-16px)] md:max-h-[80px] custom-scrollbar">
                {dayEvents.map(ev => {
                  const timeStr = new Date(ev.date).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div
                      key={ev.id}
                      onClick={() => onEventClick(ev)}
                      className={`text-[8px] md:text-[9px] font-bold px-1 py-0.5 md:px-1.5 md:py-1 rounded w-full cursor-pointer hover:opacity-80 transition-opacity ${getEventStyle(ev.type)}`}
                      title={`${ev.title} \n${timeStr} - ${ev.location}`}
                    >
                      <div className="truncate leading-tight max-w-full">{ev.title}</div>
                      <div className="hidden md:flex items-center gap-1 font-normal opacity-80 text-[8px] mt-0.5">
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
