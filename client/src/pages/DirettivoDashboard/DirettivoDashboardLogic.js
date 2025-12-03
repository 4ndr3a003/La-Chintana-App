import { useState, useEffect } from 'react';
import { query, collection, onSnapshot, orderBy, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';

export const useDirettivoDashboard = () => {
    const [stats, setStats] = useState({
        volunteers: { total: 0, active: 0, inactive: 0, newThisMonth: 0, trend: [] },
        events: { total: 0, inProgress: 0, upcoming: 0, past: 0, emergencies: 0, trend: [] },
        communications: { total: 0, urgent: 0 },
        alerts: { urgent: 0 }
    });

    const [monthlyStats, setMonthlyStats] = useState([]);
    const [planningNotes, setPlanningNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Fetch Volunteers
        const qVolunteers = query(collection(db, 'artifacts', appId, 'public', 'data', 'profiles'));
        const unsubVolunteers = onSnapshot(qVolunteers, (snap) => {
            let total = 0;
            let active = 0;
            let inactive = 0;
            let newThisMonth = 0;
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            // Initialize 6-month trend array (current month at index 5)
            const memberTrend = Array(6).fill(0);

            snap.forEach(doc => {
                const data = doc.data();
                total++;
                if (data.status === 'Operativo') active++;
                else inactive++;

                if (data.joinedAt) {
                    const joinDate = new Date(data.joinedAt);
                    if (joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear) {
                        newThisMonth++;
                    }

                    // Calculate trend
                    const monthDiff = (currentYear - joinDate.getFullYear()) * 12 + (currentMonth - joinDate.getMonth());
                    if (monthDiff >= 0 && monthDiff < 6) {
                        memberTrend[5 - monthDiff]++;
                    }
                }
            });

            setStats(prev => ({
                ...prev,
                volunteers: { total, active, inactive, newThisMonth, trend: memberTrend }
            }));
        });

        // 2. Fetch Events & Calculate Monthly Stats
        const qEvents = query(collection(db, 'artifacts', appId, 'public', 'data', 'events'));
        const unsubEvents = onSnapshot(qEvents, (snap) => {
            let total = 0;
            let inProgress = 0;
            let upcoming = 0;
            let past = 0;
            let emergencies = 0;
            const now = new Date();
            const todayStart = new Date(now.setHours(0, 0, 0, 0));
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            const months = Array(12).fill(0);
            const eventTrend = Array(6).fill(0);

            snap.forEach(doc => {
                const data = doc.data();
                const eventDate = new Date(data.date);
                total++;

                if (data.type === 'emergency') emergencies++;

                if (eventDate < todayStart) past++;
                else if (eventDate.toDateString() === new Date().toDateString()) inProgress++;
                else upcoming++;

                // Monthly stats for current year
                if (eventDate.getFullYear() === currentYear) {
                    months[eventDate.getMonth()]++;
                }

                // 6-month trend
                const monthDiff = (currentYear - eventDate.getFullYear()) * 12 + (currentMonth - eventDate.getMonth());
                if (monthDiff >= 0 && monthDiff < 6) {
                    eventTrend[5 - monthDiff]++;
                }
            });

            setStats(prev => ({
                ...prev,
                events: { total, inProgress, upcoming, past, emergencies, trend: eventTrend },
                alerts: { urgent: emergencies + prev.communications.urgent }
            }));

            setMonthlyStats(months);
        });

        // 3. Fetch Communications
        const qComms = query(collection(db, 'artifacts', appId, 'public', 'data', 'communications'));
        const unsubComms = onSnapshot(qComms, (snap) => {
            let total = 0;
            let urgent = 0;

            snap.forEach(doc => {
                const data = doc.data();
                total++;
                if (data.importance === 'Alta') urgent++;
            });

            setStats(prev => ({
                ...prev,
                communications: { total, urgent },
                alerts: { urgent: urgent + (prev.events.emergencies || 0) }
            }));
        });

        // 4. Fetch Planning Notes
        const qNotes = query(collection(db, 'artifacts', appId, 'public', 'data', 'planning_notes'), orderBy('createdAt', 'desc'));
        const unsubNotes = onSnapshot(qNotes, (snap) => {
            const notes = [];
            snap.forEach(doc => {
                notes.push({ id: doc.id, ...doc.data() });
            });
            setPlanningNotes(notes);
        });

        setLoading(false);

        return () => {
            unsubVolunteers();
            unsubEvents();
            unsubComms();
            unsubNotes();
        };
    }, []);

    const addNote = async (text, type) => {
        if (!text.trim()) return;
        try {
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'planning_notes'), {
                text,
                type, // 'event' or 'comm'
                createdAt: serverTimestamp(),
                completed: false
            });
        } catch (error) {
            console.error("Error adding note:", error);
        }
    };

    const deleteNote = async (id) => {
        try {
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'planning_notes', id));
        } catch (error) {
            console.error("Error deleting note:", error);
        }
    };

    return { stats, monthlyStats, planningNotes, addNote, deleteNote, loading };
};
