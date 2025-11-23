import { useState, useEffect } from 'react';
import { query, collection, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';

export const useHomeDashboard = () => {
  const [nextEvent, setNextEvent] = useState(null);
  const [latestComm, setLatestComm] = useState(null);

  useEffect(() => {
    const now = new Date().toISOString();
    
    // Next Event
    const qEvents = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'events'),
      where('date', '>=', now),
      orderBy('date', 'asc'),
      limit(1)
    );
    
    // Latest Communication
    const qComms = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'communications'),
      orderBy('date', 'desc'),
      limit(1)
    );

    const unsubEvents = onSnapshot(qEvents, (snap) => {
      if (!snap.empty) {
        setNextEvent({ id: snap.docs[0].id, ...snap.docs[0].data() });
      } else {
        setNextEvent(null);
      }
    });

    const unsubComms = onSnapshot(qComms, (snap) => {
      if (!snap.empty) {
        setLatestComm({ id: snap.docs[0].id, ...snap.docs[0].data() });
      } else {
        setLatestComm(null);
      }
    });

    return () => {
      unsubEvents();
      unsubComms();
    };
  }, []);

  return {
    nextEvent,
    latestComm
  };
};
