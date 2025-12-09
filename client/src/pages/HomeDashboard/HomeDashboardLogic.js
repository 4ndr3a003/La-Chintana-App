import { useState, useEffect } from 'react';
import { query, collection, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { EVENT_VISIBILITY, VOLUNTEER_ROLES } from '../../utils/constants';

export const useHomeDashboard = (userProfile) => {
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
      if (loadedSources.size >= 2) { // 2 listeners: events, comms
        setLoading(false);
      }
    };

    // 1. Unified query for future events
    const qEvents = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'events'),
      where('date', '>=', now),
      orderBy('date', 'asc')
    );

    const unsubEvents = onSnapshot(qEvents, (snap) => {
      let allFutureEvents = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Filter events based on visibility rules (Same as EventsDashboardLogic)
      allFutureEvents = allFutureEvents.filter(event => {
        const isBoardOrPresident = userProfile?.role === 'direttivo' || userProfile?.role === 'presidente';

        // Check visibility for 'Direttivo' type (Legacy)
        if (event.type === 'Direttivo' && !isBoardOrPresident) return false;

        // New Visibility Logic
        const visibility = event.visibility || EVENT_VISIBILITY.ALL;

        if (visibility === EVENT_VISIBILITY.BOARD_ONLY) {
          if (!isBoardOrPresident) return false;
        }

        if (visibility === EVENT_VISIBILITY.K9_ONLY) {
          const isK9 = userProfile?.volunteerRole === VOLUNTEER_ROLES.K9;
          if (!isK9 && !isBoardOrPresident) return false;
        }

        return true;
      });

      // Find the very next event (the first in the sorted list)
      const firstEvent = allFutureEvents.length > 0 ? allFutureEvents[0] : null;
      setNextEvent(firstEvent);

      // Find the next emergency event
      const firstEmergency = allFutureEvents.find(event => event.type === 'Emergenza') || null;
      setNextEmergency(firstEmergency);

      checkLoading('events');
    }, (error) => {
      console.error("Error fetching future events:", error);
      checkLoading('events');
    });

    // 2. Recent Communications (Ordered by Importance then Date)
    const qComms = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'communications'),
      orderBy('date', 'desc'),
      limit(10)
    );

    const unsubComms = onSnapshot(qComms, (snap) => {
      const comms = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Filter out 'Direttivo' topic for non-board members
      const isBoardOrPresident = userProfile?.role === 'direttivo' || userProfile?.role === 'presidente';
      const visibleComms = comms.filter(c => {
        // Check expiration
        if (c.expirationDate) {
          const expDate = new Date(c.expirationDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (expDate < today) {
            return false;
          }
        }

        if (c.topic === 'Direttivo' && !isBoardOrPresident) return false;
        return true;
      });

      // Filter logic: 1 Urgent + 2 Others
      const urgentComm = visibleComms.find(c => c.importance === 'Alta' || c.topic === 'Urgente');
      const otherComms = visibleComms.filter(c => c.id !== urgentComm?.id).slice(0, 2);

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
      unsubEvents();
      unsubComms();
    };
  }, [userProfile]);

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
      let events = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Filter events based on visibility rules
      events = events.filter(event => {
        const isBoardOrPresident = userProfile?.role === 'direttivo' || userProfile?.role === 'presidente';

        // Check visibility for 'Direttivo' type (Legacy)
        if (event.type === 'Direttivo' && !isBoardOrPresident) return false;

        // New Visibility Logic
        const visibility = event.visibility || EVENT_VISIBILITY.ALL;

        if (visibility === EVENT_VISIBILITY.BOARD_ONLY) {
          if (!isBoardOrPresident) return false;
        }

        if (visibility === EVENT_VISIBILITY.K9_ONLY) {
          const isK9 = userProfile?.volunteerRole === VOLUNTEER_ROLES.K9;
          if (!isK9 && !isBoardOrPresident) return false;
        }

        return true;
      });

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
