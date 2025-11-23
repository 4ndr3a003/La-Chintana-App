import React from 'react';
import { Calendar, List, ChevronDown, PlusCircle, X } from 'lucide-react';
import { hasAdminAccess } from '../../utils/constants';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import CalendarGrid from '../../components/events/CalendarGrid';
import EventCard from '../../components/events/EventCard';
import { useEventsDashboard } from './EventsDashboardLogic';

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
    <div className="space-y-6 relative min-h-[80vh]">
      <div className="flex flex-col gap-4 px-1">
         <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Calendar className="text-blue-600" size={20} /> Calendario Attività
                </h3>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">{filteredEvents.length} Eventi</span>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <List size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('calendar')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Calendar size={16} />
                </button>
            </div>
         </div>

         <div className="flex gap-2 overflow-x-auto pb-2">
            <div className="relative min-w-[140px]">
                <select 
                    className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-4 py-2.5 pr-8 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer shadow-sm"
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
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>
            <div className="relative min-w-[140px]">
                <select 
                    className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-4 py-2.5 pr-8 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer shadow-sm"
                    value={filterParticipation}
                    onChange={(e) => setFilterParticipation(e.target.value)}
                >
                    <option value="Tutti">Tutti gli eventi</option>
                    <option value="I miei eventi">I miei eventi</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>
         </div>
      </div>

      {viewMode === 'calendar' ? (
        <CalendarGrid events={filteredEvents} userProfile={userProfile} onEventClick={setSelectedEvent} />
      ) : (
        <>
          {filteredEvents.length === 0 ? (
            <Card className="text-center py-16 border-dashed">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                <Calendar size={32} />
              </div>
              <p className="text-slate-400 text-sm font-medium">Nessuna attività trovata con i filtri selezionati.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
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
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg relative">
            <button 
              onClick={() => setSelectedEvent(null)} 
              className="absolute -top-12 right-0 text-white hover:text-slate-200 transition-colors"
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
          className="fixed bottom-32 right-6 md:bottom-10 md:right-10 bg-blue-600 text-white p-4 rounded-full shadow-xl shadow-blue-300 hover:bg-blue-700 hover:scale-110 transition-all z-40"
        >
          <PlusCircle size={28} />
        </button>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Nuovo Evento</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1 rounded-full hover:bg-slate-200 text-slate-500"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleCreateEvent} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Titolo Evento</label>
                  <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Tipologia</label>
                  <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})}>
                    <option>Servizio</option>
                    <option>Esercitazione</option>
                    <option>Riunione</option>
                    <option>Emergenza</option>
                    <option>Formazione</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Data</label>
                     <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} required />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Ora</label>
                     <input type="time" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} required />
                  </div>
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Luogo</label>
                   <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Descrizione</label>
                  <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" rows="3" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})}></textarea>
                </div>
                <div className="pt-2">
                  <Button type="submit" className="w-full justify-center">Pubblica Evento</Button>
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