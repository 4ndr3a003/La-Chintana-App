import { useState, useEffect } from 'react';
import { query, collection, orderBy, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';

export const useCommunicationsView = (userProfile) => {
  const [messages, setMessages] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterTopic, setFilterTopic] = useState('Tutti');
  const [filterImportance, setFilterImportance] = useState('Tutte');
  const [newComm, setNewComm] = useState({
    title: '',
    content: '',
    importance: 'Normale',
    topic: 'Generale'
  });

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

  const handleCreateComm = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'communications'), {
        ...newComm,
        date: new Date().toISOString(),
        authorId: userProfile.id,
        authorName: userProfile.name
      });
      setNewComm({ title: '', content: '', importance: 'Normale', topic: 'Generale' });
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating communication:", error);
      alert("Errore durante la creazione della comunicazione");
    }
  };

  const handleDeleteComm = async (id) => {
    if (window.confirm("Sei sicuro di voler eliminare questa comunicazione?")) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'communications', id));
      } catch (error) {
        console.error("Error deleting communication:", error);
      }
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (filterTopic !== 'Tutti' && msg.topic !== filterTopic) return false;
    if (filterImportance !== 'Tutte' && msg.importance !== filterImportance) return false;
    return true;
  });

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
    handleDeleteComm
  };
};