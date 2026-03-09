import { useState, useEffect } from 'react';
import { db, storage, appId } from '../../services/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export const useLogisticManagement = (userProfile) => {
  const [activeTab, setActiveTab] = useState('equipment'); // 'vehicles' | 'equipment'
  const [vehicles, setVehicles] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'Operativo', 'Guasto', 'Manutenzione' (or equipment statuses)
  const [filterCategory, setFilterCategory] = useState('all'); // For equipment
  const [filterLocation, setFilterLocation] = useState('all'); // For equipment location (Sede, Cementeria, Vehicles)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const toggleFilters = () => setIsFiltersOpen(!isFiltersOpen);

  // Modals state
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // If null, it's adding mode
  const [viewingItem, setViewingItem] = useState(null); // For Read-Only Details Modal

  // Load Vehicles & Equipment
  useEffect(() => {
    if (!userProfile) return;

    const vehiclesRef = collection(db, 'artifacts', appId, 'public', 'data', 'vehicles');
    // Using deep path consistent with other data
    // artifacts/{appId}/public/data/vehicles
    // artifacts/{appId}/public/data/equipment

    const vQuery = collection(db, 'artifacts', appId, 'public', 'data', 'vehicles');

    const unsubVehicles = onSnapshot(vQuery, (snapshot) => {
      const vList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setVehicles(vList);
      setLoading(false);
      
      // Update viewing item to keep UI reactive for documents sync
      setViewingItem(prev => {
        if (prev) {
          const updated = vList.find(v => v.id === prev.id);
          if (updated) return updated;
        }
        return prev;
      });
    }, (err) => {
      console.error("Error fetching vehicles", err);
      setLoading(false);
    });

    const eQuery = collection(db, 'artifacts', appId, 'public', 'data', 'equipment');
    const unsubEquipment = onSnapshot(eQuery, (snapshot) => {
      const eList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setEquipment(eList);
      
      // Update viewing item for equipment as well
      setViewingItem(prev => {
        if (prev) {
          const updated = eList.find(e => e.id === prev.id);
          if (updated) return updated;
        }
        return prev;
      });
    }, (err) => {
      console.error("Error fetching equipment", err);
    });

    return () => {
      unsubVehicles();
      unsubEquipment();
    };
  }, [userProfile]);

  // CRUD Vehicles
  const handleSaveVehicle = async (data) => {
    const ref = collection(db, 'artifacts', appId, 'public', 'data', 'vehicles');
    try {
      if (editingItem) {
        await updateDoc(doc(ref, editingItem.id), data);
      } else {
        await addDoc(ref, { ...data, createdAt: new Date().toISOString() });
      }
      setIsVehicleModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Error saving vehicle:", error);
      alert("Errore nel salvataggio del mezzo");
    }
  };

  const handleDeleteVehicle = async (id) => {
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'vehicles', id));
    } catch (error) {
      console.error("Error deleting vehicle:", error);
    }
  };

  // CRUD Equipment
  const handleSaveEquipment = async (data) => {
    const ref = collection(db, 'artifacts', appId, 'public', 'data', 'equipment');
    try {
      if (editingItem) {
        await updateDoc(doc(ref, editingItem.id), data);
      } else {
        await addDoc(ref, { ...data, createdAt: new Date().toISOString() });
      }
      setIsEquipmentModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Error saving equipment:", error);
      alert("Errore nel salvataggio dell'attrezzatura");
    }
  };

  const handleDeleteEquipment = async (id) => {
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'equipment', id));
    } catch (error) {
      console.error("Error deleting equipment:", error);
    }
  };

  // Upload Vehicle Document
  const handleUploadVehicleDocument = async (vehicleId, file) => {
    if (!file || !vehicleId) return null;
    
    try {
      const fileName = `vehicle_${vehicleId}_${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `avatars/uploads/${fileName}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      const newDoc = {
        id: fileName, // Use filename as unique ID
        name: file.name,
        url: url,
        uploadedAt: new Date().toISOString(),
        type: file.type
      };

      // update firestore
      const vehicleRef = doc(db, 'artifacts', appId, 'public', 'data', 'vehicles', vehicleId);
      const vehicleData = vehicles.find(v => v.id === vehicleId);
      const currentDocs = vehicleData?.documents || [];
      
      await updateDoc(vehicleRef, {
        documents: [...currentDocs, newDoc]
      });

      return newDoc;
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }
  };

  // Delete Vehicle Document
  const handleDeleteVehicleDocument = async (vehicleId, documentId) => {
    if (!vehicleId || !documentId) return;

    try {
      const storageRef = ref(storage, `avatars/uploads/${documentId}`);
      await deleteObject(storageRef);

      const vehicleRef = doc(db, 'artifacts', appId, 'public', 'data', 'vehicles', vehicleId);
      const vehicleData = vehicles.find(v => v.id === vehicleId);
      const currentDocs = vehicleData?.documents || [];
      const updatedDocs = currentDocs.filter(d => d.id !== documentId);

      await updateDoc(vehicleRef, {
        documents: updatedDocs
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  };

  // KPI Logic
  const kpiData = {
    vehiclesOperational: vehicles.filter(v => v.status === 'Operativo').length,
    vehiclesWarning: vehicles.filter(v => v.status === 'Manutenzione').length,
    vehiclesOut: vehicles.filter(v => v.status === 'Guasto').length,
    expiringSoon: vehicles.filter(v => {
      const checkDate = (dateStr) => {
        if (!dateStr) return false;
        const d = new Date(dateStr);
        const now = new Date();
        const diffTime = d - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && diffDays >= 0;
      };
      return checkDate(v.insuranceExpiry) || checkDate(v.revisionExpiry);
    }).length,
    lowStock: 0
  };

  return {
    activeTab,
    setActiveTab,
    vehicles,
    equipment,
    loading,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterCategory,
    setFilterCategory,
    filterLocation,
    setFilterLocation,
    isFiltersOpen,
    toggleFilters,
    isVehicleModalOpen,
    setIsVehicleModalOpen,
    isEquipmentModalOpen,
    setIsEquipmentModalOpen,
    editingItem,
    setEditingItem,
    viewingItem, // Added
    setViewingItem, // Added
    handleSaveVehicle,
    handleDeleteVehicle,
    handleSaveEquipment,
    handleDeleteEquipment,
    handleUploadVehicleDocument,
    handleDeleteVehicleDocument,
    kpiData
  };
};
