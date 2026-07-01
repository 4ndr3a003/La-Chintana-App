import { useState, useEffect } from 'react';
import { query, collection, where, orderBy, limit, onSnapshot, doc } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { useAppSettings } from '../../context/AssociationSettingsContext';

export const useHomeDashboard = (userProfile) => {
  const { eventVisibility: EVENT_VISIBILITY, eventVisibilityOptions, volunteerRoles: VOLUNTEER_ROLES } = useAppSettings();
  const [nextEvent, setNextEvent] = useState(null);
  const [nextEmergency, setNextEmergency] = useState(null);
  const [recentComms, setRecentComms] = useState([]);
  const [monthEvents, setMonthEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [associationName, setAssociationName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.associationId) return;
    const assocRef = doc(db, 'artifacts', appId, 'public', 'data', 'associations', userProfile.associationId);
    const unsubAssoc = onSnapshot(assocRef, (docSnap) => {
      if (docSnap.exists()) {
        setAssociationName(docSnap.data().name || '');
      }
    });
    return () => unsubAssoc();
  }, [userProfile?.associationId]);

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
      collection(db, 'artifacts', appId, 'public', 'data', 'associations', userProfile.associationId, 'events'),
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

        // New Dynamic Visibility Logic
        const visibilityLabel = event.visibility || EVENT_VISIBILITY.ALL;
        
        // Find the visibility option definition by its label
        const visOption = eventVisibilityOptions?.find(opt => opt.label === visibilityLabel);
        
        if (visOption && visOption.allowedRoles && visOption.allowedRoles.length > 0) {
          const allowed = visOption.allowedRoles;
          
          if (allowed.includes('BASE_ALL')) {
            return true; // Everyone can see
          }

          let hasAccess = false;
          
          if (isBoardOrPresident && allowed.includes('BASE_BOARD')) {
            hasAccess = true;
          }
          if (userProfile?.role === 'volontario' && allowed.includes('BASE_VOLUNTEER')) {
            hasAccess = true;
          }
          if (userProfile?.boardRole && allowed.includes(`BOARD_${userProfile.boardRole}`)) {
            hasAccess = true;
          }
          if (userProfile?.volunteerRole && allowed.includes(`VOLUNTEER_${userProfile.volunteerRole}`)) {
            hasAccess = true;
          }
          if (userProfile?.specializations?.some(spec => allowed.includes(`SPEC_${spec}`))) {
            hasAccess = true;
          }
          
          return hasAccess;
        }

        // Fallback for missing/corrupt visibility definition
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
      collection(db, 'artifacts', appId, 'public', 'data', 'associations', userProfile.associationId, 'communications'),
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
      collection(db, 'artifacts', appId, 'public', 'data', 'associations', userProfile.associationId, 'events'),
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

        // New Dynamic Visibility Logic
        const visibilityLabel = event.visibility || EVENT_VISIBILITY.ALL;
        
        const visOption = eventVisibilityOptions?.find(opt => opt.label === visibilityLabel);
        
        if (visOption && visOption.allowedRoles && visOption.allowedRoles.length > 0) {
          const allowed = visOption.allowedRoles;
          
          if (allowed.includes('BASE_ALL')) {
            return true;
          }

          let hasAccess = false;
          if (isBoardOrPresident && allowed.includes('BASE_BOARD')) hasAccess = true;
          if (userProfile?.role === 'volontario' && allowed.includes('BASE_VOLUNTEER')) hasAccess = true;
          if (userProfile?.boardRole && allowed.includes(`BOARD_${userProfile.boardRole}`)) hasAccess = true;
          if (userProfile?.volunteerRole && allowed.includes(`VOLUNTEER_${userProfile.volunteerRole}`)) hasAccess = true;
          if (userProfile?.specializations?.some(spec => allowed.includes(`SPEC_${spec}`))) hasAccess = true;
          
          return hasAccess;
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
    associationName,
    loading
  };
};
