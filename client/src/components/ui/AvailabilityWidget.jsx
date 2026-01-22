import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { EVENT_TYPES } from '../../utils/constants';

const AvailabilityWidget = ({ currentMonth, onMonthChange, events = [] }) => {
    const navigate = useNavigate();

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

    // Handle day click - navigate directly to events page with the event ID
    const handleDayClick = (dayEvents) => {
        if (dayEvents.length === 0) return;
        const firstEvent = dayEvents[0];
        navigate(`/events?eventId=${firstEvent.id}`);
    };

    // Get event ring style based on type
    const getEventRingStyle = (type) => {
        const typeData = EVENT_TYPES[type];
        if (!typeData) return { ring: 'ring-slate-300', text: 'text-slate-600', bg: 'bg-slate-50' };

        if (typeData.color.includes('red')) return { ring: 'ring-2 ring-red-400', text: 'text-red-600', bg: 'bg-red-50' };
        if (typeData.color.includes('amber') || typeData.color.includes('yellow')) return { ring: 'ring-2 ring-amber-400', text: 'text-amber-700', bg: 'bg-amber-50' };
        if (typeData.color.includes('emerald') || typeData.color.includes('green')) return { ring: 'ring-2 ring-emerald-400', text: 'text-emerald-600', bg: 'bg-emerald-50' };
        if (typeData.color.includes('blue')) return { ring: 'ring-2 ring-blue-400', text: 'text-blue-600', bg: 'bg-blue-50' };
        if (typeData.color.includes('purple')) return { ring: 'ring-2 ring-purple-400', text: 'text-purple-600', bg: 'bg-purple-50' };
        return { ring: 'ring-2 ring-slate-300', text: 'text-slate-600', bg: 'bg-slate-50' };
    };

    const dayNames = ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do'];

    return (
        <div className="bg-gradient-to-br from-white to-slate-50/80 rounded-3xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] p-5 border border-slate-100/80 flex flex-col backdrop-blur-sm">
            {/* Header with Icon */}
            <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <CalendarDays size={18} className="text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">Calendario</h3>
            </div>

            {/* Calendar View */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 flex-grow flex flex-col border border-slate-100 shadow-sm">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => onMonthChange(-1)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-all duration-200 active:scale-95"
                    >
                        <ChevronLeft size={18} strokeWidth={2.5} />
                    </button>
                    <span className="font-bold text-slate-800 capitalize text-sm tracking-wide">{monthLabel}</span>
                    <button
                        onClick={() => onMonthChange(1)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-all duration-200 active:scale-95"
                    >
                        <ChevronRight size={18} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Day Names Header */}
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {dayNames.map((day, idx) => (
                        <span
                            key={idx}
                            className={`text-[11px] font-semibold py-1 ${idx >= 5 ? 'text-slate-400' : 'text-slate-500'}`}
                        >
                            {day}
                        </span>
                    ))}
                </div>

                {/* Calendar Days Grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                    {days.map((d, idx) => {
                        const dayEvents = getEventsForDay(d);
                        const isToday = d === new Date().getDate() &&
                            currentMonth.getMonth() === new Date().getMonth() &&
                            currentMonth.getFullYear() === new Date().getFullYear();
                        const isWeekend = d && ((idx % 7 === 5) || (idx % 7 === 6));
                        const hasEvents = dayEvents.length > 0;

                        // Determine cell style
                        let cellClass = "text-slate-600 hover:bg-slate-50";
                        let ringStyle = "";

                        if (isWeekend && !hasEvents && !isToday) {
                            cellClass = "text-slate-400 hover:bg-slate-50";
                        }

                        if (hasEvents) {
                            const eventStyle = getEventRingStyle(dayEvents[0].type);
                            ringStyle = eventStyle.ring;
                            cellClass = `${eventStyle.text} font-bold bg-white shadow-sm cursor-pointer hover:scale-110 active:scale-95`;
                        }

                        if (isToday) {
                            cellClass = `bg-gradient-to-br from-slate-800 to-slate-900 text-white font-bold shadow-lg shadow-slate-900/20 ${hasEvents ? 'cursor-pointer hover:scale-110 active:scale-95' : ''}`;
                            ringStyle = hasEvents ? "ring-2 ring-offset-2 ring-amber-400" : "";
                        }

                        return (
                            <div
                                key={idx}
                                onClick={() => hasEvents && handleDayClick(dayEvents)}
                                className={`
                                    aspect-square flex items-center justify-center 
                                    rounded-xl text-xs font-medium
                                    transition-all duration-200
                                    ${d ? cellClass : ''} 
                                    ${ringStyle}
                                `}
                            >
                                {d && <span>{d}</span>}
                            </div>
                        );
                    })}
                </div>

                {/* Call to Action Button */}
                <div className="mt-5">
                    <Link
                        to="/events"
                        className="
                            block w-full py-2.5 
                            bg-gradient-to-r from-blue-600 to-blue-700 
                            text-white font-bold rounded-xl 
                            hover:from-blue-700 hover:to-blue-800 
                            transition-all duration-300 text-xs text-center
                            shadow-lg shadow-blue-600/25
                            hover:shadow-xl hover:shadow-blue-600/30
                            active:scale-[0.98]
                        "
                    >
                        Vai al Calendario Completo
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AvailabilityWidget;
