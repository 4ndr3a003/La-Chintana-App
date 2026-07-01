import { useState, useEffect } from 'react';
import { query, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { useAppSettings } from '../../context/AssociationSettingsContext';
import { Capacitor } from '@capacitor/core'; // Import Capacitor

export const useEventsDashboard = (userProfile) => {
  const { eventVisibility: EVENT_VISIBILITY, eventVisibilityOptions, volunteerRoles: VOLUNTEER_ROLES } = useAppSettings();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [allProfiles, setAllProfiles] = useState({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterType, setFilterType] = useState('Tutti');
  const [filterParticipation, setFilterParticipation] = useState('Tutti');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '', date: '', time: '', location: '', type: 'Servizio', description: '', shifts: [], visibility: EVENT_VISIBILITY.ALL || 'Tutti'
  });

  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'associations', userProfile.associationId, 'events'));
    const unsubEvents = onSnapshot(q, (snap) => {
      const upcoming = [];
      const past = [];
      const today = new Date(new Date().setHours(0, 0, 0, 0));

      snap.forEach((doc) => {
        const data = doc.data();
        const eventDate = new Date(data.date);
        const eventObj = { id: doc.id, ...data };

        // 1. SECURITY/VISIBILITY FILTER
        const isDirettivoEvent = eventObj.type === 'Direttivo';
        const isBoardOrPresident = userProfile?.role === 'direttivo' || userProfile?.role === 'presidente';

        if (isDirettivoEvent && !isBoardOrPresident) return;

        const visibilityLabel = eventObj.visibility || EVENT_VISIBILITY.ALL;
        const visOption = eventVisibilityOptions?.find(opt => opt.label === visibilityLabel);
        
        if (visOption && visOption.allowedRoles && visOption.allowedRoles.length > 0) {
          const allowed = visOption.allowedRoles;
          
          if (!allowed.includes('BASE_ALL')) {
            let hasAccess = false;
            if (isBoardOrPresident && allowed.includes('BASE_BOARD')) hasAccess = true;
            if (userProfile?.role === 'volontario' && allowed.includes('BASE_VOLUNTEER')) hasAccess = true;
            if (userProfile?.boardRole && allowed.includes(`BOARD_${userProfile.boardRole}`)) hasAccess = true;
            if (userProfile?.volunteerRole && allowed.includes(`VOLUNTEER_${userProfile.volunteerRole}`)) hasAccess = true;
            if (userProfile?.specializations?.some(spec => allowed.includes(`SPEC_${spec}`))) hasAccess = true;
            
            if (!hasAccess) return; // exclude event
          }
        }

        // 2. PARTITION EVENTS
        if (eventDate >= today) {
          upcoming.push(eventObj);
        } else {
          past.push(eventObj);
        }
      });

      upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
      past.sort((a, b) => new Date(b.date) - new Date(a.date));

      setUpcomingEvents(upcoming);
      setPastEvents(past);
    });

    const qProfiles = query(collection(db, 'artifacts', appId, 'public', 'data', 'associations', userProfile.associationId, 'profiles'));
    const unsubProfiles = onSnapshot(qProfiles, (snap) => {
      const profilesMap = {};
      snap.forEach(doc => profilesMap[doc.id] = doc.data());
      setAllProfiles(profilesMap);
    });

    return () => { unsubEvents(); unsubProfiles(); };
  }, []);

  // Sync selectedEvent with real-time updates
  useEffect(() => {
    if (selectedEvent) {
      const updatedEvent = upcomingEvents.find(e => e.id === selectedEvent.id) ||
        pastEvents.find(e => e.id === selectedEvent.id);

      if (updatedEvent && updatedEvent !== selectedEvent) {
        setSelectedEvent(updatedEvent);
      }
    }
  }, [upcomingEvents, pastEvents, selectedEvent]);

  const toggleParticipation = async (event, shiftId = null) => {
    const eventRef = doc(db, 'artifacts', appId, 'public', 'data', 'associations', userProfile.associationId, 'events', event.id);
    let updates = {};

    if (event.shifts && event.shifts.length > 0 && shiftId) {
      // Handle Shift Participation
      const updatedShifts = event.shifts.map(shift => {
        if (shift.id === shiftId) {
          const isParticipating = shift.participants?.includes(userProfile.id);
          let newParticipants = shift.participants || [];
          if (isParticipating) {
            newParticipants = newParticipants.filter(uid => uid !== userProfile.id);
          } else {
            // Check max participants
            if (shift.maxParticipants && newParticipants.length >= parseInt(shift.maxParticipants)) {
              alert("Turno completo!");
              return shift; // No change
            }
            newParticipants = [...newParticipants, userProfile.id];
          }
          return { ...shift, participants: newParticipants };
        }
        return shift;
      });

      // Recalculate top-level participants
      const allParticipants = new Set();
      updatedShifts.forEach(s => s.participants?.forEach(p => allParticipants.add(p)));

      updates = {
        shifts: updatedShifts,
        participants: Array.from(allParticipants)
      };

    } else {
      // Legacy or No-Shift Event
      const isParticipating = event.participants?.includes(userProfile.id);
      let newParticipants = event.participants || [];

      if (isParticipating) newParticipants = newParticipants.filter(uid => uid !== userProfile.id);
      else newParticipants = [...newParticipants, userProfile.id];

      updates = { participants: newParticipants };
    }

    try {
      await updateDoc(eventRef, updates);
    } catch (error) {
      console.error(error);
      alert("Errore di connessione.");
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentEventId(null);
    setNewEvent({ title: '', date: '', time: '', location: '', type: 'Servizio', description: '', shifts: [], visibility: EVENT_VISIBILITY.ALL });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (event) => {
    setIsEditing(true);
    setCurrentEventId(event.id);
    const dateObj = new Date(event.date);
    // Adjust for timezone offset to get correct YYYY-MM-DD
    const offset = dateObj.getTimezoneOffset();
    const localDate = new Date(dateObj.getTime() - (offset * 60 * 1000));
    const dateStr = localDate.toISOString().split('T')[0];

    const timeStr = dateObj.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

    setNewEvent({
      title: event.title,
      date: dateStr,
      time: timeStr,
      location: event.location,
      type: event.type,
      description: event.description || '',
      shifts: event.shifts || [],
      visibility: event.visibility || EVENT_VISIBILITY.ALL
    });
    setIsCreateModalOpen(true);
  };

  const addShift = () => {
    setNewEvent(prev => ({
      ...prev,
      shifts: [...(prev.shifts || []), { id: Date.now(), startTime: '', endTime: '', maxParticipants: '', participants: [] }]
    }));
  };

  const removeShift = (index) => {
    setNewEvent(prev => ({
      ...prev,
      shifts: prev.shifts.filter((_, i) => i !== index)
    }));
  };

  const updateShift = (index, field, value) => {
    setNewEvent(prev => {
      const newShifts = [...prev.shifts];
      newShifts[index] = { ...newShifts[index], [field]: value };
      return { ...prev, shifts: newShifts };
    });
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const fullDate = new Date(`${newEvent.date}T${newEvent.time || '08:00'}`);

      const eventData = {
        ...newEvent,
        date: fullDate.toISOString(),
        shifts: newEvent.shifts || []
      };

      if (isEditing && currentEventId) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'associations', userProfile.associationId, 'events', currentEventId), eventData);
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'associations', userProfile.associationId, 'events'), {
          ...eventData,
          participants: [],
          createdBy: userProfile.id
        });
      }

      setNewEvent({ title: '', date: '', time: '', location: '', type: 'Servizio', description: '', shifts: [], visibility: EVENT_VISIBILITY.ALL });
      setIsCreateModalOpen(false);
      setIsEditing(false);
      setCurrentEventId(null);
    } catch (err) { console.error(err); alert("Errore salvataggio evento"); }
  };

  const deleteEvent = async (eventId) => {
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'associations', userProfile.associationId, 'events', eventId));
      if (selectedEvent?.id === eventId) setSelectedEvent(null);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const toggleFilters = () => setIsFiltersOpen(!isFiltersOpen);

  const filteredEvents = upcomingEvents.filter(event => {
    if (filterType !== 'Tutti' && event.type !== filterType) return false;
    if (filterParticipation === 'I miei eventi' && !event.participants?.includes(userProfile.id)) return false;
    if (searchTerm && !event.title.toLowerCase().includes(searchTerm.toLowerCase()) && !event.description?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (searchDate) {
      const eventDate = new Date(event.date).toISOString().split('T')[0];
      if (eventDate !== searchDate) return false;
    }

    // Security visibility filtering is already done in the onSnapshot listener for both upcoming and past events.
    // Here we only need to apply the user-selected UI filters:
    return true;
  });

  return {
    upcomingEvents,
    pastEvents,
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
  };
};