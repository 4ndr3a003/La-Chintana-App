import React from 'react';
import { Clock, MapPin, Users, X, CheckCircle } from 'lucide-react';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import { ROLE_LABELS } from '../../utils/constants';

const EventCard = ({ event, userProfile, allProfiles, onToggleParticipation, onClick, showParticipants }) => {
  const isParticipating = event.participants?.includes(userProfile.id);
  const dateObj = new Date(event.date);
  const isPast = dateObj < new Date();

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all group ${isPast ? 'opacity-75' : ''} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className={`h-2 w-full ${event.type === 'Emergenza' ? 'bg-red-500' : event.type === 'Esercitazione' ? 'bg-blue-500' : 'bg-yellow-400'}`}></div>
      
      <div className="p-5 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{dateObj.toLocaleDateString('it-IT', { weekday: 'long' })}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-800 leading-none">{dateObj.getDate()}</span>
              <span className="text-sm font-bold text-slate-500 uppercase">{dateObj.toLocaleDateString('it-IT', { month: 'short' })}</span>
            </div>
          </div>
          <Badge text={event.type} color={event.type === 'Emergenza' ? 'red' : 'blue'} />
        </div>

        <h3 className="text-lg font-bold text-slate-900 leading-tight mb-3">{event.title}</h3>
        
        <div className="space-y-3 mb-6 flex-grow">
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Clock size={16} />
            </div>
            <span className="font-medium">{dateObj.toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <MapPin size={16} />
            </div>
            <span className="font-medium truncate">{event.location}</span>
          </div>

          {event.description && (
            <p className="text-sm text-slate-500 line-clamp-2 mt-2 pl-1 border-l-2 border-slate-100">
              {event.description}
            </p>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2 overflow-hidden">
                  {event.participants?.slice(0, 4).map(uid => {
                    const p = allProfiles[uid];
                    return p ? <Avatar key={uid} src={p.photoUrl} name={p.name} size="xs" className="ring-2 ring-white" /> : null;
                  })}
                  {(event.participants?.length || 0) > 4 && (
                    <div className="w-6 h-6 rounded-full bg-slate-100 ring-2 ring-white flex items-center justify-center text-[10px] font-bold text-slate-500">+{event.participants.length - 4}</div>
                  )}
                  {(!event.participants || event.participants.length === 0) && <span className="text-xs text-slate-400 font-medium italic">Nessun iscritto</span>}
              </div>
              {event.participants?.length > 0 && (
                <span className="text-xs font-bold text-slate-400">{event.participants.length} Partecipanti</span>
              )}
            </div>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                !isPast && onToggleParticipation(event);
              }}
              disabled={isPast}
              className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                isPast 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : isParticipating 
                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
              }`}
            >
              {isPast ? (
                <>Evento Concluso</>
              ) : isParticipating ? (
                <><X size={18} /> Annulla Iscrizione</>
              ) : (
                <><CheckCircle size={18} /> Iscriviti all'Evento</>
              )}
            </button>
        </div>
      </div>
      
      {showParticipants && (
        <div className="px-5 pb-5 border-t border-slate-100 pt-4 bg-slate-50/50">
           <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
             <Users size={16} className="text-blue-600"/>
             Elenco Partecipanti
           </h4>
           <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
             {event.participants?.map(uid => {
               const p = allProfiles[uid];
               if (!p) return null;
               return (
                 <div key={uid} className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                   <Avatar src={p.photoUrl} name={p.name} size="sm" />
                   <div>
                     <p className="text-sm font-bold text-slate-700">{p.name}</p>
                     <p className="text-[10px] font-bold uppercase text-slate-400">{ROLE_LABELS[p.role]}</p>
                   </div>
                 </div>
               );
             })}
             {(!event.participants || event.participants.length === 0) && (
               <p className="text-sm text-slate-400 italic text-center py-2">Nessun partecipante registrato.</p>
             )}
           </div>
        </div>
      )}
    </div>
  );
};

export default EventCard;
