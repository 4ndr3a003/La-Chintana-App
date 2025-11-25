import { useState, useEffect } from 'react';
import { query, collection, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';

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
    topic: 'Generale'
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
    return matchesTopic && matchesImportance && matchesSearch;
  });

  const toggleFilters = () => setIsFiltersOpen(!isFiltersOpen);

  const handleCreateComm = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && currentCommId) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'communications', currentCommId), {
          ...newComm,
          date: new Date().toISOString() // Update date on edit? Or keep original? Usually update date is better or add updatedAt. Let's update date for now to bump it up.
        });
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'communications'), {
          ...newComm,
          date: new Date().toISOString(),
          authorId: userProfile.id,
          authorName: userProfile.name,
          authorPhotoURL: userProfile.photoURL || null
        });
      }
      setNewComm({ title: '', content: '', importance: 'Normale', topic: 'Generale' });
      setIsCreateModalOpen(false);
      setIsEditing(false);
      setCurrentCommId(null);
    } catch (error) {
      console.error("Error creating/updating communication:", error);
      alert("Errore durante il salvataggio della comunicazione");
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentCommId(null);
    setNewComm({ title: '', content: '', importance: 'Normale', topic: 'Generale' });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (comm) => {
    setIsEditing(true);
    setCurrentCommId(comm.id);
    setNewComm({
      title: comm.title,
      content: comm.content,
      importance: comm.importance,
      topic: comm.topic
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
    isEditing
  };
};