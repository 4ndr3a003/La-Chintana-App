import { useState, useEffect } from 'react';
import { collectionGroup, query, where, getDocs, doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, appId } from '../../services/firebase';
import { ROLES } from '../../utils/constants';

export const useSuperadminDashboardView = (userProfile, onLoginSuccess) => {
  const [associations, setAssociations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAssocToEdit, setSelectedAssocToEdit] = useState(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAssocToDelete, setSelectedAssocToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const fetchAssociations = async () => {
      try {
        const q = query(collectionGroup(db, 'profiles'), where('email', '==', userProfile.email));
        const snapshot = await getDocs(q);
        
        const assocs = [];
        const assocDocsPromises = [];

        snapshot.forEach(docSnap => {
          const pathParts = docSnap.ref.path.split('/');
          const assocIdIndex = pathParts.indexOf('associations') + 1;
          const assocId = pathParts[assocIdIndex];
          
          if (!assocs.find(a => a.associationId === assocId)) {
            assocs.push({
              associationId: assocId,
              associationName: assocId.replace('assoc_', '').toUpperCase(),
              profileId: docSnap.id,
              role: docSnap.data().role,
              logoUrl: null
            });
            
            assocDocsPromises.push(
               getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'associations', assocId))
            );
          }
        });
        
        const assocDocs = await Promise.all(assocDocsPromises);
        assocDocs.forEach((aDoc, index) => {
           if (aDoc.exists()) {
              const data = aDoc.data();
              if (data.name) assocs[index].associationName = data.name;
              if (data.logoUrl) assocs[index].logoUrl = data.logoUrl;
              if (data.city) assocs[index].city = data.city;
           }
        });
        
        setAssociations(assocs);
      } catch (error) {
        console.error("Error fetching superadmin associations:", error);
        setFetchError(error.message || "Errore sconosciuto durante il caricamento delle associazioni.");
      } finally {
        setLoading(false);
      }
    };

    if (userProfile?.email) {
      fetchAssociations();
    }
  }, [userProfile]);

  const handleSelectAssociation = (associationId) => {
    // Find the profile ID for this association
    const assoc = associations.find(a => a.associationId === associationId);
    if (assoc) {
      onLoginSuccess(assoc.profileId, associationId);
    }
  };

  const handleCreateAssociation = async (e, newId, newName, logoFile, newCity) => {
    e.preventDefault();
    if (!newId || !newName) return;
    
    // Validate ID format
    let cleanId = newId.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
    if (!cleanId.startsWith('assoc_')) {
      cleanId = `assoc_${cleanId}`;
    }

    setActionLoading(true);
    try {
      const assocRef = doc(db, 'artifacts', appId, 'public', 'data', 'associations', cleanId);
      const snap = await getDoc(assocRef);
      if (snap.exists()) {
        console.error("Associazione già esistente.");
        setActionLoading(false);
        return;
      }

      let logoUrl = null;
      if (logoFile) {
        const logoRef = ref(storage, `associations_logos/${cleanId}_${Date.now()}`);
        await uploadBytes(logoRef, logoFile);
        logoUrl = await getDownloadURL(logoRef);
      }

      await setDoc(assocRef, {
        id: cleanId,
        name: newName,
        city: newCity || "Morano sul Po",
        logoUrl: logoUrl,
        createdAt: serverTimestamp()
      });

      // Check if profile already exists in this new association
      const profileId = `admin_${cleanId}`;
      const profileRef = doc(db, 'artifacts', appId, 'public', 'data', 'associations', cleanId, 'profiles', profileId);
      
      await setDoc(profileRef, {
        email: userProfile.email,
        password: userProfile.password || "",
        name: "Superadmin",
        role: ROLES.PRESIDENT,
        status: "Operativo",
        joinedAt: new Date().toISOString()
      }, { merge: true });

      // After creation, login to the new association
      onLoginSuccess(profileId, cleanId);
      closeCreateModal();
    } catch (error) {
      console.error("Error creating association:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (assoc) => {
    setSelectedAssocToEdit(assoc);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedAssocToEdit(null);
    setIsEditModalOpen(false);
  };

  const handleUpdateAssociation = async (e, assocId, newName, logoFile, newCity) => {
    e.preventDefault();
    if (!assocId || !newName) return;

    setActionLoading(true);
    try {
      const assocRef = doc(db, 'artifacts', appId, 'public', 'data', 'associations', assocId);
      
      let logoUrl = selectedAssocToEdit?.logoUrl || null;
      if (logoFile) {
        const logoRef = ref(storage, `associations_logos/${assocId}_${Date.now()}`);
        await uploadBytes(logoRef, logoFile);
        logoUrl = await getDownloadURL(logoRef);
      }

      await setDoc(assocRef, {
        name: newName,
        city: newCity || "Morano sul Po",
        logoUrl: logoUrl,
      }, { merge: true });

      // Aggiorna lo stato locale
      setAssociations(prev => prev.map(a => 
        a.associationId === assocId 
          ? { ...a, associationName: newName, logoUrl: logoUrl, city: newCity || "Morano sul Po" } 
          : a
      ));

      closeEditModal();
    } catch (error) {
      console.error("Error updating association:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteModal = (assoc) => {
    setSelectedAssocToDelete(assoc);
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedAssocToDelete(null);
    setDeleteError('');
    setIsDeleteModalOpen(false);
  };

  const handleDeleteAssociation = async (assocId, password) => {
    if (!assocId || !password) return false;

    const assoc = associations.find(a => a.associationId === assocId);
    if (!assoc) return false;

    setActionLoading(true);
    try {
      // Verifica password effettuando una query per l'account admin
      const qPwd = query(
        collectionGroup(db, 'profiles'),
        where('email', '==', 'admin@mail.com'),
        where('password', '==', password)
      );
      const pwdSnap = await getDocs(qPwd);
      if (pwdSnap.empty) {
        setDeleteError('Password errata. Impossibile procedere.');
        setActionLoading(false);
        return false;
      }

      // 1. Delete admin profile under this association
      const profileRef = doc(db, 'artifacts', appId, 'public', 'data', 'associations', assocId, 'profiles', assoc.profileId);
      await deleteDoc(profileRef);

      // 2. Delete association document
      const assocRef = doc(db, 'artifacts', appId, 'public', 'data', 'associations', assocId);
      await deleteDoc(assocRef);

      // 3. Update local state
      const updated = associations.filter(a => a.associationId !== assocId);
      setAssociations(updated);

      closeDeleteModal();

      // 4. If we deleted the active association, switch to another one
      if (assocId === userProfile.associationId && updated.length > 0) {
        onLoginSuccess(updated[0].profileId, updated[0].associationId);
      }
      return true;
    } catch (error) {
      console.error("Error deleting association:", error);
      setDeleteError("Errore durante l'eliminazione: " + error.message);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  return {
    associations,
    loading,
    actionLoading,
    fetchError,
    handleSelectAssociation,
    handleCreateAssociation,
    isEditModalOpen,
    selectedAssocToEdit,
    openEditModal,
    closeEditModal,
    handleUpdateAssociation,
    isDeleteModalOpen,
    selectedAssocToDelete,
    openDeleteModal,
    closeDeleteModal,
    handleDeleteAssociation,
    deleteError,
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal
  };
};
