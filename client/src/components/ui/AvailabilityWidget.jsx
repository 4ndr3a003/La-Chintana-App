import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EVENT_TYPES } from '../../utils/constants';

const AvailabilityWidget = ({ currentMonth, onMonthChange, events = [] }) => {
    const monthLabel = currentMonth.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });

    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay(); // 0 = Sunday
    // Adjust for Monday start (Monday=0, Sunday=6)
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    const days = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    // Helper to get events for a specific day
    const getEventsForDay = (day) => {
        if (!day) return [];

        return events.filter(e => {
            const eventDate = new Date(e.date);
            return eventDate.getDate() === day &&
                eventDate.getMonth() === currentMonth.getMonth() &&
                eventDate.getFullYear() === currentMonth.getFullYear();
        });
    };

    const getEventColor = (type) => {
        const typeData = EVENT_TYPES[type];
        if (!typeData) return 'bg-slate-100 text-slate-600';

        // Map to lighter pastel colors for background with darker text
        if (typeData.color.includes('red')) return 'bg-red-100 text-red-700';
        if (typeData.color.includes('amber') || typeData.color.includes('yellow')) return 'bg-amber-100 text-amber-800';
        if (typeData.color.includes('emerald') || typeData.color.includes('green')) return 'bg-emerald-100 text-emerald-700';
        if (typeData.color.includes('blue')) return 'bg-blue-100 text-blue-700';
        if (typeData.color.includes('purple')) return 'bg-purple-100 text-purple-700';
        return 'bg-slate-100 text-slate-700';
    };

    return (
        <div className="bg-white rounded-3xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.06)] p-6 border border-white/60 flex flex-col mt-12">
            <h3 className="text-lg font-bold text-[var(--color-slate-900)] mb-4">Calendario</h3>

            {/* Calendar View */}
            <div className="border border-[var(--color-slate-200)] rounded-2xl p-3 flex-grow flex flex-col">
                <div className="flex items-center justify-between mb-2">
                    <button onClick={() => onMonthChange(-1)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"><ChevronLeft size={18} /></button>
                    <span className="font-bold text-slate-800 capitalize text-sm">{monthLabel}</span>
                    <button onClick={() => onMonthChange(1)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"><ChevronRight size={18} /></button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-slate-400 mb-1">
                    <span>Lu</span><span>Di</span><span>Mi</span><span>Co</span><span>Fr</span><span>Sa</span><span>So</span>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-700">
                    {days.map((d, idx) => {
                        const dayEvents = getEventsForDay(d);
                        const isToday = d === new Date().getDate() &&
                            currentMonth.getMonth() === new Date().getMonth() &&
                            currentMonth.getFullYear() === new Date().getFullYear();

                        // Determine cell style
                        let cellClass = "hover:bg-slate-50 text-slate-700";

                        if (dayEvents.length > 0) {
                            // Use the color of the first event
                            const colorClass = getEventColor(dayEvents[0].type);
                            cellClass = `${colorClass} font-bold`;
                        } else if (isToday) {
                            cellClass = "bg-slate-900 text-slate-50";
                        }

                        return (
                            <div key={idx} className={`aspect-square flex flex-col items-center justify-center rounded-full relative transition-all ${d ? cellClass : ''}`}>
                                {d && <span className="z-10">{d}</span>}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-4 text-center">
                    <Link to="/events" className="block w-full py-2 bg-[var(--color-pc-blue)] text-white font-bold rounded-xl hover:bg-[var(--color-pc-blue-600)] transition-colors text-xs">
                        Vai al Calendario Completo
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AvailabilityWidget;
