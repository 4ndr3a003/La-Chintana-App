import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, List, ChevronDown, PlusCircle, CalendarPlus, X, AlertTriangle, User, Search, SlidersHorizontal } from 'lucide-react';
import { hasAdminAccess, EVENT_TYPES, canManageContent, EVENT_VISIBILITY } from '../../utils/constants';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import CalendarGrid from '../../components/events/CalendarGrid';
import EventCard from '../../components/events/EventCard';
import { useEventsDashboard } from './EventsDashboardLogic';
import CustomSelect from '../../components/ui/CustomSelect';
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
    handleDeleteEvent,
    confirmDeleteEvent,
    cancelDeleteEvent,
    isDeleteModalOpen,
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

  useEffect(() => {
    if (location.state?.selectedEventId && filteredEvents.length > 0) {
      const eventToSelect = filteredEvents.find(e => e.id === location.state.selectedEventId);
      if (eventToSelect) {
        setSelectedEvent(eventToSelect);
        // Clear the state so it doesn't reopen on re-renders
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, filteredEvents, setSelectedEvent, navigate, location.pathname]);

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
        <div className="events-title-row">
          <div className="events-title-group">
            <h3 className="events-title">
              <Calendar className="text-blue-600" size={28} /> Calendario Attività
            </h3>
            <span className="events-count-badge">{filteredEvents.length} Eventi</span>
          </div>
          <div className="view-toggle-group">
            <button
              onClick={() => setViewMode('list')}
              className={`view-toggle-btn ${viewMode === 'list' ? 'view-toggle-btn-active' : 'view-toggle-btn-inactive'}`}
            >
              <List size={20} />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`view-toggle-btn ${viewMode === 'calendar' ? 'view-toggle-btn-active' : 'view-toggle-btn-inactive'}`}
            >
              <Calendar size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          {/* Search Bar Row */}
          <div className="flex flex-row gap-3 mb-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Cerca evento..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <input
                type="date"
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
            </div>
            {canManageContent(userProfile) && (
              <button
                onClick={openCreateModal}
                className="hidden lg:flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm shrink-0 ml-auto"
              >
                <CalendarPlus size={18} />
                Nuovo Evento
              </button>
            )}
          </div>

          {/* Mobile Filters Toggle */}
          <div className="relative md:hidden">
            <button
              onClick={toggleFilters}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 bg-white"
            >
              <span className="font-bold text-slate-700">Filtri</span>
              <SlidersHorizontal className="text-slate-500" size={20} />
            </button>

            {isFiltersOpen && (
              <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-xl mt-2 shadow-lg z-10 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex flex-col gap-3">
                  <p className="font-bold text-sm text-slate-500 px-1">Tipologia</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => { setFilterType('Tutti'); toggleFilters(); }}
                      className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all border whitespace-nowrap ${filterType === 'Tutti' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                      Tutti
                    </button>
                    {Object.entries(EVENT_TYPES).map(([type, data]) => {
                      const isSelected = filterType === type;
                      let selectedClass = isSelected ? 'bg-slate-500 text-white border-slate-500' : data.color;
                      return (
                        <button
                          key={type}
                          onClick={() => { setFilterType(type); toggleFilters(); }}
                          className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all border whitespace-nowrap ${selectedClass} hover:brightness-95`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                  <div className="w-full h-px bg-slate-200 my-2"></div>
                  <p className="font-bold text-sm text-slate-500 px-1">Partecipazione</p>
                  <button
                    onClick={() => { setFilterParticipation(filterParticipation === 'Tutti' ? 'I miei eventi' : 'Tutti'); toggleFilters(); }}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border flex items-center justify-center gap-2 whitespace-nowrap ${filterParticipation === 'I miei eventi' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'}`}
                  >
                    <User size={16} />
                    Filtra i miei eventi
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Filters */}
          <div className="hidden md:flex flex-wrap items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => setFilterType('Tutti')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all border whitespace-nowrap ${filterType === 'Tutti' ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
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
                  selectedClass = 'bg-slate-200 text-slate-800 border-slate-300 shadow-md';
                  break;
                default:
                  // Extract base color name from the class string
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
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all border flex items-center gap-2 whitespace-nowrap ${filterParticipation === 'I miei eventi' ? 'bg-[var(--color-pc-yellow-600)] text-white border-[var(--color-pc-yellow-600)] shadow-md' : 'bg-[var(--color-pc-yellow-50)] text-slate-700 border-[var(--color-pc-yellow-200)] hover:bg-[var(--color-pc-yellow-100)]'}`}
            >
              <User size={16} />
              I miei eventi
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'calendar' ? (
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
                  onDelete={canManageContent(userProfile) ? handleDeleteEvent : undefined}
                  onEdit={canManageContent(userProfile) ? openEditModal : undefined}
                />
              ))}
            </div>
          )}
        </>
      )}

      {viewMode !== 'calendar' && pastEvents.length > 0 && (
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
                onDelete={canManageContent(userProfile) ? handleDeleteEvent : undefined}
                onEdit={canManageContent(userProfile) ? openEditModal : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {selectedEvent && (
        <div className="modal-overlay animate-in fade-in">
          <div className="modal-content-wrapper modal-wide">
            <button
              onClick={() => setSelectedEvent(null)}
              className="modal-close-btn-large"
            >
              <X size={32} />
            </button>
            <EventCard
              event={selectedEvent}
              userProfile={userProfile}
              allProfiles={allProfiles}
              onToggleParticipation={toggleParticipation}
              showParticipants={true}
              onDelete={canManageContent(userProfile) ? handleDeleteEvent : undefined}
              onEdit={canManageContent(userProfile) ? openEditModal : undefined}
            />
          </div>
        </div>
      )}

      {canManageContent(userProfile) && (
        <button
          onClick={openCreateModal}
          className="fab-btn lg:hidden"
        >
          <CalendarPlus size={28} />
        </button>
      )}

      {isDeleteModalOpen && (
        <div className="modal-overlay animate-in fade-in" style={{ zIndex: 110 }}>
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="text-amber-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Elimina Evento</h3>
              <p className="text-sm text-slate-500 mb-6">
                Sei sicuro di voler eliminare questo evento? Questa azione non può essere annullata.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={cancelDeleteEvent}
                  className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={confirmDeleteEvent}
                  className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Elimina
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <div className="modal-overlay animate-in fade-in">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">{isEditing ? 'Modifica Evento' : 'Nuovo Evento'}</h3>
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
      )}
    </div>
  );
};

export default EventsDashboard;