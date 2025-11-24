import React from 'react';
import { Clock, MapPin, Users, X, CheckCircle, Trash2, Pencil } from 'lucide-react';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import { ROLE_LABELS, hasAdminAccess } from '../../utils/constants';

const EventCard = ({ event, userProfile, allProfiles, onToggleParticipation, onClick, showParticipants, onDelete, onEdit }) => {
  const isParticipating = event.participants?.includes(userProfile.id);
  const dateObj = new Date(event.date);
  const isPast = dateObj < new Date();
  const isAdmin = hasAdminAccess(userProfile);

  // Determine theme based on type
  const getTheme = (type) => {
    switch(type) {
      case 'Emergenza': 
        return { 
          cardBg: 'bg-red-100', 
          dateBg: 'bg-red-200',
          borderColor: 'border-red-300',
          dateText: 'text-red-800',
          badge: 'bg-white text-red-800 border-red-300',
          sidebarBg: 'bg-red-100/50'
        };
      case 'Esercitazione': 
        return { 
          cardBg: 'bg-blue-50', 
          dateBg: 'bg-blue-100',
          borderColor: 'border-blue-200',
          dateText: 'text-blue-700',
          badge: 'bg-white text-blue-700 border-blue-200',
          sidebarBg: 'bg-blue-50/50'
        };
      case 'Riunione': 
        return { 
          cardBg: 'bg-slate-100', 
          dateBg: 'bg-slate-200',
          borderColor: 'border-slate-300',
          dateText: 'text-slate-800',
          badge: 'bg-white text-slate-800 border-slate-300',
          sidebarBg: 'bg-slate-100/50'
        };
      case 'Formazione': 
        return { 
          cardBg: 'bg-emerald-50', 
          dateBg: 'bg-emerald-100',
          borderColor: 'border-emerald-200',
          dateText: 'text-emerald-700',
          badge: 'bg-white text-emerald-700 border-emerald-200',
          sidebarBg: 'bg-emerald-50/50'
        };
      default: 
        return { 
          cardBg: 'bg-amber-50', 
          dateBg: 'bg-amber-100',
          borderColor: 'border-amber-200',
          dateText: 'text-amber-700',
          badge: 'bg-white text-amber-700 border-amber-200',
          sidebarBg: 'bg-amber-50/50'
        };
    }
  };

  const theme = getTheme(event.type);

  return (
    <div 
      onClick={onClick}
      className={`${theme.cardBg} ${theme.borderColor} rounded-xl shadow-sm border overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 group ${isPast ? 'opacity-60 grayscale-[0.5]' : ''} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex flex-col flex-1">
        <div className={`flex flex-col flex-1 ${showParticipants ? 'md:flex-row' : ''}`}>
          
          {/* Main Content Area */}
          <div className="flex flex-1 min-w-0">
              {/* Left Date Strip */}
              <div className={`w-20 md:w-24 flex flex-col items-center justify-center p-2 py-4 ${theme.dateText} shrink-0 border-r ${theme.borderColor} ${theme.dateBg}`}>
                  <div className="flex flex-col items-center">
                      <span className="text-xs font-bold uppercase tracking-wider opacity-80">{dateObj.toLocaleDateString('it-IT', { weekday: 'short' })}</span>
                      <span className="text-2xl md:text-3xl font-black leading-none my-1">{dateObj.getDate()}</span>
                      <span className="text-xs md:text-sm font-bold uppercase opacity-80">{dateObj.toLocaleDateString('it-IT', { month: 'short' })}</span>
                  </div>
              </div>

              {/* Right Content Wrapper */}
              <div className="flex flex-col flex-grow min-w-0">
                  <div className="p-4 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-2 gap-2">
                          <h3 className="text-lg font-bold text-slate-800 leading-tight line-clamp-2 mt-6">{event.title}</h3>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${theme.badge} whitespace-nowrap h-fit`}>
                                {event.type}
                            </span>
                            <div className="flex gap-1">
                              {isAdmin && onEdit && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(event);
                                  }}
                                  className="p-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                                  title="Modifica evento"
                                >
                                  <Pencil size={14} />
                                </button>
                              )}
                              {isAdmin && onDelete && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(event.id);
                                  }}
                                  className="p-1 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-full transition-colors"
                                  title="Elimina evento"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                      </div>

                      <div className="space-y-1.5 mb-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Clock size={14} className="text-slate-400 shrink-0" />
                              <span>{dateObj.toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                              <MapPin size={14} className="text-slate-400 shrink-0" />
                              <span className="truncate">{event.location}</span>
                          </div>
                      </div>
                      
                      {event.description && (
                          <p className={`text-sm text-slate-500 mb-4 ${showParticipants ? 'max-h-40 overflow-y-auto' : 'line-clamp-2'}`}>
                              {event.description}
                          </p>
                      )}

                      <div className={`mt-auto pt-3 border-t ${theme.borderColor} flex items-center justify-between`}>
                          <span className="text-xs font-bold text-slate-500">Partecipanti</span>
                          <div className="flex -space-x-2 overflow-hidden pl-1">
                              {event.participants?.slice(0, 5).map(uid => {
                                  const p = allProfiles[uid];
                                  return p ? <Avatar key={uid} src={p.photoUrl} name={p.name} size="xs" className="ring-2 ring-white" /> : null;
                              })}
                              {(event.participants?.length || 0) > 5 && (
                                  <div className="w-6 h-6 rounded-full bg-white ring-2 ring-white flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-100">+{event.participants.length - 5}</div>
                              )}
                              {(!event.participants || event.participants.length === 0) && (
                                  <span className="text-[10px] text-slate-400 italic">Nessuno</span>
                              )}
                          </div>
                      </div>
                  </div>

                  {/* Action Button */}
                  <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        !isPast && onToggleParticipation(event);
                    }}
                    disabled={isPast}
                    className={`mx-4 mb-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
                        isPast 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : isParticipating 
                            ? 'bg-white text-red-600 hover:bg-red-50 ring-1 ring-inset ring-red-100' 
                            : 'bg-white text-blue-600 hover:bg-blue-50 ring-1 ring-inset ring-blue-200'
                    }`}
                  >
                    {isPast ? 'Concluso' : isParticipating ? (
                        <><X size={16} /> Annulla Iscrizione</>
                    ) : (
                        <><CheckCircle size={16} /> Partecipa all'Evento</>
                    )}
                  </button>
              </div>
          </div>

          {/* Participants Sidebar (Only when showParticipants is true) */}
          {showParticipants && (
            <div className={`w-full md:w-64 border-t md:border-t-0 md:border-l ${theme.borderColor} ${theme.sidebarBg} p-4 flex flex-col`}>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Users size={14} />
                Partecipanti ({event.participants?.length || 0})
              </h4>
              <div className="space-y-2 overflow-y-auto flex-1 pr-1 custom-scrollbar" style={{maxHeight: '20rem'}}>
                {event.participants?.map(uid => {
                  const p = allProfiles[uid];
                  if (!p) return null;
                  return (
                    <div key={uid} className="flex items-center gap-3 py-1.5 border-b border-slate-100 last:border-0">
                      <Avatar src={p.photoUrl} name={p.name} size="xs" />
                      <div className="overflow-hidden min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">{p.name}</p>
                        <p className="text-[9px] font-bold uppercase text-slate-400 truncate">{ROLE_LABELS[p.role]}</p>
                      </div>
                    </div>
                  );
                })}
                {(!event.participants || event.participants.length === 0) && (
                  <p className="text-xs text-slate-400 italic text-center py-4">Nessun partecipante.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
