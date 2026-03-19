import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, List, ChevronDown, PlusCircle, CalendarPlus, X, AlertTriangle, User, Search, SlidersHorizontal, Share2, Copy, Check, ExternalLink } from 'lucide-react';
import { SiGoogle, SiApple } from 'react-icons/si';
import { hasAdminAccess, EVENT_TYPES, canManageContent, EVENT_VISIBILITY } from '../../utils/constants';
import { appId } from '../../services/firebase';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import CalendarGrid from '../../components/events/CalendarGrid';
import EventCard from '../../components/events/EventCard';
import { useEventsDashboard } from './EventsDashboardLogic';
import CustomSelect from '../../components/ui/CustomSelect';
import DeleteConfirmationModal from '../../components/ui/DeleteConfirmationModal';
import './EventsDashboard.css';

const EventsDashboard = ({ userProfile }) => {
  const {
    allProfiles,
    isCreateModalOpen,
    viewMode,
    selectedEvent,
    filterType,
    filterParticipation,
    searchTerm,
    searchDate,
    newEvent,
    filteredEvents,
    pastEvents,
    setViewMode,
    setFilterType,
    setFilterParticipation,
    setSearchTerm,
    setSearchDate,
    setSelectedEvent,
    setIsCreateModalOpen,
    setNewEvent,
    toggleParticipation,
    handleCreateEvent,
    deleteEvent,
    openCreateModal,
    openEditModal,
    isEditing,
    isFiltersOpen,
    toggleFilters,
    addShift,
    removeShift,
    updateShift
  } = useEventsDashboard(userProfile);

  const location = useLocation();
  const navigate = useNavigate();

  // Delete Modal State
  const [deleteModal, setDeleteModal] = React.useState({
    isOpen: false,
    eventId: null
  });
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Calendar Export Modal State
  const [isCalendarExportOpen, setIsCalendarExportOpen] = React.useState(false);
  const [exportMode, setExportMode] = React.useState('all'); // 'all' or 'mine'
  const [copied, setCopied] = React.useState(false);
  const [v, setV] = React.useState(1); // Version for cache busting

  const getCalendarFeedUrl = () => {
    let url = `${window.location.origin}/api/calendar.ics?appId=${appId}&v=${v}`;
    if (exportMode === 'mine' && userProfile?.id) {
      url += `&userId=${userProfile.id}`;
    }
    return url;
  };

  const CALENDAR_FEED_URL = getCalendarFeedUrl();
  const GOOGLE_CALENDAR_ADD_URL = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(CALENDAR_FEED_URL.replace('https://', 'webcal://').replace('http://', 'webcal://'))}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(CALENDAR_FEED_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = CALENDAR_FEED_URL;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRefreshLink = () => {
    setV(prev => prev + 1);
  };


  const openDeleteModal = (eventId) => {
    setDeleteModal({ isOpen: true, eventId });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.eventId) return;

    setIsDeleting(true);
    try {
      await deleteEvent(deleteModal.eventId);
      setDeleteModal({ isOpen: false, eventId: null });
    } catch (error) {
      console.error("Error deleting event:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    // Support both location.state.selectedEventId and URL query parameter ?eventId=
    const searchParams = new URLSearchParams(location.search);
    const eventIdFromQuery = searchParams.get('eventId');
    const eventIdFromState = location.state?.selectedEventId;
    const targetEventId = eventIdFromQuery || eventIdFromState;

    if (targetEventId && filteredEvents.length > 0) {
      const eventToSelect = filteredEvents.find(e => e.id === targetEventId);
      if (eventToSelect) {
        setSelectedEvent(eventToSelect);
        // Clear the state/query so it doesn't reopen on re-renders
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, location.search, filteredEvents, setSelectedEvent, navigate, location.pathname]);

  const eventTypeOptions = Object.entries(EVENT_TYPES).map(([type, data]) => {
    let colorClass = '';
    // Simple mapping based on type or data.color
    if (type === 'Servizio') colorClass = 'bg-amber-500';
    else if (type === 'Riunione') colorClass = 'bg-slate-500';
    else if (type === 'Emergenza') colorClass = 'bg-red-500';
    else if (type === 'Esercitazione') colorClass = 'bg-blue-500';
    else if (type === 'Formazione') colorClass = 'bg-emerald-500';
    else colorClass = 'bg-slate-500';

    return {
      value: type,
      label: type,
      color: colorClass
    };
  });

  const visibilityOptions = Object.values(EVENT_VISIBILITY).map(v => ({
    value: v,
    label: v
  }));

  return (
    <div className="events-container">
      <div className="events-header">
        <div className="events-title-row flex-nowrap gap-2 overflow-hidden">
          <div className="events-title-group !gap-2 flex-shrink min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2 sm:gap-3 whitespace-nowrap overflow-hidden text-ellipsis leading-tight">
                <Calendar className="text-blue-600 shrink-0 w-6 h-6 sm:w-8 sm:h-8" /> <span className="truncate">Calendario Attività</span>
              </h1>
            
          </div>
          <div className="flex items-center gap-2 ml-auto shrink-0">
            <button
              onClick={() => setIsCalendarExportOpen(true)}
              className="calendar-export-btn"
              title="Esporta Calendario"
            >
              <Share2 size={18} />
            </button>
            <div className="view-toggle-group space-x-0.5">
              <button
                onClick={() => setViewMode('list')}
                className={`view-toggle-btn !p-1.5 md:!p-3 ${viewMode === 'list' ? 'view-toggle-btn-active' : 'view-toggle-btn-inactive'}`}
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`view-toggle-btn !p-1.5 md:!p-3 ${viewMode === 'calendar' ? 'view-toggle-btn-active' : 'view-toggle-btn-inactive'}`}
              >
                <Calendar size={18} />
              </button>
            </div>
          </div>
        </div>


        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Cerca evento..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative hidden md:block">
              <input
                type="date"
                className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white transition-all font-medium"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
            </div>

            {/* Mobile Filter Toggle */}
            <div className="md:hidden flex border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm h-[46px]">
              <button
                onClick={toggleFilters}
                className={`w-[48px] transition-all flex items-center justify-center ${isFiltersOpen
                  ? 'bg-[#004d9d] dark:bg-[#facc15] text-white dark:text-slate-900 shadow-inner'
                  : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
              >
                <SlidersHorizontal size={20} />
              </button>
            </div>

            {canManageContent(userProfile) && (
              <button
                onClick={openCreateModal}
                className="hidden md:flex items-center gap-2 bg-blue-600 dark:bg-[#facc15] hover:bg-blue-700 text-white dark:!text-[#0f172a] px-4 py-3 rounded-2xl transition-all shadow-sm hover:shadow-md active:scale-95 shrink-0 ml-auto text-sm font-bold"
              >
                <CalendarPlus size={18} />
                Nuovo Evento
              </button>
            )}
          </div>
          {/* Mobile Filters Dropdown */}
          <div className="relative md:hidden">
            {isFiltersOpen && (
              <div className="absolute top-full right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-20 p-4 animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-slate-700 dark:text-slate-200 text-base">Filtri</span>
                  <button
                    onClick={() => {
                      setFilterType('Tutti');
                      setFilterParticipation('Tutti');
                      setSearchDate('');
                      setSearchTerm('');
                    }}
                    className="text-xs font-bold text-red-500 hover:text-red-600"
                  >
                    Resetta
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400 ml-1">Tipologia</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setFilterType('Tutti')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${filterType === 'Tutti' ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}
                      >
                        Tutti
                      </button>
                      {Object.entries(EVENT_TYPES).map(([type, data]) => {
                        const isSelected = filterType === type;

                        // Solid colors for better visibility on small dots
                        let solidColor = 'bg-slate-500';
                        if (type === 'Servizio') solidColor = 'bg-amber-500';
                        else if (type === 'Esercitazione') solidColor = 'bg-blue-500';
                        else if (type === 'Emergenza') solidColor = 'bg-red-500';
                        else if (type === 'Formazione') solidColor = 'bg-emerald-500';
                        else if (type === 'Riunione') solidColor = 'bg-slate-500';

                        return (
                          <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${isSelected ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900 border-none' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}
                          >
                            <span className={`w-3 h-3 rounded-full shadow-sm ${isSelected ? 'bg-white dark:bg-slate-900' : solidColor}`}></span>
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400 ml-1">Data</p>
                    <input
                      type="date"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white transition-all text-sm font-medium"
                      value={searchDate}
                      onChange={(e) => setSearchDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400 ml-1">Partecipazione</p>
                    <button
                      onClick={() => setFilterParticipation(filterParticipation === 'Tutti' ? 'I miei eventi' : 'Tutti')}
                      className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${filterParticipation === 'I miei eventi' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                    >
                      <User size={16} />
                      {filterParticipation === 'I miei eventi' ? 'Mostra tutti' : 'Filtra i miei eventi'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>


          {/* Desktop Filters */}
          <div className="hidden md:flex flex-wrap items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => setFilterType('Tutti')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all border whitespace-nowrap ${filterType === 'Tutti' ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-800 dark:border-slate-100 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
              Tutti
            </button>

            {Object.entries(EVENT_TYPES).map(([type, data]) => {
              const isSelected = filterType === type;

              let selectedClass = '';
              switch (type) {
                case 'Servizio':
                  selectedClass = 'bg-[var(--color-pc-yellow)] text-slate-900 border-[var(--color-pc-yellow)] shadow-md';
                  break;
                case 'Riunione':
                  selectedClass = 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-600 shadow-md';
                  break;
                case 'Formazione':
                  selectedClass = 'bg-[var(--color-pc-green)] text-white border-[var(--color-pc-green)] shadow-md';
                  break;
                case 'Esercitazione':
                  selectedClass = 'bg-[var(--color-pc-blue)] text-white border-[var(--color-pc-blue)] shadow-md';
                  break;
                case 'Emergenza':
                  selectedClass = 'bg-[var(--color-pc-red)] text-white border-[var(--color-pc-red)] shadow-md';
                  break;
                default:
                  // Fallback for custom types
                  const colorMatch = data.color.match(/bg-(\w+)-50/);
                  const colorName = colorMatch ? colorMatch[1] : 'slate';
                  selectedClass = `bg-${colorName}-500 text-white border-${colorName}-500 shadow-md`;
              }

              return (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all border whitespace-nowrap ${isSelected
                    ? selectedClass
                    : `${data.color} hover:brightness-95`
                    }`}
                >
                  {type}
                </button>
              );
            })}

            <div className="w-px h-6 bg-slate-200 mx-2 hidden md:block"></div>

            <button
              onClick={() => setFilterParticipation(filterParticipation === 'Tutti' ? 'I miei eventi' : 'Tutti')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all border flex items-center gap-2 whitespace-nowrap ${filterParticipation === 'I miei eventi' ? 'bg-[var(--color-pc-yellow-600)] text-white border-[var(--color-pc-yellow-600)] shadow-md' : 'bg-[var(--color-pc-yellow-50)] dark:bg-yellow-900/20 text-slate-700 dark:text-yellow-100 border-[var(--color-pc-yellow-200)] dark:border-yellow-800 hover:bg-[var(--color-pc-yellow-100)] dark:hover:bg-yellow-900/40'}`}
            >
              <User size={16} />
              I miei eventi
            </button>
          </div>
        </div>
      </div>

      {
        viewMode === 'calendar' ? (
          <CalendarGrid events={filteredEvents} userProfile={userProfile} onEventClick={setSelectedEvent} />
        ) : (
          <>
            {filteredEvents.length === 0 ? (
              <Card className="empty-state">
                <div className="empty-icon-wrapper">
                  <Calendar size={32} />
                </div>
                <p className="empty-text">Nessuna attività trovata con i filtri selezionati.</p>
              </Card>
            ) : (
              <div className="events-grid">
                {filteredEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    userProfile={userProfile}
                    allProfiles={allProfiles}
                    onToggleParticipation={toggleParticipation}
                    onClick={() => setSelectedEvent(event)}
                    onDelete={canManageContent(userProfile) ? () => openDeleteModal(event.id) : undefined}
                    onEdit={canManageContent(userProfile) ? openEditModal : undefined}
                  />
                ))}
              </div>
            )}
          </>
        )
      }

      {
        viewMode !== 'calendar' && pastEvents.length > 0 && (
          <div className="mt-12 border-t border-slate-200 pt-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Calendar className="text-slate-400" size={20} />
              Eventi Conclusi
            </h3>
            <div className="events-grid opacity-90 hover:opacity-100 transition-opacity">
              {pastEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  userProfile={userProfile}
                  allProfiles={allProfiles}
                  onToggleParticipation={toggleParticipation}
                  onClick={() => setSelectedEvent(event)}
                  onDelete={canManageContent(userProfile) ? () => openDeleteModal(event.id) : undefined}
                  onEdit={canManageContent(userProfile) ? openEditModal : undefined}
                />
              ))}
            </div>
          </div>
        )
      }

      {
        selectedEvent && (
          <div className="modal-overlay animate-in fade-in" onClick={() => setSelectedEvent(null)}>
            <div className="modal-content-wrapper modal-wide" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setSelectedEvent(null)}
                className="modal-close-btn-large"
              >
                <X size={20} />
              </button>
              <EventCard
                event={selectedEvent}
                userProfile={userProfile}
                allProfiles={allProfiles}
                onToggleParticipation={toggleParticipation}
                showParticipants={true}
                isModal={true}
                onDelete={canManageContent(userProfile) ? () => openDeleteModal(selectedEvent.id) : undefined}
                onEdit={canManageContent(userProfile) ? openEditModal : undefined}
              />
            </div>
          </div>
        )
      }

      {
        canManageContent(userProfile) && (
          <button
            onClick={openCreateModal}
            className="fixed right-6 bottom-24 lg:hidden w-14 h-14 bg-blue-600 dark:bg-[#facc15] text-white dark:!text-[#0f172a] rounded-full shadow-lg flex items-center justify-center z-40 transition-transform active:scale-95"
          >
            <CalendarPlus size={28} />
          </button>
        )
      }

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        title="Elimina Evento"
        message="Sei sicuro di voler eliminare questo evento? Questa azione non può essere annullata."
      />

      {
        isCreateModalOpen && (
          <div className="modal-overlay animate-in fade-in edit-create-modal" onClick={() => setIsCreateModalOpen(false)}>
            <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title flex items-center gap-2">
                  {isEditing ? <Calendar size={24} className="text-blue-600" /> : <CalendarPlus size={24} className="text-blue-600" />}
                  <span>{isEditing ? 'Modifica Evento' : 'Nuovo Evento'}</span>
                </h3>
                <button onClick={() => setIsCreateModalOpen(false)} className="modal-close-btn"><X size={20} /></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleCreateEvent} className="form-space">
                  <div>
                    <label className="form-label">Titolo Evento</label>
                    <input type="text" className="form-input" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Tipologia</label>
                      <CustomSelect
                        value={newEvent.type}
                        onChange={val => setNewEvent({ ...newEvent, type: val })}
                        options={eventTypeOptions}
                      />
                    </div>
                    <div>
                      <label className="form-label">Visibilità</label>
                      <CustomSelect
                        value={newEvent.visibility}
                        onChange={val => setNewEvent({ ...newEvent, visibility: val })}
                        options={visibilityOptions}
                      />
                    </div>
                  </div>
                  <div className="form-grid">
                    <div>
                      <label className="form-label">Data</label>
                      <input type="date" className="form-input" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} required />
                    </div>
                    <div>
                      <label className="form-label">Ora</label>
                      <input type="time" className="form-input" value={newEvent.time} onChange={e => setNewEvent({ ...newEvent, time: e.target.value })} required />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Luogo</label>
                    <input type="text" className="form-input" value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} required />
                  </div>
                  <div>
                    <label className="form-label">Descrizione</label>
                    <textarea className="form-textarea" rows="3" value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}></textarea>
                  </div>

                  {/* Gestione Turni */}
                  <div className="border-t border-slate-100 pt-4 mt-2">
                    <div className="flex justify-between items-center mb-3">
                      <label className="form-label mb-0">Turni (Opzionale)</label>
                      <button
                        type="button"
                        onClick={addShift}
                        className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        + Aggiungi Turno
                      </button>
                    </div>

                    {newEvent.shifts && newEvent.shifts.length > 0 ? (
                      <div className="space-y-3">
                        {newEvent.shifts.map((shift, index) => (
                          <div key={shift.id || index} className="bg-slate-50 p-3 rounded-xl border border-slate-200 relative">
                            <button
                              type="button"
                              onClick={() => removeShift(index)}
                              className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                            >
                              <X size={16} />
                            </button>
                            <div className="grid grid-cols-3 gap-3 pr-6">
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Inizio</label>
                                <input
                                  type="time"
                                  className="w-full p-2 rounded-lg border border-slate-200 text-sm"
                                  value={shift.startTime}
                                  onChange={e => updateShift(index, 'startTime', e.target.value)}
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Fine</label>
                                <input
                                  type="time"
                                  className="w-full p-2 rounded-lg border border-slate-200 text-sm"
                                  value={shift.endTime}
                                  onChange={e => updateShift(index, 'endTime', e.target.value)}
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Max Pers.</label>
                                <input
                                  type="number"
                                  className="w-full p-2 rounded-lg border border-slate-200 text-sm"
                                  value={shift.maxParticipants}
                                  onChange={e => updateShift(index, 'maxParticipants', e.target.value)}
                                  placeholder="∞"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Nessun turno definito. L'evento sarà a partecipazione unica.</p>
                    )}
                  </div>
                  <div className="form-submit-wrapper">
                    <Button type="submit" className="form-submit-btn">{isEditing ? 'Salva Modifiche' : 'Pubblica Evento'}</Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )
      }

      {/* Calendar Export Modal */}
      {isCalendarExportOpen && (
        <div className="modal-overlay animate-in fade-in" onClick={() => setIsCalendarExportOpen(false)}>
          <div className="calendar-export-modal" onClick={(e) => e.stopPropagation()}>

            {/* Premium Header with Gradient */}
            <div className="cal-export-header">
              <div className="cal-export-header-content">
                <div className="cal-export-header-icon">
                  <Calendar size={24} />
                </div>
                <div>
                  <h3 className="cal-export-header-title">Sincronizza Calendario</h3>
                  <p className="cal-export-header-sub">{exportMode === 'all' ? 'Tutti gli eventi pubblici' : 'Solo i turni a cui partecipi'}</p>
                </div>
              </div>
              <button onClick={() => setIsCalendarExportOpen(false)} className="cal-export-close-btn">
                <X size={20} />
              </button>
            </div>

            <div className="cal-export-body">
              {/* Export Mode Toggle */}
              <div className="cal-export-toggle-box">
                <button
                  onClick={() => setExportMode('all')}
                  className={`cal-export-toggle-btn ${exportMode === 'all' ? 'cal-export-toggle-btn--active' : ''}`}
                >
                  Tutti gli eventi
                </button>
                <button
                  onClick={() => setExportMode('mine')}
                  className={`cal-export-toggle-btn ${exportMode === 'mine' ? 'cal-export-toggle-btn--active' : ''}`}
                >
                  Solo i miei turni
                </button>
              </div>

              {/* Feed URL Copy Section */}
              <div className="cal-export-url-box">
                <label className="cal-export-url-label">Link del feed</label>
                <div className="cal-export-url-row">
                  <input
                    type="text"
                    readOnly
                    value={CALENDAR_FEED_URL}
                    className="cal-export-url-input"
                    onClick={(e) => e.target.select()}
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`cal-export-copy-btn ${copied ? 'cal-export-copy-btn--copied' : ''}`}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copiato!' : 'Copia'}
                  </button>
                </div>
                <div className="flex justify-end mt-2">
                  <button 
                    onClick={handleRefreshLink}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md transition-colors"
                  >
                    Non lo vedi su Google? Rigenera link
                  </button>
                </div>
              </div>


              {/* Action Buttons */}
              <div className="cal-export-actions">

                {/* Google Calendar */}
                <a
                  href={GOOGLE_CALENDAR_ADD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cal-export-action-card cal-export-action-google"
                >
                  <div className="cal-export-action-icon-wrap cal-export-action-icon-google">
                    <SiGoogle color="#4285F4" size={24} />
                  </div>
                  <div className="cal-export-action-text">
                    <span className="cal-export-action-name">Google Calendar</span>
                    <span className="cal-export-action-hint">Aggiungi con un click</span>
                  </div>
                  <ExternalLink size={16} className="cal-export-action-arrow" />
                </a>

                {/* Apple Calendar */}
                <a
                  href={CALENDAR_FEED_URL.replace('https://', 'webcal://').replace('http://', 'webcal://')}
                  className="cal-export-action-card cal-export-action-apple"
                >
                  <div className="cal-export-action-icon-wrap cal-export-action-icon-apple">
                    <SiApple color="#000" size={24} />
                  </div>
                  <div className="cal-export-action-text">
                    <span className="cal-export-action-name">Apple Calendar</span>
                    <span className="cal-export-action-hint">Apri con Calendario</span>
                  </div>
                  <ExternalLink size={16} className="cal-export-action-arrow" />
                </a>

              </div>

              {/* How-to footer */}
              <div className="cal-export-footer">
                <p className="cal-export-footer-title">Aggiunta manuale</p>
                <p className="cal-export-footer-text">
                  Copia il link sopra → Apri il tuo calendario → <strong>Aggiungi calendario da URL</strong> → Incolla il link.
                  Il calendario si sincronizzerà periodicamente.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div >
  );
};

export default EventsDashboard;
