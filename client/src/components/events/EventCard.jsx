import React from 'react';
import { Clock, MapPin, Users, X, CheckCircle, Trash2, Pencil } from 'lucide-react';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import { ROLE_LABELS, hasAdminAccess, SPECIALIZATIONS_DATA, VOLUNTEER_ROLES, EVENT_VISIBILITY } from '../../utils/constants';

const EventCard = ({ event, userProfile, allProfiles, onToggleParticipation, onClick, showParticipants, onDelete, onEdit, isModal }) => {
  const isParticipating = event.participants?.includes(userProfile.id);
  const dateObj = new Date(event.date);
  const isPast = dateObj < new Date();
  const isAdmin = hasAdminAccess(userProfile);

  // Determine theme based on type
  const getTheme = (type) => {
    const opacity = isModal ? '' : '/40';
    const sidebarOpacity = isModal ? '' : '/20';

    switch (type) {
      case 'Emergenza':
        return {
          cardBg: `bg-red-100 dark:bg-red-950${opacity}`,
          dateBg: 'bg-red-200 dark:bg-red-900/60',
          borderColor: 'border-red-300 dark:border-white/30',
          dateText: 'text-red-800 dark:text-white',
          badge: 'bg-white dark:bg-red-900/80 text-red-800 dark:text-white border-red-300 dark:border-white/20',
          sidebarBg: `bg-red-100/50 dark:bg-red-950${sidebarOpacity}`
        };
      case 'Esercitazione':
        return {
          cardBg: `bg-blue-50 dark:bg-blue-950${opacity}`,
          dateBg: 'bg-blue-100 dark:bg-blue-900/60',
          borderColor: 'border-blue-200 dark:border-white/30',
          dateText: 'text-blue-700 dark:text-white',
          badge: 'bg-white dark:bg-blue-900/80 text-blue-700 dark:text-white border-blue-200 dark:border-white/20',
          sidebarBg: `bg-blue-50/50 dark:bg-blue-950${sidebarOpacity}`
        };
      case 'Riunione':
        return {
          cardBg: `bg-slate-100 dark:bg-slate-950${opacity}`,
          dateBg: 'bg-slate-200 dark:bg-slate-900/60',
          borderColor: 'border-slate-300 dark:border-white/30',
          dateText: 'text-slate-800 dark:text-white',
          badge: 'bg-white dark:bg-slate-800/80 text-slate-800 dark:text-white border-slate-300 dark:border-white/20',
          sidebarBg: `bg-slate-100/50 dark:bg-slate-950${sidebarOpacity}`
        };
      case 'Formazione':
        return {
          cardBg: `bg-green-50 dark:bg-green-950${opacity}`,
          dateBg: 'bg-green-100 dark:bg-green-900/60',
          borderColor: 'border-green-200 dark:border-white/30',
          dateText: 'text-green-700 dark:text-white',
          badge: 'bg-white dark:bg-green-900/80 text-green-700 dark:text-white border-green-200 dark:border-white/20',
          sidebarBg: `bg-green-50/50 dark:bg-green-950${sidebarOpacity}`
        };
      case 'Direttivo':
        return {
          cardBg: `bg-purple-50 dark:bg-purple-950${opacity}`,
          dateBg: 'bg-purple-100 dark:bg-purple-900/60',
          borderColor: 'border-purple-200 dark:border-white/30',
          dateText: 'text-purple-700 dark:text-white',
          badge: 'bg-white dark:bg-purple-900/80 text-purple-700 dark:text-white border-purple-200 dark:border-white/20',
          sidebarBg: `bg-purple-50/50 dark:bg-purple-950${sidebarOpacity}`
        };
      default:
        return {
          cardBg: `bg-yellow-50 dark:bg-yellow-950${opacity}`,
          dateBg: 'bg-yellow-100 dark:bg-yellow-900/60',
          borderColor: 'border-yellow-200 dark:border-white/30',
          dateText: 'text-yellow-700 dark:text-white',
          badge: 'bg-white dark:bg-yellow-900/80 text-yellow-700 dark:text-white border-yellow-200 dark:border-white/20',
          sidebarBg: `bg-yellow-50/50 dark:bg-yellow-950${sidebarOpacity}`
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
            <div className={`min-w-[5rem] md:min-w-[6rem] flex flex-col items-center justify-center p-2 py-4 ${theme.dateText} shrink-0 border-r ${theme.borderColor} ${theme.dateBg}`}>
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold uppercase tracking-wider opacity-80">{dateObj.toLocaleDateString('it-IT', { weekday: 'short' })}</span>
                <span className="text-2xl md:text-3xl font-black leading-none my-1">{dateObj.getDate()}</span>
                <span className="text-xs md:text-sm font-bold uppercase opacity-80">{dateObj.toLocaleDateString('it-IT', { month: 'short' })}</span>
              </div>
            </div>

            {/* Right Content Wrapper */}
            <div className="flex flex-col flex-grow min-w-0">
              <div className="p-4 flex flex-col flex-grow">
                <div className="flex flex-wrap justify-between items-start mb-2 gap-x-2 gap-y-1">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight line-clamp-2 mt-6 mr-1 min-w-[12.5rem]">{event.title}</h3>
                  <div className="flex flex-col items-end gap-1 ml-auto shrink-0">
                    <span className={`text-[0.625rem] sm:text-xs font-bold uppercase px-2 py-0.5 rounded-md border ${theme.badge} whitespace-nowrap h-fit`}>
                      {event.type}
                    </span>
                    {event.visibility && event.visibility !== EVENT_VISIBILITY.ALL && (
                      <span className={`text-[0.625rem] sm:text-xs font-bold uppercase px-2 py-0.5 rounded-md border whitespace-nowrap h-fit ${event.visibility === EVENT_VISIBILITY.BOARD_ONLY
                        ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/60 dark:text-white dark:border-purple-700/50'
                        : event.visibility === EVENT_VISIBILITY.K9_ONLY
                          ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/60 dark:text-white dark:border-amber-700/50'
                          : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-white dark:border-slate-700/50'
                        }`}>
                        {event.visibility}
                      </span>
                    )}
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
                    <span>{dateObj.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span>
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

                {!showParticipants && (
                  <div className={`mt-auto pt-3 border-t ${theme.borderColor} flex items-center justify-between`}>
                    <span className="text-xs font-bold text-slate-500">Partecipanti</span>
                    <div className="flex -space-x-2 overflow-hidden pl-1">
                      {event.participants?.slice(0, 5).map(uid => {
                        const p = allProfiles[uid];
                        return p ? <Avatar key={uid} src={p.photoUrl} name={p.name} size="xs" className="ring-2 ring-transparent bg-transparent" /> : null;
                      })}
                      {(event.participants?.length || 0) > 5 && (
                        <div className="w-6 h-6 rounded-full bg-transparent ring-2 ring-transparent flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-100">+{event.participants.length - 5}</div>
                      )}
                      {(!event.participants || event.participants.length === 0) && (
                        <span className="text-xs text-slate-400 italic">Nessuno</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Shifts Section */}
              {event.shifts && event.shifts.length > 0 ? (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">Turni Disponibili</p>
                  {event.shifts.map(shift => {
                    const isShiftParticipating = shift.participants?.includes(userProfile.id);
                    const currentParticipants = shift.participants?.length || 0;
                    const maxParticipants = shift.maxParticipants ? parseInt(shift.maxParticipants) : null;
                    const isFull = maxParticipants && currentParticipants >= maxParticipants;

                    return (
                      <div key={shift.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-700">{shift.startTime} - {shift.endTime}</span>
                          <span className="text-xs text-slate-500">
                            {currentParticipants} {maxParticipants ? `/ ${maxParticipants}` : ''} iscritti
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            !isPast && (!isFull || isShiftParticipating) && onToggleParticipation(event, shift.id);
                          }}
                          disabled={isPast || (isFull && !isShiftParticipating)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isPast
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : isShiftParticipating
                              ? 'bg-red-100 text-red-600 hover:bg-red-200'
                              : isFull
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                            }`}
                        >
                          {isShiftParticipating ? 'Annulla' : isFull ? 'Pieno' : 'Partecipa'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Action Button (Legacy) */
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    !isPast && onToggleParticipation(event);
                  }}
                  disabled={isPast}
                  className={`mx-4 mb-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${isPast
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
              )}
            </div>
          </div>

          {/* Participants Sidebar (Only when showParticipants is true) */}
          {showParticipants && (
            <div className={`w-full md:w-64 border-t md:border-t-0 md:border-l ${theme.borderColor} ${theme.sidebarBg} p-4 flex flex-col`}>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Users size={14} />
                Partecipanti ({event.participants?.length || 0})
              </h4>
              <div className="space-y-4 overflow-y-auto flex-1 pr-1 custom-scrollbar" style={{ maxHeight: '20rem' }}>
                {event.shifts && event.shifts.length > 0 ? (
                  event.shifts.map(shift => (
                    <div key={shift.id}>
                      <h5 className="text-xs font-bold text-slate-400 uppercase mb-1 border-b border-slate-200 pb-1">
                        {shift.startTime} - {shift.endTime}
                      </h5>
                      {shift.participants?.map(uid => {
                        const p = allProfiles[uid];
                        if (!p) return null;
                        const isCinofilo = p.volunteerRole === VOLUNTEER_ROLES.K9;
                        return (
                          <div key={uid} className="flex items-center gap-3 py-1.5">
                            <Avatar src={p.photoUrl} name={p.name} size="xs" />
                            <div className="overflow-hidden min-w-0">
                              <p className="text-xs font-bold text-slate-700 truncate">{p.name}</p>
                              <p className="text-[0.5625rem] font-bold uppercase text-slate-400 truncate">
                                {ROLE_LABELS[p.role]}
                                {isCinofilo && <span className="ml-1 text-amber-600">• Cinofilo</span>}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      {(!shift.participants || shift.participants.length === 0) && (
                        <p className="text-xs text-slate-400 italic">Nessun iscritto.</p>
                      )}
                    </div>
                  ))
                ) : (
                  <>
                    {event.participants?.map(uid => {
                      const p = allProfiles[uid];
                      if (!p) return null;
                      const isCinofilo = p.volunteerRole === VOLUNTEER_ROLES.K9;
                      return (
                        <div key={uid} className="flex items-center gap-3 py-1.5 border-b border-slate-100 last:border-0">
                          <Avatar src={p.photoUrl} name={p.name} size="xs" />
                          <div className="overflow-hidden min-w-0">
                            <p className="text-xs font-bold text-slate-700 truncate">{p.name}</p>
                            <p className="text-[0.5625rem] font-bold uppercase text-slate-400 truncate">
                              {ROLE_LABELS[p.role]}
                              {isCinofilo && <span className="ml-1 text-amber-600">• Cinofilo</span>}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {(!event.participants || event.participants.length === 0) && (
                      <p className="text-xs text-slate-400 italic text-center py-4">Nessun partecipante.</p>
                    )}
                  </>
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
