import { useState, useEffect } from 'react';
import { query, collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { ROLES } from '../../utils/constants';

export const useAdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('Tutti');
  const [filterStatus, setFilterStatus] = useState('Tutti');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const toggleFilters = () => setIsFiltersOpen(!isFiltersOpen);
  
  // Form State
  const [formData, setFormData] = useState({});
  const [customSpec, setCustomSpec] = useState("");

  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'profiles'));
    const unsub = onSnapshot(q, (snap) => {
      const usersList = [];
      snap.forEach(doc => usersList.push({ id: doc.id, ...doc.data() }));
      
      // Ordina per cognome
      usersList.sort((a, b) => {
        const getLastName = (fullName) => {
          if (!fullName) return '';
          const parts = fullName.trim().split(/\s+/);
          // Consideriamo cognome tutto ciò che segue il primo nome
          return parts.length > 1 ? parts.slice(1).join(' ').toLowerCase() : parts[0].toLowerCase();
        };
        return getLastName(a.name).localeCompare(getLastName(b.name));
      });

      setUsers(usersList);
    });
    return () => unsub();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.emercomnetId?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === 'Tutti' || user.role === filterRole;
    const matchesStatus = filterStatus === 'Tutti' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const openEdit = (user) => {
    const [firstName, ...lastNameParts] = user.name ? user.name.split(' ') : ['', ''];
    const lastName = lastNameParts.join(' ');
    
    setFormData({
      ...user,
      firstName: firstName || '',
      lastName: lastName || '',
      specializations: user.specializations || [],
      emercomnetId: user.emercomnetId || '',
      status: user.status || 'Operativo'
    });
    setSelectedUser(user);
    setIsEditing(true);
  };

  const openCreate = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '', // Only for creation
      phone: '',
      cf: '',
      birthDate: '',
      birthPlace: '',
      city: '',
      emercomnetId: '',
      status: 'Operativo',
      role: ROLES.VOLUNTEER,
      boardRole: '',
      specializations: [],
      joinedAt: new Date().toISOString(),
      photoUrl: ''
    });
    setIsCreating(true);
  };

  const openView = (user) => {
    setSelectedUser(user);
    setIsViewing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    
    const userData = {
      name: fullName,
      email: formData.email,
      role: formData.role,
      boardRole: formData.boardRole || null,
      specializations: formData.specializations,
      phone: formData.phone || '',
      cf: formData.cf || '',
      birthDate: formData.birthDate || '',
      birthPlace: formData.birthPlace || '',
      city: formData.city || '',
      emercomnetId: formData.emercomnetId || '',
      status: formData.status || 'Operativo',
      // Keep existing fields if editing
      ...(isEditing ? {} : { 
        joinedAt: new Date().toISOString(),
        password: formData.password, // Only save password on create (simplified)
        photoUrl: ''
      })
    };

    try {
      if (isEditing && selectedUser) {
        const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', selectedUser.id);
        await updateDoc(userRef, userData);
        setIsEditing(false);
        setSelectedUser(null);
      } else if (isCreating) {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'profiles'), userData);
        setIsCreating(false);
      }
    } catch (error) {
      console.error(error);
      alert("Errore salvataggio: " + error.message);
    }
  };

  const toggleSpec = (spec) => {
    setFormData(prev => {
      const specs = prev.specializations || [];
      if (specs.includes(spec)) {
        return { ...prev, specializations: specs.filter(s => s !== spec) };
      } else {
        return { ...prev, specializations: [...specs, spec] };
      }
    });
  };

  const addCustomSpec = () => {
    if (customSpec && !formData.specializations.includes(customSpec)) {
      setFormData(prev => ({ ...prev, specializations: [...prev.specializations, customSpec] }));
      setCustomSpec("");
    }
  };

  const closeAll = () => {
      setIsEditing(false);
      setIsCreating(false);
      setIsViewing(false);
      setSelectedUser(null);
  }

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', userToDelete.id));
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Errore durante l'eliminazione del volontario.");
    }
  };

  const cancelDeleteUser = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  return {
    users,
    selectedUser,
    isEditing,
    isCreating,
    isViewing,
    formData,
    customSpec,
    setFormData,
    setCustomSpec,
    openEdit,
    openCreate,
    openView,
    handleSave,
    toggleSpec,
    addCustomSpec,
    closeAll,
    setIsViewing,
    setIsEditing,
    setIsCreating,
    isDeleteModalOpen,
    handleDeleteUser,
    confirmDeleteUser,
    cancelDeleteUser,
    searchTerm,
    setSearchTerm,
    filterRole,
    setFilterRole,
    filterStatus,
    setFilterStatus,
    filteredUsers,
    isFiltersOpen,
    toggleFilters
  };
};
