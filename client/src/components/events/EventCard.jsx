import React from 'react';
import { Clock, MapPin, Users, X, CheckCircle, Trash2, Pencil, Calendar } from 'lucide-react';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import { ROLE_LABELS, ROLES, hasAdminAccess } from '../../utils/constants';
import { useAppSettings } from '../../context/AssociationSettingsContext';

const EventCard = ({ event, userProfile, allProfiles, onToggleParticipation, onClick, showParticipants, onDelete, onEdit, isModal }) => {
  const { specializations: SPECIALIZATIONS_DATA, volunteerRoles: VOLUNTEER_ROLES, eventVisibility: EVENT_VISIBILITY } = useAppSettings();
  const [activeTab, setActiveTab] = React.useState('details'); // 'details' or 'participants'
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
          sidebarBg: `bg-red-100/50 dark:bg-red-950${sidebarOpacity}`,
          accent: 'text-red-600',
          gradient: 'from-red-500 to-red-600'
        };
      case 'Esercitazione':
        return {
          cardBg: `bg-blue-50 dark:bg-blue-950${opacity}`,
          dateBg: 'bg-blue-100 dark:bg-blue-900/60',
          borderColor: 'border-blue-200 dark:border-white/30',
          dateText: 'text-blue-700 dark:text-white',
          badge: 'bg-white dark:bg-blue-900/80 text-blue-700 dark:text-white border-blue-200 dark:border-white/20',
          sidebarBg: `bg-blue-50/50 dark:bg-blue-950${sidebarOpacity}`,
          accent: 'text-blue-600',
          gradient: 'from-blue-500 to-blue-600'
        };
      case 'Riunione':
        return {
          cardBg: `bg-slate-100 dark:bg-slate-950${opacity}`,
          dateBg: 'bg-slate-200 dark:bg-slate-900/60',
          borderColor: 'border-slate-300 dark:border-white/30',
          dateText: 'text-slate-800 dark:text-white',
          badge: 'bg-white dark:bg-slate-800/80 text-slate-800 dark:text-white border-slate-300 dark:border-white/20',
          sidebarBg: `bg-slate-100/50 dark:bg-slate-950${sidebarOpacity}`,
          accent: 'text-slate-600',
          gradient: 'from-slate-500 to-slate-600'
        };
      case 'Formazione':
        return {
          cardBg: `bg-green-50 dark:bg-green-950${opacity}`,
          dateBg: 'bg-green-100 dark:bg-green-900/60',
          borderColor: 'border-green-200 dark:border-white/30',
          dateText: 'text-green-700 dark:text-white',
          badge: 'bg-white dark:bg-green-900/80 text-green-700 dark:text-white border-green-200 dark:border-white/20',
          sidebarBg: `bg-green-50/50 dark:bg-green-950${sidebarOpacity}`,
          accent: 'text-green-600',
          gradient: 'from-green-500 to-green-600'
        };
      case 'Direttivo':
        return {
          cardBg: `bg-purple-50 dark:bg-purple-950${opacity}`,
          dateBg: 'bg-purple-100 dark:bg-purple-900/60',
          borderColor: 'border-purple-200 dark:border-white/30',
          dateText: 'text-purple-700 dark:text-white',
          badge: 'bg-white dark:bg-purple-900/80 text-purple-700 dark:text-white border-purple-200 dark:border-white/20',
          sidebarBg: `bg-purple-50/50 dark:bg-purple-950${sidebarOpacity}`,
          accent: 'text-purple-600',
          gradient: 'from-purple-500 to-purple-600'
        };
      default:
        return {
          cardBg: `bg-yellow-50 dark:bg-yellow-950${opacity}`,
          dateBg: 'bg-yellow-100 dark:bg-yellow-900/60',
          borderColor: 'border-yellow-200 dark:border-white/30',
          dateText: 'text-yellow-700 dark:text-white',
          badge: 'bg-white dark:bg-yellow-900/80 text-yellow-700 dark:text-white border-yellow-200 dark:border-white/20',
          sidebarBg: `bg-yellow-50/50 dark:bg-yellow-950${sidebarOpacity}`,
          accent: 'text-yellow-600',
          gradient: 'from-yellow-400 to-yellow-500'
        };
    }
  };

  const theme = getTheme(event.type);

  if (isModal) {
    const DetailsContent = () => (
      <div className="flex flex-col h-full gap-4 overflow-hidden">
        {/* Description Area - Only area that expands and scrolls */}
        {event.description && (
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700/50 flex flex-col min-h-0 flex-1 overflow-hidden">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 shrink-0">Dettagli</h4>
            <div className="overflow-y-auto custom-scrollbar pr-1 flex-1">
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line font-medium">
                {event.description}
              </p>
            </div>
          </div>
        )}

        {/* Fixed Shifts & Action Button Area */}
        <div className="shrink-0 space-y-4 pb-2">
          {/* Shifts Section - Fixed (or small max-h if many) */}
          {event.shifts && event.shifts.length > 0 && (
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Turni</h4>
              <div className="space-y-2.5 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
                {event.shifts.map(shift => {
                  const isShiftParticipating = shift.participants?.includes(userProfile.id);
                  const currentParticipants = shift.participants?.length || 0;
                  const maxParticipants = shift.maxParticipants ? parseInt(shift.maxParticipants) : null;
                  const isFull = maxParticipants && currentParticipants >= maxParticipants;

                  return (
                    <div key={shift.id} className={`flex items-center justify-between p-3 rounded-lg border ${isShiftParticipating ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-slate-50 border-slate-100 dark:bg-slate-700/20 dark:border-slate-700'}`}>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 dark:text-white">{shift.startTime} — {shift.endTime}</span>
                        <span className="text-[9px] text-slate-400 mt-0.5 flex items-center gap-1 font-bold uppercase">
                          <Users size={10} />
                          {currentParticipants} {maxParticipants ? `/ ${maxParticipants}` : ''} Iscritti
                        </span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); !isPast && (!isFull || isShiftParticipating) && onToggleParticipation(event, shift.id); }}
                        disabled={isPast || (isFull && !isShiftParticipating)}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${isPast
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : isShiftParticipating
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : isFull
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                      >
                        {isShiftParticipating ? 'Cancella' : isFull ? 'Pieno' : 'Iscriviti'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Button (Non-Shift View) */}
          {(!event.shifts || event.shifts.length === 0) && (
            <button
              onClick={(e) => { e.stopPropagation(); !isPast && onToggleParticipation(event); }}
              disabled={isPast}
              className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 ${isPast
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : isParticipating
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
            >
              {isPast ? 'Concluso' : isParticipating ? (
                <><Trash2 size={16} /> Annulla Iscrizione</>
              ) : (
                <><CheckCircle size={16} /> Partecipa all'Evento</>
              )}
            </button>
          )}

          {/* Creator Metadata */}
          <div className="flex items-center justify-between px-1 opacity-60">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Creato da: {allProfiles[event.createdBy]?.name || 'App Chintana'}</span>
            {event.visibility && (
              <Badge
                text={event.visibility}
                color={event.visibility === 'Solo Direttivo' ? 'purple' : event.visibility === 'Solo Cinofili' ? 'orange' : 'gray'}
                className="!bg-transparent !py-0.5"
              />
            )}
          </div>
        </div>
      </div>
    );

    const ParticipantsContent = () => (
      <div className="space-y-5 pb-10">
        {event.shifts && event.shifts.length > 0 ? (
          event.shifts.map(shift => (
            <div key={shift.id} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700/50">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Clock size={12} /> {shift.startTime} — {shift.endTime}
              </h5>
              <div className="space-y-2">
                {shift.participants?.map(uid => {
                  const p = allProfiles[uid];
                  if (!p) return null;
                  const isK9 = p.volunteerRole === VOLUNTEER_ROLES.K9;
                  const isBoard = p.role === ROLES.PRESIDENT || p.role === ROLES.BOARD;
                  return (
                    <div key={uid} className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-100 dark:border-slate-700/50">
                      <Avatar src={p.photoUrl} name={p.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-700 dark:text-white truncate">{p.name}</p>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          <Badge text={ROLE_LABELS[p.role]} color={isBoard ? 'purple' : 'gray'} className="!text-[8px] !py-0 !px-1.5" />
                          {isK9 && <Badge text="Cinofilo" color="orange" className="!text-[8px] !py-0 !px-1.5" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {(!shift.participants || shift.participants.length === 0) && (
                <p className="text-xs text-slate-400 italic py-4 text-center">Nessun iscritto.</p>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700/50">
            <div className="space-y-2">
              {event.participants?.map(uid => {
                const p = allProfiles[uid];
                if (!p) return null;
                const isK9 = p.volunteerRole === VOLUNTEER_ROLES.K9;
                const isBoard = p.role === ROLES.PRESIDENT || p.role === ROLES.BOARD;
                return (
                  <div key={uid} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-100 dark:border-slate-700/50">
                    <Avatar src={p.photoUrl} name={p.name} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-bold text-slate-700 dark:text-white truncate">{p.name}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge text={ROLE_LABELS[p.role]} color={isBoard ? 'purple' : 'gray'} className="!text-[8px] !py-0 !px-1.5" />
                        {isK9 && <Badge text="Cinofilo" color="orange" className="!text-[8px] !py-0 !px-1.5" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {(!event.participants || event.participants.length === 0) && (
              <div className="py-12 text-center text-slate-400">
                <Users size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">Nessun partecipante</p>
              </div>
            )}
          </div>
        )}
      </div>
    );

    return (
      <div className={`flex flex-col h-fit max-h-full bg-white dark:bg-slate-900 overflow-hidden`}>
        {/* Simplified Header */}
        <div className={`p-6 bg-gradient-to-r ${theme.gradient} text-white relative shrink-0`}>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <Badge text={event.type} color={theme.gradient.includes('red') ? 'red' : 'blue'} className="bg-white/20 border-white/30 text-white" />
              <div className="flex gap-1.5 mr-10 sm:mr-0">
                {isAdmin && onEdit && (
                  <button onClick={() => onEdit(event)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                    <Pencil size={18} />
                  </button>
                )}
                {isAdmin && onDelete && (
                  <button onClick={() => onDelete(event.id)} className="p-2 hover:bg-red-500/30 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
            <h2 className="text-2xl font-black leading-tight mb-4">{event.title}</h2>
            <div className="flex flex-wrap items-center gap-3 text-white/90 font-bold text-[11px]">
              <div className="flex items-center gap-1.5 bg-black/10 px-3 py-1.5 rounded-lg border border-white/10">
                <Clock size={14} />
                <span>{dateObj.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })} • {event.time}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/10 px-3 py-1.5 rounded-lg border border-white/10">
                <MapPin size={14} />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Improved Tabs (Mobile Only) */}
        <div className="flex sm:hidden border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-20 shrink-0">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'details' ? 'text-blue-600 dark:text-yellow-400' : 'text-slate-400'}`}
          >
            Dettagli
            {activeTab === 'details' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-yellow-400" />}
          </button>
          <button
            onClick={() => setActiveTab('participants')}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'participants' ? 'text-blue-600 dark:text-yellow-400' : 'text-slate-400'}`}
          >
            Iscritti ({event.participants?.length || 0})
            {activeTab === 'participants' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-yellow-400" />}
          </button>
        </div>

        {/* Modal Body */}
        <div className={`flex-1 bg-slate-50 dark:bg-slate-900/50 overflow-hidden min-h-0`}>
          {/* Desktop Two-Column Layout */}
          <div className="hidden sm:grid sm:grid-cols-2 h-full overflow-hidden items-stretch">
            <div className="p-5 overflow-hidden flex flex-col border-r border-slate-100 dark:border-slate-800 min-h-0">
              <DetailsContent />
            </div>
            <div className="p-5 overflow-y-auto custom-scrollbar flex flex-col min-h-0">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 shrink-0 px-1">Iscritti ({event.participants?.length || 0})</h4>
              <ParticipantsContent />
            </div>
          </div>

          {/* Mobile Tabbed Layout */}
          <div className="sm:hidden flex flex-col h-full overflow-hidden">
            <div className={`flex-1 overflow-y-auto custom-scrollbar p-5 min-h-0`}>
              {activeTab === 'details' ? <DetailsContent /> : <ParticipantsContent />}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- REGULAR CARD VIEW (NON-MODAL) ---
  return (
    <div
      onClick={onClick}
      className={`${theme.cardBg} ${theme.borderColor} rounded-xl shadow-sm border overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 group ${isPast ? 'opacity-60 grayscale-[0.5]' : ''} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex flex-col flex-1">
        <div className="flex flex-col flex-1">
          {/* Main Content Area */}
          <div className="flex flex-1 min-w-0">
            {/* Left Date Strip */}
            <div className={`min-w-[5rem] md:min-w-[5.5rem] flex flex-col items-center justify-center p-2 py-4 ${theme.dateText} shrink-0 border-r ${theme.borderColor} ${theme.dateBg}`}>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{dateObj.toLocaleDateString('it-IT', { weekday: 'short' })}</span>
                <span className="text-3xl font-black leading-none my-1">{dateObj.getDate()}</span>
                <span className="text-[11px] font-black uppercase tracking-widest opacity-80">{dateObj.toLocaleDateString('it-IT', { month: 'short' })}</span>
              </div>
            </div>

            {/* Right Content Wrapper */}
            <div className="flex flex-col flex-grow min-w-0">
              <div className="p-4 flex flex-col flex-grow">
                <div className="flex flex-wrap justify-between items-start mb-2 gap-x-2 gap-y-1">
                  <h3 className="text-base font-black text-slate-800 dark:text-white leading-tight line-clamp-2 pr-1 flex-1">{event.title}</h3>
                  <div className="flex flex-col items-end gap-1 ml-auto shrink-0">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${theme.badge} whitespace-nowrap h-fit`}>
                      {event.type}
                    </span>
                    {event.visibility && event.visibility !== 'Tutti' && (
                      <Badge
                        text={event.visibility === 'Solo Direttivo' ? 'Direttivo' : event.visibility === 'Solo Cinofili' ? 'Cinofili' : event.visibility}
                        color={event.visibility === 'Solo Direttivo' ? 'purple' : event.visibility === 'Solo Cinofili' ? 'orange' : 'gray'}
                        className="!text-[8px] !py-0 !px-1.5 border-transparent"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Clock size={12} className="text-slate-400 shrink-0" />
                    <span>{dateObj.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <MapPin size={12} className="text-slate-400 shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>

                <div className={`mt-auto pt-3 border-t ${theme.borderColor} flex items-center justify-between gap-2`}>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Partecipanti ({event.participants?.length || 0})</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isPast) return;
                        if (event.shifts && event.shifts.length > 0) {
                          onClick && onClick();
                        } else {
                          onToggleParticipation(event);
                        }
                      }}
                      className={`mt-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 w-fit ${isPast
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : isParticipating
                            ? 'bg-emerald-500 text-white'
                            : 'bg-blue-600 dark:bg-[#facc15] text-white dark:text-slate-900 hover:brightness-110 active:scale-95'
                        }`}
                    >
                      {isParticipating ? (
                        <><CheckCircle size={12} /> Iscritto</>
                      ) : (
                        <><Calendar size={12} /> {event.shifts && event.shifts.length > 0 ? 'Vedi Turni' : 'Partecipa'}</>
                      )}
                    </button>
                  </div>
                  <div className="flex -space-x-1.5 overflow-hidden pl-1 shrink-0">
                    {event.participants?.slice(0, 4).map(uid => {
                      const p = allProfiles[uid];
                      return p ? <Avatar key={uid} src={p.photoUrl} name={p.name} size="xs" className="ring-2 ring-white dark:ring-slate-800" /> : null;
                    })}
                    {(event.participants?.length || 0) > 4 && (
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 ring-2 ring-white dark:ring-slate-800 flex items-center justify-center text-[9px] font-black text-slate-500">+{event.participants.length - 4}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
