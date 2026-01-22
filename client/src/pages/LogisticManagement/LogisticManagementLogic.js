import { useState, useEffect } from 'react';
import { db, appId } from '../../services/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';

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
    }, (err) => {
      console.error("Error fetching vehicles", err);
      setLoading(false);
    });

    const eQuery = collection(db, 'artifacts', appId, 'public', 'data', 'equipment');
    const unsubEquipment = onSnapshot(eQuery, (snapshot) => {
      const eList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setEquipment(eList);
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
    kpiData
  };
};
