import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock } from 'lucide-react';

const EventCard = ({ event }) => {
    const dateObj = new Date(event.date);

    // Determine theme based on type (matching EventsDashboard logic)
    const getTheme = (type) => {
        switch (type) {
            case 'Emergenza':
                return {
                    cardBg: 'bg-red-100',
                    dateBg: 'bg-red-200',
                    borderColor: 'border-red-300',
                    dateText: 'text-red-800',
                    badge: 'bg-white text-red-800 border-red-300',
                };
            case 'Esercitazione':
                return {
                    cardBg: 'bg-blue-50',
                    dateBg: 'bg-blue-100',
                    borderColor: 'border-blue-200',
                    dateText: 'text-blue-700',
                    badge: 'bg-white text-blue-700 border-blue-200',
                };
            case 'Riunione':
                return {
                    cardBg: 'bg-slate-100',
                    dateBg: 'bg-slate-200',
                    borderColor: 'border-slate-300',
                    dateText: 'text-slate-800',
                    badge: 'bg-white text-slate-800 border-slate-300',
                };
            case 'Formazione':
                return {
                    cardBg: 'bg-emerald-50',
                    dateBg: 'bg-emerald-100',
                    borderColor: 'border-emerald-200',
                    dateText: 'text-emerald-700',
                    badge: 'bg-white text-emerald-700 border-emerald-200',
                };
            default:
                return {
                    cardBg: 'bg-amber-50',
                    dateBg: 'bg-amber-100',
                    borderColor: 'border-amber-200',
                    dateText: 'text-amber-700',
                    badge: 'bg-white text-amber-700 border-amber-200',
                };
        }
    };

    const theme = getTheme(event.type);

    return (
        <Link
            to="/events"
            state={{ selectedEventId: event.id }}
            className={`${theme.cardBg} ${theme.borderColor} rounded-xl shadow-sm border overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 group h-full`}
        >
            <div className="flex flex-row h-full">
                {/* Left Date Strip */}
                <div className={`w-20 flex flex-col items-center justify-center p-2 py-4 ${theme.dateText} shrink-0 border-r ${theme.borderColor} ${theme.dateBg}`}>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{dateObj.toLocaleDateString('it-IT', { weekday: 'short' })}</span>
                        <span className="text-2xl font-black leading-none my-1">{dateObj.getDate()}</span>
                        <span className="text-[10px] font-bold uppercase opacity-80">{dateObj.toLocaleDateString('it-IT', { month: 'short' })}</span>
                    </div>
                </div>

                {/* Right Content Wrapper */}
                <div className="flex flex-col flex-grow min-w-0 p-4">
                    <div className="flex justify-between items-start mb-2 gap-2">
                        <h3 className="text-lg font-bold text-slate-800 leading-tight line-clamp-2">{event.title}</h3>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${theme.badge} whitespace-nowrap h-fit shrink-0`}>
                            {event.type}
                        </span>
                    </div>

                    <div className="space-y-1.5 mt-auto">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock size={14} className="text-slate-400 shrink-0" />
                            <span>{dateObj.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <MapPin size={14} className="text-slate-400 shrink-0" />
                            <span className="truncate">{event.location}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default EventCard;
