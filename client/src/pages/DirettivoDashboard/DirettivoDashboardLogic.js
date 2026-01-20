import { useState, useEffect } from 'react';
import { query, collection, onSnapshot, orderBy, addDoc, deleteDoc, doc, serverTimestamp, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { SPECIALIZATIONS_DATA } from '../../utils/constants';

export const useDirettivoDashboard = () => {
    const [stats, setStats] = useState({
        volunteers: { total: 0, active: 0, inactive: 0, newThisMonth: 0, trend: [] },
        events: { total: 0, inProgress: 0, upcoming: 0, past: 0, emergencies: 0, trend: [] },
        communications: { total: 0, urgent: 0 },
        alerts: { urgent: 0 }
    });

    const [monthlyStats, setMonthlyStats] = useState([]);
    const [planningNotes, setPlanningNotes] = useState([]);
    const [users, setUsers] = useState([]);
    const [validitySettings, setValiditySettings] = useState({});
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
            const usersList = [];

            // Initialize 6-month trend array (current month at index 5)
            const memberTrend = Array(6).fill(0);

            snap.forEach(doc => {
                const data = doc.data();
                usersList.push({ id: doc.id, ...data });

                usersList.push({ id: doc.id, ...data });

                if (!data.isHidden) {
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
                }
            });

            setUsers(usersList);

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

        // 5. Fetch Validity Settings
        const fetchSettings = async () => {
            try {
                const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'validity');
                const snap = await getDoc(settingsRef);
                if (snap.exists()) {
                    setValiditySettings(snap.data());
                } else {
                    // Initialize with defaults from constants if not exists
                    const defaults = {};
                    Object.values(SPECIALIZATIONS_DATA).forEach(cat => {
                        if (cat.validityYears) {
                            Object.assign(defaults, cat.validityYears);
                        }
                    });
                    setValiditySettings(defaults);
                }
            } catch (err) {
                console.error("Error fetching validity settings:", err);
            }
        };
        fetchSettings();

        setLoading(false);

        return () => {
            unsubVolunteers();
            unsubEvents();
            unsubComms();
            unsubNotes();
        };
    }, []);

    const updateValiditySettings = async (newSettings) => {
        try {
            const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'validity');
            // Ensure path exists (settings/validity might need parent doc creation if purely nested but here it's collection 'settings' not existing yet maybe? 
            // Actually 'public/data/settings' is col/doc/subcol? No, structure is artifacts/appId/public/data. 
            // So 'settings' is a doc ID in 'data' collection? Or 'settings' is a collection in 'data' doc?
            // The query above used collection(db, 'artifacts', appId, 'public', 'data', 'profiles').
            // So 'data' is a collection. 'profiles' is a document? NO.
            // 'profiles' is a collection inside 'data' document?
            // Wait, original query: collection(db, 'artifacts', appId, 'public', 'data', 'profiles') -> This means:
            // Coll: artifacts -> Doc: appId -> Coll: public -> Doc: data -> Coll: profiles.
            // So we want: Coll: artifacts -> Doc: appId -> Coll: public -> Doc: data -> Coll: settings -> Doc: validity.

            await setDoc(settingsRef, newSettings, { merge: true });
            setValiditySettings(newSettings);

            // Auto-sync expirations
            await syncExpirations(newSettings);

        } catch (error) {
            console.error("Error saving settings:", error);
            throw error;
        }
    };

    const syncExpirations = async (currentSettings) => {
        if (!users || users.length === 0) return;

        try {
            const batch = writeBatch(db);
            let updateCount = 0;
            const MAX_BATCH_SIZE = 450;
            const batches = [batch];
            let currentBatchIndex = 0;
            let currentBatchCount = 0;

            users.forEach(user => {
                if (!user.certifications) return;

                let userUpdated = false;
                const newCerts = { ...user.certifications };

                Object.entries(newCerts).forEach(([certName, certData]) => {
                    if (certData.completionDate) {
                        // Get validity from new settings or default to 5 if missing
                        // NOTE: currentSettings is flat object { "Corso A": 5, ... } based on Widget logic
                        // But SPECIALIZATIONS_DATA structure is nested. Widget flattens it effectively or builds flat object?
                        // Widget passes `localSettings` which is { "Corso Name": years, ... }

                        let validityYears = currentSettings[certName];

                        // Fallback to constants if not in settings (though widget should cover all)
                        if (validityYears === undefined) {
                            // Try to find in constants
                            for (const cat in SPECIALIZATIONS_DATA) {
                                if (SPECIALIZATIONS_DATA[cat].validityYears && SPECIALIZATIONS_DATA[cat].validityYears[certName]) {
                                    validityYears = SPECIALIZATIONS_DATA[cat].validityYears[certName];
                                    break;
                                }
                            }
                        }

                        // Default to 5 if still undefined
                        if (validityYears === undefined) validityYears = 5;

                        const compDate = new Date(certData.completionDate);
                        const expectedExpDate = new Date(compDate);
                        expectedExpDate.setFullYear(expectedExpDate.getFullYear() + validityYears);
                        const expectedExpDateStr = expectedExpDate.toISOString().split('T')[0];

                        if (certData.expirationDate !== expectedExpDateStr) {
                            newCerts[certName] = { ...certData, expirationDate: expectedExpDateStr };
                            userUpdated = true;
                        }
                    }
                });

                if (userUpdated) {
                    const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', user.id);

                    if (currentBatchCount >= MAX_BATCH_SIZE) {
                        batches.push(writeBatch(db));
                        currentBatchIndex++;
                        currentBatchCount = 0;
                    }

                    batches[currentBatchIndex].update(userRef, { certifications: newCerts });
                    currentBatchCount++;
                    updateCount++;
                }
            });

            if (updateCount > 0) {
                await Promise.all(batches.map(b => b.commit()));
                console.log(`Auto-synced ${updateCount} users.`);
            }

        } catch (error) {
            console.error("Auto-sync failed:", error);
        }
    };

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

    return { stats, monthlyStats, planningNotes, addNote, deleteNote, loading, users, validitySettings, updateValiditySettings };
};
