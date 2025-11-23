import React from 'react';
import { Calendar, List, ChevronDown, PlusCircle, X } from 'lucide-react';
import { hasAdminAccess } from '../../utils/constants';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import CalendarGrid from '../../components/events/CalendarGrid';
import EventCard from '../../components/events/EventCard';
import { useEventsDashboard } from './EventsDashboardLogic';
import './EventsDashboard.css';

const EventsDashboard = ({ userProfile }) => {
  const {
    allProfiles,
    isCreateModalOpen,
    viewMode,
    selectedEvent,
    filterType,
    filterParticipation,
    newEvent,
    filteredEvents,
    setViewMode,
    setFilterType,
    setFilterParticipation,
    setSelectedEvent,
    setIsCreateModalOpen,
    setNewEvent,
    toggleParticipation,
    handleCreateEvent
  } = useEventsDashboard(userProfile);

  return (
    <div className="events-container">
      <div className="events-header">
         <div className="events-title-row">
            <div className="events-title-group">
                <h3 className="events-title">
                    <Calendar className="text-blue-600" size={20} /> Calendario Attività
                </h3>
                <span className="events-count-badge">{filteredEvents.length} Eventi</span>
            </div>
            <div className="view-toggle-group">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`view-toggle-btn ${viewMode === 'list' ? 'view-toggle-btn-active' : 'view-toggle-btn-inactive'}`}
                >
                  <List size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('calendar')}
                  className={`view-toggle-btn ${viewMode === 'calendar' ? 'view-toggle-btn-active' : 'view-toggle-btn-inactive'}`}
                >
                  <Calendar size={16} />
                </button>
            </div>
         </div>

         <div className="filter-row">
            <div className="filter-select-wrapper">
                <select 
                    className="filter-select"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                >
                    <option value="Tutti">Tutti i tipi</option>
                    <option>Servizio</option>
                    <option>Esercitazione</option>
                    <option>Riunione</option>
                    <option>Emergenza</option>
                    <option>Formazione</option>
                </select>
                <ChevronDown className="filter-icon" size={14} />
            </div>
            <div className="filter-select-wrapper">
                <select 
                    className="filter-select"
                    value={filterParticipation}
                    onChange={(e) => setFilterParticipation(e.target.value)}
                >
                    <option value="Tutti">Tutti gli eventi</option>
                    <option value="I miei eventi">I miei eventi</option>
                </select>
                <ChevronDown className="filter-icon" size={14} />
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
                />
              ))}
            </div>
          )}
        </>
      )}

      {selectedEvent && (
        <div className="modal-overlay animate-in fade-in">
          <div className="modal-content-wrapper">
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
            />
          </div>
        </div>
      )}

      {hasAdminAccess(userProfile) && (
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="fab-btn"
        >
          <PlusCircle size={28} />
        </button>
      )}

      {isCreateModalOpen && (
        <div className="modal-overlay animate-in fade-in">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">Nuovo Evento</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="modal-close-btn"><X size={20} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateEvent} className="form-space">
                <div>
                  <label className="form-label">Titolo Evento</label>
                  <input type="text" className="form-input" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} required />
                </div>
                <div>
                  <label className="form-label">Tipologia</label>
                  <select className="form-select" value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})}>
                    <option>Servizio</option>
                    <option>Esercitazione</option>
                    <option>Riunione</option>
                    <option>Emergenza</option>
                    <option>Formazione</option>
                  </select>
                </div>
                <div className="form-grid">
                  <div>
                     <label className="form-label">Data</label>
                     <input type="date" className="form-input" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} required />
                  </div>
                  <div>
                     <label className="form-label">Ora</label>
                     <input type="time" className="form-input" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} required />
                  </div>
                </div>
                <div>
                   <label className="form-label">Luogo</label>
                   <input type="text" className="form-input" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} required />
                </div>
                <div>
                  <label className="form-label">Descrizione</label>
                  <textarea className="form-textarea" rows="3" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})}></textarea>
                </div>
                <div className="form-submit-wrapper">
                  <Button type="submit" className="form-submit-btn">Pubblica Evento</Button>
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