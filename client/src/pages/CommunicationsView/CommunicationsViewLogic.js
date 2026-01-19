import { useState, useEffect } from 'react';
import { query, collection, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { Capacitor } from '@capacitor/core'; // Import Capacitor

export const useCommunicationsView = (userProfile) => {
  const [messages, setMessages] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterTopic, setFilterTopic] = useState('Tutti');
  const [filterImportance, setFilterImportance] = useState('Tutte');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [newComm, setNewComm] = useState({
    title: '',
    content: '',
    importance: 'Normale',
    topic: 'Generale',
    expirationDate: ''
  });
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [commToDelete, setCommToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCommId, setCurrentCommId] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'communications'),
      orderBy('date', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, []);

  const filteredMessages = messages.filter(msg => {
    const matchesTopic = filterTopic === 'Tutti' || msg.topic === filterTopic;
    const matchesImportance = filterImportance === 'Tutte' || msg.importance === filterImportance;
    const matchesSearch = msg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.content.toLowerCase().includes(searchTerm.toLowerCase());

    // Check expiration
    let isExpired = false;
    if (msg.expirationDate) {
      const expDate = new Date(msg.expirationDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Compare with start of today
      // If expiration date is strictly before today, it's expired. 
      // Example: Expires 2023-10-01. Today is 2023-10-02. Expired.
      // Example: Expires 2023-10-02. Today is 2023-10-02. Not expired (expires at end of day).
      if (expDate < today) {
        isExpired = true;
      }
    }

    // Check visibility for 'Direttivo' topic
    const isDirettivoContent = msg.topic === 'Direttivo';

    // Check visibility for 'Cinofili' topic
    const isCinofiliContent = msg.topic === 'Cinofili';

    // Check for ANY board member or president
    const isBoardOrPresident = userProfile?.role === 'direttivo' || userProfile?.role === 'presidente';

    // Check for K9 role
    const isK9 = userProfile?.volunteerRole === 'Cinofilo';

    if (isDirettivoContent && !isBoardOrPresident) {
      return false;
    }

    if (isCinofiliContent && !isBoardOrPresident && !isK9) {
      return false;
    }

    return matchesTopic && matchesImportance && matchesSearch && !isExpired;
  }).sort((a, b) => {
    // Sort by Importance first: Alta > Normale > Bassa
    const importanceValue = { 'Alta': 3, 'Normale': 2, 'Bassa': 1 };
    const valA = importanceValue[a.importance] || 2;
    const valB = importanceValue[b.importance] || 2;

    if (valA !== valB) {
      return valB - valA; // Descending importance
    }

    // Then by Date (already sorted by query, but good to be explicit if we re-sort)
    return new Date(b.date) - new Date(a.date);
  });

  const toggleFilters = () => setIsFiltersOpen(!isFiltersOpen);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateComm = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (isEditing && currentCommId) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'communications', currentCommId), {
          ...newComm,
          date: new Date().toISOString()
        });
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'communications'), {
          ...newComm,
          date: new Date().toISOString(),
          authorId: userProfile.id,
          authorName: userProfile.name,
          authorPhotoURL: userProfile.photoURL || null
        });

        // Notification is now handled by Cloud Functions
      }
      setNewComm({ title: '', content: '', importance: 'Normale', topic: 'Generale', expirationDate: '' });
      setIsCreateModalOpen(false);
      setIsEditing(false);
      setCurrentCommId(null);
    } catch (error) {
      console.error("Error creating/updating communication:", error);
      alert("Errore durante il salvataggio della comunicazione");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentCommId(null);
    setNewComm({ title: '', content: '', importance: 'Normale', topic: 'Generale', expirationDate: '' });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (comm) => {
    setIsEditing(true);
    setCurrentCommId(comm.id);
    setNewComm({
      title: comm.title,
      content: comm.content,
      importance: comm.importance,
      topic: comm.topic,
      expirationDate: comm.expirationDate || ''
    });
    setIsCreateModalOpen(true);
  };

  const handleDeleteComm = (id) => {
    setCommToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteComm = async () => {
    if (!commToDelete) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'communications', commToDelete));
      if (selectedMessage?.id === commToDelete) setSelectedMessage(null);
      setIsDeleteModalOpen(false);
      setCommToDelete(null);
    } catch (error) {
      console.error("Error deleting communication:", error);
      alert("Errore durante l'eliminazione.");
    }
  };

  const cancelDeleteComm = () => {
    setIsDeleteModalOpen(false);
    setCommToDelete(null);
  };

  const toggleDropdown = (dropdownName) => {
    if (activeDropdown === dropdownName) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(dropdownName);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown && !event.target.closest('.filter-dropdown-container')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  return {
    messages,
    isCreateModalOpen,
    filterTopic,
    filterImportance,
    newComm,
    filteredMessages,
    setFilterTopic,
    setFilterImportance,
    setNewComm,
    setIsCreateModalOpen,
    handleCreateComm,
    handleDeleteComm,
    searchTerm,
    setSearchTerm,
    selectedMessage,
    setSelectedMessage,
    isFiltersOpen,
    toggleFilters,
    activeDropdown,
    toggleDropdown,
    setActiveDropdown,
    isDeleteModalOpen,
    confirmDeleteComm,
    cancelDeleteComm,
    openCreateModal,
    openEditModal,
    isEditing,
    isSubmitting
  };
};