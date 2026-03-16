import { useState, useEffect } from 'react';
import { db, storage, appId } from '../../services/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export const useLogisticManagement = (userProfile, showToast) => {
  const [activeTab, setActiveTab] = useState('equipment'); // 'vehicles' | 'equipment' | 'uniforms'
  const [vehicles, setVehicles] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [uniforms, setUniforms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'Operativo', 'Guasto', 'Manutenzione' (or equipment statuses / uniforms)
  const [filterCategory, setFilterCategory] = useState('all'); // For equipment
  const [filterLocation, setFilterLocation] = useState('all'); // For equipment location (Sede, Cementeria, Vehicles)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const toggleFilters = () => setIsFiltersOpen(!isFiltersOpen);

  // Modals state
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [isUniformModalOpen, setIsUniformModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // If null, it's adding mode
  const [viewingItem, setViewingItem] = useState(null); // For Read-Only Details Modal
  const [isImportingCSV, setIsImportingCSV] = useState(false);

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

    const uQuery = collection(db, 'artifacts', appId, 'public', 'data', 'uniforms');
    const unsubUniforms = onSnapshot(uQuery, (snapshot) => {
      const uList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setUniforms(uList);
      
      setViewingItem(prev => {
        if (prev) {
          const updated = uList.find(u => u.id === prev.id);
          if (updated) return updated;
        }
        return prev;
      });
    }, (err) => {
      console.error("Error fetching uniforms", err);
    });

    return () => {
      unsubVehicles();
      unsubEquipment();
      unsubUniforms();
    };
  }, [userProfile]);

  // CRUD Vehicles
  const handleSaveVehicle = async (data) => {
    const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'vehicles');
    const { _pendingPhotoFile, ...saveData } = data;
    // Clean placeholder
    if (saveData.photoUrl === '__pending__') saveData.photoUrl = '';
    
    try {
      if (editingItem) {
        await updateDoc(doc(colRef, editingItem.id), saveData);
      } else {
        const newDocRef = await addDoc(colRef, { ...saveData, createdAt: new Date().toISOString() });
        // Upload pending photo for new item
        if (_pendingPhotoFile) {
          await handleUploadItemPhoto('vehicles', newDocRef.id, _pendingPhotoFile);
        }
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
    const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'equipment');
    const { _pendingPhotoFile, ...saveData } = data;
    if (saveData.photoUrl === '__pending__') saveData.photoUrl = '';

    try {
      if (editingItem) {
        await updateDoc(doc(colRef, editingItem.id), saveData);
      } else {
        const newDocRef = await addDoc(colRef, { ...saveData, createdAt: new Date().toISOString() });
        if (_pendingPhotoFile) {
          await handleUploadItemPhoto('equipment', newDocRef.id, _pendingPhotoFile);
        }
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

  // CRUD Uniforms
  const handleSaveUniform = async (data) => {
    const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'uniforms');
    const { _pendingPhotoFile, ...saveData } = data;
    if (saveData.photoUrl === '__pending__') saveData.photoUrl = '';

    try {
      if (editingItem) {
        await updateDoc(doc(colRef, editingItem.id), saveData);
      } else {
        const newDocRef = await addDoc(colRef, { ...saveData, createdAt: new Date().toISOString() });
        if (_pendingPhotoFile) {
          await handleUploadItemPhoto('uniforms', newDocRef.id, _pendingPhotoFile);
        }
      }
      setIsUniformModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Error saving uniform:", error);
      alert("Errore nel salvataggio della divisa");
    }
  };

  const handleDeleteUniform = async (id) => {
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'uniforms', id));
    } catch (error) {
      console.error("Error deleting uniform:", error);
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

  const handleImportCSV = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImportingCSV(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;

      // Robust CSV Parser
      const parseCSV = (input) => {
        const rows = [];
        let currentRow = [];
        let currentCell = '';
        let inQuotes = false;

        const cleanInput = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        for (let i = 0; i < cleanInput.length; i++) {
          const char = cleanInput[i];
          const nextChar = cleanInput[i + 1];

          if (char === '"') {
            if (inQuotes && nextChar === '"') {
              currentCell += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            currentRow.push(currentCell.trim());
            currentCell = '';
          } else if (char === '\n' && !inQuotes) {
            currentRow.push(currentCell.trim());
            if (currentRow.some(c => c !== '')) {
              rows.push(currentRow);
            }
            currentRow = [];
            currentCell = '';
          } else {
            currentCell += char;
          }
        }
        if (currentRow.length > 0 || currentCell !== '') {
          currentRow.push(currentCell.trim());
          if (currentRow.some(c => c !== '')) {
            rows.push(currentRow);
          }
        }
        return rows;
      };

      const rows = parseCSV(text);
      if (rows.length < 2) {
         setIsImportingCSV(false);
         if (showToast) showToast("Il file CSV è vuoto o non valido.", "Errore Importazione", "error");
         return;
      }
      const dataRows = rows.slice(1);

      let importedCount = 0;
      let updatedCount = 0;
      let errors = [];

      let collectionName = '';
      if (activeTab === 'vehicles') collectionName = 'vehicles';
      else if (activeTab === 'equipment') collectionName = 'equipment';
      else if (activeTab === 'uniforms') collectionName = 'uniforms';

      for (const row of dataRows) {
        let itemData = {};
        
        if (activeTab === 'vehicles') {
            if (row.length >= 6) { // Posti/Radio might be empty, but at least 6-7 conceptually. Let's say >= 2 to be safe and just map by index.
                const model = row[0];
                const plate = row[1];
                const status = row[2];
                const requiredLicense = row[3];
                const seats = row[4];
                const radio = row[5];
                const notes = row[6];
                
                itemData = {
                    model: model || '',
                    plate: plate || '',
                    status: status || 'Operativo',
                    requiredLicense: requiredLicense || '',
                    seats: seats || '',
                    radio: radio || '',
                    notes: notes || '',
                    documents: []
                };
             } else if (row.length >= 2) {
                // Fallback if missing some trailing columns
                itemData = {
                    model: row[0] || '',
                    plate: row[1] || '',
                    status: row[2] || 'Operativo',
                    requiredLicense: row[3] || '',
                    seats: row[4] || '',
                    radio: row[5] || '',
                    notes: row[6] || '',
                    documents: []
                };
             } else {
                 errors.push(`Formato riga non valido (Mezzi): ${row.join(' ')}`);
                 continue;
             }
         } else if (activeTab === 'equipment') {
             if (row.length >= 2) {
                 const name = row[0];
                 const category = row[1];
                 const location = row[2];
                 const status = row[3];
                 const quantity = row[4];
                 const expiryDateRaw = row[5];
                 const notes = row[6];
                 
                  const parseDate = (dateRaw) => {
                    if (!dateRaw || dateRaw === 'N/D') return "";
                    const parts = dateRaw.replace(/\./g, '/').split('/');
                    if (parts.length === 3) {
                        return `${parts[2]}-${parts[1]}-${parts[0]}`;
                    }
                    return dateRaw;
                  };

                 itemData = {
                     name: name || '',
                     category: category || '',
                     location: location || '',
                     status: status || 'Funzionante',
                     quantity: quantity ? parseInt(quantity, 10) : 1,
                     expiryDate: parseDate(expiryDateRaw) || '',
                     notes: notes || ''
                 };
             } else {
                 errors.push(`Formato riga non valido (Attrezzature): ${row.join(' ')}`);
                 continue;
             }
         } else if (activeTab === 'uniforms') {
             if (row.length >= 2) {
                 const name = row[0];
                 const size = row[1];
                 const season = row[2];
                 const status = row[3];
                 const quantity = row[4];
                 const notes = row[5];
                 itemData = {
                     name: name || '',
                     size: size || '',
                     season: season || '',
                     status: status || 'Nuova',
                     quantity: quantity ? parseInt(quantity, 10) : 1,
                     notes: notes || ''
                 };
             } else {
                 errors.push(`Formato riga non valido (Divise): ${row.join(' ')}`);
                 continue;
             }
         }

          try {
            const matchIndex = activeTab === 'vehicles' ? vehicles.findIndex(v => v.plate && v.plate.trim().toLowerCase() === itemData.plate.trim().toLowerCase()) 
                : activeTab === 'equipment' ? equipment.findIndex(e => e.name && e.name.trim().toLowerCase() === itemData.name.trim().toLowerCase() && e.location === itemData.location) 
                : uniforms.findIndex(u => u.name && u.name.trim().toLowerCase() === itemData.name.trim().toLowerCase() && u.size === itemData.size && u.season === itemData.season);

            if (matchIndex >= 0) {
               const existingItem = activeTab === 'vehicles' ? vehicles[matchIndex] : activeTab === 'equipment' ? equipment[matchIndex] : uniforms[matchIndex];
               const ref = doc(db, 'artifacts', appId, 'public', 'data', collectionName, existingItem.id);
               // keep existing documents if updating vehicles
               if (activeTab === 'vehicles') {
                   itemData.documents = existingItem.documents || [];
               }
               await updateDoc(ref, itemData);
               updatedCount++;
            } else {
                const ref = collection(db, 'artifacts', appId, 'public', 'data', collectionName);
                await addDoc(ref, { ...itemData, createdAt: new Date().toISOString() });
                importedCount++;
            }
          } catch (error) {
              console.error("Error importing row:", itemData, error);
              errors.push(`Errore DB: ${error.message}`);
          }
      }

      setIsImportingCSV(false);
      
      let message = `Importazione completata: ${importedCount} aggiunti.`;
      if (updatedCount > 0) message += `\n${updatedCount} aggiornati.`;
      if (errors.length > 0) {
        message += `\n\nATTENZIONE: ${errors.length} righe con errori.`;
      }
      if (showToast) {
        showToast(
          message,
          errors.length > 0 ? 'Importazione con Avvisi' : 'Importazione Completata',
          errors.length > 0 ? 'warning' : 'success'
        );
      } else {
          alert(message);
      }
    };
    reader.readAsText(file);
    event.target.value = null; // Reset input
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

  // Upload Item Photo (generic for vehicles, equipment, uniforms)
  const handleUploadItemPhoto = async (collectionName, itemId, file) => {
    if (!file || !itemId || !collectionName) return null;

    try {
      const fileName = `photo_${collectionName}_${itemId}_${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `avatars/uploads/${fileName}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      const itemRef = doc(db, 'artifacts', appId, 'public', 'data', collectionName, itemId);
      await updateDoc(itemRef, {
        photoUrl: url,
        photoFileName: fileName
      });

      return url;
    } catch (error) {
      console.error("Error uploading photo:", error);
      throw error;
    }
  };

  // Delete Item Photo
  const handleDeleteItemPhoto = async (collectionName, itemId, photoFileName) => {
    if (!itemId || !collectionName) return;

    try {
      if (photoFileName) {
        const storageRef = ref(storage, `avatars/uploads/${photoFileName}`);
        await deleteObject(storageRef).catch(() => {});
      }

      const itemRef = doc(db, 'artifacts', appId, 'public', 'data', collectionName, itemId);
      await updateDoc(itemRef, {
        photoUrl: '',
        photoFileName: ''
      });
    } catch (error) {
      console.error("Error deleting photo:", error);
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
    uniforms,
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
    isUniformModalOpen,
    setIsUniformModalOpen,
    editingItem,
    setEditingItem,
    viewingItem, // Added
    setViewingItem, // Added
    handleSaveVehicle,
    handleDeleteVehicle,
    handleSaveEquipment,
    handleDeleteEquipment,
    handleSaveUniform,
    handleDeleteUniform,
    handleUploadVehicleDocument,
    handleDeleteVehicleDocument,
    handleUploadItemPhoto,
    handleDeleteItemPhoto,
    isImportingCSV,
    handleImportCSV,
    kpiData
  };
};
