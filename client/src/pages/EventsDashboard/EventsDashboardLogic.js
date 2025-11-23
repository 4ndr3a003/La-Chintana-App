import { useState, useEffect } from 'react';
import { query, collection, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';

export const useEventsDashboard = (userProfile) => {
  const [events, setEvents] = useState([]);
  const [allProfiles, setAllProfiles] = useState({}); 
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterType, setFilterType] = useState('Tutti');
  const [filterParticipation, setFilterParticipation] = useState('Tutti');
  const [newEvent, setNewEvent] = useState({
    title: '', date: '', time: '', location: '', type: 'Servizio', description: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'events'));
    const unsubEvents = onSnapshot(q, (snap) => {
      const eventsData = [];
      snap.forEach((doc) => {
        const data = doc.data();
        if (new Date(data.date) >= new Date(new Date().setHours(0,0,0,0))) {
           eventsData.push({ id: doc.id, ...data });
        }
      });
      eventsData.sort((a, b) => new Date(a.date) - new Date(b.date));
      setEvents(eventsData);
    });

    const qProfiles = query(collection(db, 'artifacts', appId, 'public', 'data', 'profiles'));
    const unsubProfiles = onSnapshot(qProfiles, (snap) => {
       const profilesMap = {};
       snap.forEach(doc => profilesMap[doc.id] = doc.data());
       setAllProfiles(profilesMap);
    });

    return () => { unsubEvents(); unsubProfiles(); };
  }, []);

  const toggleParticipation = async (event) => {
    const isParticipating = event.participants?.includes(userProfile.id);
    const eventRef = doc(db, 'artifacts', appId, 'public', 'data', 'events', event.id);
    let newParticipants = event.participants || [];
    
    if (isParticipating) newParticipants = newParticipants.filter(uid => uid !== userProfile.id);
    else newParticipants = [...newParticipants, userProfile.id];

    try {
      await updateDoc(eventRef, { participants: newParticipants });
    } catch (error) {
      console.error(error);
      alert("Errore di connessione.");
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const fullDate = new Date(`${newEvent.date}T${newEvent.time || '08:00'}`);
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'events'), {
        ...newEvent,
        date: fullDate.toISOString(),
        participants: [],
        createdBy: userProfile.id
      });
      setNewEvent({ title: '', date: '', time: '', location: '', type: 'Servizio', description: '' });
      setIsCreateModalOpen(false);
    } catch (err) { console.error(err); alert("Errore creazione evento"); }
  };

  const filteredEvents = events.filter(event => {
    if (filterType !== 'Tutti' && event.type !== filterType) return false;
    if (filterParticipation === 'I miei eventi' && !event.participants?.includes(userProfile.id)) return false;
    return true;
  });

  return {
    events,
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
  };
};