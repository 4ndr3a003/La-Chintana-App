import { useState, useEffect } from 'react';
import { query, collection, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';

export const useHomeDashboard = () => {
  const [nextEvent, setNextEvent] = useState(null);
  const [nextEmergency, setNextEmergency] = useState(null);
  const [recentComms, setRecentComms] = useState([]);
  const [monthEvents, setMonthEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date().toISOString();

    // Track loading state for initial fetch
    const loadedSources = new Set();
    const checkLoading = (source) => {
      loadedSources.add(source);
      if (loadedSources.size >= 3) { // 3 listeners: event, emergency, comms
        setLoading(false);
      }
    };

    // 1. Next Single Event (General)
    const qNextEvent = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'events'),
      where('date', '>=', now),
      orderBy('date', 'asc'),
      limit(1)
    );

    // 2. Next Emergency
    const qNextEmergency = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'events'),
      where('date', '>=', now),
      where('type', '==', 'Emergenza'),
      orderBy('date', 'asc'),
      limit(1)
    );

    // 3. Recent Communications (Ordered by Importance then Date)
    const qComms = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'communications'),
      orderBy('date', 'desc'),
      limit(10)
    );

    const unsubNextEvent = onSnapshot(qNextEvent, (snap) => {
      if (!snap.empty) {
        setNextEvent({ id: snap.docs[0].id, ...snap.docs[0].data() });
      } else {
        setNextEvent(null);
      }
      checkLoading('event');
    }, (error) => {
      console.error("Error fetching next event:", error);
      checkLoading('event');
    });

    const unsubNextEmergency = onSnapshot(qNextEmergency, (snap) => {
      if (!snap.empty) {
        setNextEmergency({ id: snap.docs[0].id, ...snap.docs[0].data() });
      } else {
        setNextEmergency(null);
      }
      checkLoading('emergency');
    }, (error) => {
      console.error("Error fetching next emergency:", error);
      checkLoading('emergency');
    });

    const unsubComms = onSnapshot(qComms, (snap) => {
      const comms = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Filter logic: 1 Urgent + 2 Others
      const urgentComm = comms.find(c => c.importance === 'Alta' || c.topic === 'Urgente');
      const otherComms = comms.filter(c => c.id !== urgentComm?.id).slice(0, 2);

      const finalComms = [];
      if (urgentComm) finalComms.push(urgentComm);
      finalComms.push(...otherComms);

      console.log('HomeDashboardLogic: Setting recentComms', finalComms.length);
      setRecentComms(finalComms);
      checkLoading('comms');
    }, (error) => {
      console.error("Error fetching comms:", error);
      checkLoading('comms');
    });

    return () => {
      unsubNextEvent();
      unsubNextEmergency();
      unsubComms();
    };
  }, []);

  // 4. Month Events for Calendar (Dynamic based on currentMonth)
  useEffect(() => {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString();
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59).toISOString();

    const qMonthEvents = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'events'),
      where('date', '>=', startOfMonth),
      where('date', '<=', endOfMonth)
    );

    const unsubMonthEvents = onSnapshot(qMonthEvents, (snap) => {
      const events = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMonthEvents(events);
    });

    return () => unsubMonthEvents();
  }, [currentMonth]);

  const changeMonth = (increment) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + increment, 1));
  };

  return {
    nextEvent,
    nextEmergency,
    recentComms,
    monthEvents,
    currentMonth,
    changeMonth,
    loading
  };
};
