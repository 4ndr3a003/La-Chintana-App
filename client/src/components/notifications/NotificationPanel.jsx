import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { MessageSquare, Calendar, Bell, X, ExternalLink, Trash2 } from 'lucide-react';
import { EVENT_TYPES } from '../../utils/constants';

const NotificationPanel = ({ isOpen, onClose, userProfile, anchorRef }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dismissedNotifications, setDismissedNotifications] = useState(() => {
        const saved = localStorage.getItem('dismissed_notifications');
        return saved ? JSON.parse(saved) : [];
    });
    const navigate = useNavigate();
    const panelRef = useRef(null);

    useEffect(() => {
        if (isOpen && panelRef.current && anchorRef?.current) {
            const rect = anchorRef.current.getBoundingClientRect();
            const panelWidth = panelRef.current.offsetWidth;

            // Calculate Top: Push it down a bit more to ensure it's "under" the header visually
            // Assuming header height might be around 80px, and button is centered. 
            // rect.bottom is exact bottom of button. Add 16px gap.
            panelRef.current.style.top = `${rect.bottom + 20}px`;

            // Calculate Left: Center align with the anchor
            let left = rect.left + (rect.width / 2) - (panelWidth / 2);

            // Clamp to viewport with 16px padding
            const padding = 16;
            left = Math.max(padding, Math.min(window.innerWidth - panelWidth - padding, left));

            panelRef.current.style.left = `${left}px`;
            panelRef.current.style.right = 'auto';

            // Adjust transform origin based on adjustment
            // If we are perfectly centered, 'top center'. 
            // If we are pushed left (near right edge), origin should be closer to right.
            // Simple heuristic: set generic top origin, the animation looks okay.
            panelRef.current.style.transformOrigin = 'top';
        }
    }, [isOpen, anchorRef]);

    useEffect(() => {
        // Close on click outside
        const handleClickOutside = (event) => {
            if (anchorRef?.current && anchorRef.current.contains(event.target)) {
                return;
            }
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose, anchorRef]);

    useEffect(() => {
        if (!isOpen) return;

        setLoading(true);

        // Queries for Events and Communications
        const eventsQuery = query(
            collection(db, 'artifacts', appId, 'public', 'data', 'associations', userProfile.associationId, 'events'),
            orderBy('date', 'desc'), // Sort by event date (approximation of "newness" for future events) or created? 
            // Ideally we'd have a createdAt, but date is a good proxy for "upcoming/recent" releavance.
            // Let's stick to 'date' as per existing logic, or better yet, if we want "recently added", we might miss it if we don't store createdAt.
            // Assuming valid dates are sufficient for "history" for now.
            limit(10)
        );

        const commsQuery = query(
            collection(db, 'artifacts', appId, 'public', 'data', 'associations', userProfile.associationId, 'communications'),
            orderBy('date', 'desc'),
            limit(10)
        );

        const unsubEvents = onSnapshot(eventsQuery, (snap) => {
            const events = snap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                itemType: 'event' // Distinct field to avoid overwrite by doc.data().type
            }));
            updateNotifications(events, 'events');
        });

        const unsubComms = onSnapshot(commsQuery, (snap) => {
            const comms = snap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                itemType: 'communication'
            }));
            updateNotifications(comms, 'comms');
        });

        // Merge logic
        let currentEvents = [];
        let currentComms = [];

        const updateNotifications = (data, source) => {
            if (source === 'events') currentEvents = data;
            if (source === 'comms') currentComms = data;

            // Filter logic (same as dashboards)
            const visibleEvents = currentEvents.filter(event => {
                // 0. Check Dismissed
                if (dismissedNotifications.includes(event.id)) return false;

                const isBoardOrPresident = userProfile?.role === 'direttivo' || userProfile?.role === 'presidente';

                // 1. Check strict 'Direttivo' type
                // Note: event.type comes from doc.data()
                if (event.type === 'Direttivo' && !isBoardOrPresident) return false;

                // 2. Check Visibility
                const visibility = event.visibility || 'Tutti'; // Default to 'Tutti'

                if (visibility === 'Solo Direttivo') {
                    if (!isBoardOrPresident) return false;
                } else if (visibility === 'Solo Cinofili') {
                    const isK9 = userProfile?.volunteerRole === 'Cinofilo';
                    if (!isBoardOrPresident && !isK9) return false;
                }

                return true;
            });

            const visibleComms = currentComms.filter(msg => {
                // 0. Check Dismissed
                if (dismissedNotifications.includes(msg.id)) return false;

                // Check expiration
                if (msg.expirationDate) {
                    const expDate = new Date(msg.expirationDate);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (expDate < today) return false;
                }

                const isBoardOrPresident = userProfile?.role === 'direttivo' || userProfile?.role === 'presidente';

                // Topic Filtering
                if (msg.topic === 'Direttivo' && !isBoardOrPresident) return false;

                if (msg.topic === 'Cinofili') {
                    const isK9 = userProfile?.volunteerRole === 'Cinofilo';
                    if (!isBoardOrPresident && !isK9) return false;
                }

                return true;
            });

            // Merge and Sort
            const all = [...visibleEvents, ...visibleComms].sort((a, b) => {
                return new Date(b.date) - new Date(a.date);
            });

            setNotifications(all.slice(0, 15)); // Keep top 15
            setLoading(false);
        };

        return () => {
            unsubEvents();
            unsubComms();
        };
    }, [isOpen, userProfile, dismissedNotifications]);

    const handleItemClick = (item) => {
        onClose();
        if (item.itemType === 'event') {
            navigate('/events', { state: { selectedEventId: item.id } });
        } else {
            navigate('/comms', { state: { selectedCommId: item.id } });
        }
    };

    const handleDismiss = (e, item) => {
        e.stopPropagation(); // Prevent item click
        const newDismissed = [...dismissedNotifications, item.id];
        setDismissedNotifications(newDismissed);
        localStorage.setItem('dismissed_notifications', JSON.stringify(newDismissed));
    };

    // Helper to get Icon and Color based on type/topic
    const getItemStyle = (item) => {
        if (item.itemType === 'event') {
            // eventTypeData might be useful later, but for now specific switch
            // item.type here refers to the actual Firestore data 'type' field (e.g. 'Emergenza')
            switch (item.type) {
                case 'Emergenza': return 'bg-red-100 text-red-600';
                case 'Servizio': return 'bg-amber-100 text-amber-600';
                case 'Formazione': return 'bg-emerald-100 text-emerald-600';
                case 'Riunione': return 'bg-slate-100 text-slate-600';
                case 'Esercitazione': return 'bg-blue-100 text-blue-600';
                case 'Direttivo': return 'bg-purple-100 text-purple-600';
                default: return 'bg-slate-100 text-slate-600';
            }
        } else {
            // Communications
            switch (item.topic) {
                case 'Urgente': return 'bg-red-100 text-red-600';
                case 'Direttivo': return 'bg-purple-100 text-purple-600';
                case 'Cinofili': return 'bg-orange-100 text-orange-600';
                case 'Formazione': return 'bg-emerald-100 text-emerald-600';
                case 'Servizio': return 'bg-amber-100 text-amber-600';
                default: return 'bg-blue-100 text-blue-600';
            }
        }
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div
            ref={panelRef}
            className="fixed w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[99999]"
            style={{ top: 0, left: 0 }}
        >
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Bell size={16} className="text-blue-600" /> Notifiche
                </h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <X size={18} />
                </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto">
                {loading ? (
                    <div className="p-8 flex justify-center text-blue-600">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-current"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <Bell size={32} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm">Nessuna notifica recente.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {notifications.map(item => (
                            <div
                                key={`${item.itemType}-${item.id}`}
                                onClick={() => handleItemClick(item)}
                                className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group relative"
                            >
                                <div className="flex gap-3">
                                    <div className={`flex-none w-10 h-10 rounded-full flex items-center justify-center ${getItemStyle(item)}`}>
                                        {item.itemType === 'event' ? <Calendar size={18} /> : <MessageSquare size={18} />}
                                    </div>
                                    <div className="flex-grow min-w-0 pr-6"> {/* Added padding-right to avoid overlap with delete btn */}
                                        <div className="flex justify-between items-start mb-0.5">
                                            <p className="text-xs font-bold uppercase text-slate-400">
                                                {item.itemType === 'event' ? 'Evento' : 'Comunicazione'}
                                            </p>
                                            <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                                                {new Date(item.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-slate-800 text-sm truncate mb-1 group-hover:text-blue-700 transition-colors">
                                            {item.title}
                                        </h4>
                                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                            {item.type === 'event' ? (item.description || "Nessuna descrizione") : item.content}
                                        </p>
                                    </div>

                                    {/* Delete Button - Always visible on mobile, hover on desktop */}
                                    <button
                                        onClick={(e) => handleDismiss(e, item)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                        title="Rimuovi notifica"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Ultimi aggiornamenti</span>
            </div>
        </div>,
        document.body
    );
};

export default NotificationPanel;
