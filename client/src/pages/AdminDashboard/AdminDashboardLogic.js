import { useState, useEffect, useRef } from 'react';
import { query, collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db, appId, storage, auth } from '../../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ROLES, VOLUNTEER_ROLES, SPECIALIZATIONS_DATA } from '../../utils/constants';

export const useAdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Image Upload State
  const [uploading, setUploading] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', width: 50, aspect: 1 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);


  // Bulk Actions State
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Notification State
  const [notification, setNotification] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const closeNotification = () => setNotification(prev => ({ ...prev, isOpen: false }));

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('Tutti');
  const [filterStatus, setFilterStatus] = useState('Tutti');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const toggleFilters = () => setIsFiltersOpen(!isFiltersOpen);

  // Form State
  const [formData, setFormData] = useState({});
  const [customSpec, setCustomSpec] = useState("");
  const [validitySettings, setValiditySettings] = useState({});
  const imgRef = useRef(null);

  useEffect(() => {
    // 1. Fetch Users
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

    // 2. Fetch Validity Settings
    const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'validity');
    const unsubSettings = onSnapshot(settingsRef, (snap) => {
      if (snap.exists()) {
        setValiditySettings(snap.data());
      }
    });

    return () => {
      unsub();
      unsubSettings();
    };
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.emercomnetId?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === 'Tutti' ||
      (filterRole === VOLUNTEER_ROLES.K9 ? user.volunteerRole === VOLUNTEER_ROLES.K9 : user.role === filterRole);
    const matchesStatus = filterStatus === 'Tutti' || user.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus && !user.isHidden;
  });

  const openEdit = (user) => {
    const [firstName, ...lastNameParts] = user.name ? user.name.split(' ') : ['', ''];
    const lastName = lastNameParts.join(' ');

    setFormData({
      ...user,
      firstName: firstName || '',
      lastName: lastName || '',
      specializations: user.specializations || [],
      certifications: user.certifications || {}, // Load certifications
      emercomnetId: user.emercomnetId || '',
      status: user.status || 'Operativo',
      boardRole: user.boardRole || '',
      volunteerRole: user.volunteerRole || '',
      password: '' // Reset password field for editing
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
      // role: ROLES.VOLUNTEER, // Removed duplicate
      boardRole: '',
      volunteerRole: '',
      specializations: [],
      certifications: {}, // Initialize certifications
      joinedAt: new Date().toISOString(),
      photoUrl: ''
    });
    setIsCreating(true);
  };

  const openView = (user) => {
    setSelectedUser(user);
    setIsViewing(true);
  };

  // Helper to calculate status
  const calculateStatus = (userData, oldUserData = null) => {
    const isAgeOver75 = (birthDateStr) => {
      if (!birthDateStr) return false;
      const birthDate = new Date(birthDateStr);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age > 75;
    };

    const has12Hours = userData.specializations && userData.specializations.includes('Corso 12 ore');
    const ageOver75 = isAgeOver75(userData.birthDate);

    // 1. Mandatory Rules: If missing course or too old -> MUST be Non Operativo
    if (!has12Hours || ageOver75) {
      return 'Non Operativo';
    }

    // 2. If rules pass, check if we should auto-promote to Operativo
    if (oldUserData) {
      const oldHas12Hours = oldUserData.specializations?.includes('Corso 12 ore');
      const oldAgeOver75 = isAgeOver75(oldUserData.birthDate);

      // If previously blocked by rules, and now fixed -> Auto-promote
      if ((!oldHas12Hours || oldAgeOver75) && (has12Hours && !ageOver75)) {
        return 'Operativo';
      }
    }

    // 3. Otherwise, respect the manual selection (or existing status)
    return userData.status || 'Operativo';
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();

    let userData = {
      name: fullName,
      email: formData.email,
      role: formData.role,
      // role: formData.role, // Removed duplicate
      boardRole: formData.boardRole || null,
      volunteerRole: formData.volunteerRole || null,
      specializations: formData.specializations,
      certifications: formData.certifications || {}, // Save certifications
      phone: formData.phone || '',
      cf: formData.cf || '',
      birthDate: formData.birthDate || '',
      birthPlace: formData.birthPlace || '',
      city: formData.city || '',
      emercomnetId: formData.emercomnetId || '',
      status: formData.status, // Pass current form status to helper
      photoUrl: formData.photoUrl || '',
      // Keep existing fields if editing
      ...(isEditing ? {} : {
        joinedAt: new Date().toISOString(),
        password: (formData.password && formData.password.trim() !== '') ? formData.password : "1234"
      })
    };

    // Calculate final status
    userData.status = calculateStatus(userData, isEditing ? selectedUser : null);

    // Allow password update if editing and provided
    if (isEditing && formData.password && formData.password.trim() !== '') {
      userData.password = formData.password;
    }

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
      setNotification({ isOpen: true, title: 'Errore', message: "Errore salvataggio: " + error.message, type: 'error' });
    }
  };

  const toggleSpec = (spec) => {
    setFormData(prev => {
      const specs = prev.specializations || [];
      const certs = { ...prev.certifications };
      let newSpecs;

      if (specs.includes(spec)) {
        // Remove
        newSpecs = specs.filter(s => s !== spec);
        // Optional: remove certification data when unchecked?
        // delete certs[spec]; // Uncomment if we want to clean up data
      } else {
        // Add
        newSpecs = [...specs, spec];
        // Initialize certification entry if needed
        if (!certs[spec]) {
          certs[spec] = {
            completionDate: '',
            expirationDate: ''
          };
        }
      }
      return { ...prev, specializations: newSpecs, certifications: certs };
    });
  };

  const addCustomSpec = () => {
    if (customSpec && !formData.specializations.includes(customSpec)) {
      setFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, customSpec],
        certifications: {
          ...prev.certifications,
          [customSpec]: { completionDate: '', expirationDate: '' }
        }
      }));
      setCustomSpec("");
    }
  };

  // Handle changes to certification dates
  const handleCertificationChange = (specName, field, value) => {
    setFormData(prev => {
      const newCerts = { ...prev.certifications };
      const currentCert = newCerts[specName] || {};

      const updatedCert = {
        ...currentCert,
        [field]: value
      };

      // Auto-calculate expiration date if completionDate changes
      if (field === 'completionDate' && value) {
        // 1. Try to find validity in dynamic settings
        let validityYears = validitySettings[specName];

        // 2. Fallback to constants if not in dynamic settings
        if (validityYears === undefined) {
          for (const cat in SPECIALIZATIONS_DATA) {
            const data = SPECIALIZATIONS_DATA[cat];
            if (data.validityYears && data.validityYears[specName]) {
              validityYears = data.validityYears[specName];
              break;
            }
          }
        }

        // 3. Last resort default
        if (validityYears === undefined) validityYears = 5;

        if (validityYears > 0) {
          const compDate = new Date(value);
          const expDate = new Date(compDate);
          expDate.setFullYear(expDate.getFullYear() + validityYears);

          // Format to YYYY-MM-DD
          updatedCert.expirationDate = expDate.toISOString().split('T')[0];
        }
      }

      newCerts[specName] = updatedCert;

      return { ...prev, certifications: newCerts };
    });
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
      setNotification({ isOpen: true, title: 'Successo', message: "Volontario eliminato con successo.", type: 'success' });
    } catch (error) {
      console.error("Error deleting user:", error);
      setNotification({ isOpen: true, title: 'Errore', message: "Errore durante l'eliminazione del volontario.", type: 'error' });
    }
  };

  const cancelDeleteUser = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  // Bulk Actions Logic
  const toggleUserSelection = (userId) => {
    setSelectedUserIds(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const toggleAllUsers = () => {
    // Select all except President
    const selectableUsers = filteredUsers.filter(u => u.role !== ROLES.PRESIDENT);
    const allIds = selectableUsers.map(u => u.id);

    // Check if all selectable users are currently selected
    // We check if every selectable user's ID is in the selectedUserIds array
    const areAllSelected = selectableUsers.length > 0 && selectableUsers.every(u => selectedUserIds.includes(u.id));

    if (areAllSelected) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(allIds);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedUserIds.length === 0) return;
    setIsBulkDeleteModalOpen(true);
  };

  const confirmDeleteSelected = async () => {
    try {
      const promises = selectedUserIds.map(id =>
        deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', id))
      );
      await Promise.all(promises);
      setIsBulkDeleteModalOpen(false);
      setSelectedUserIds([]);
      setNotification({ isOpen: true, title: 'Successo', message: `${selectedUserIds.length} volontari eliminati con successo.`, type: 'success' });
    } catch (error) {
      console.error("Error deleting users:", error);
      setNotification({ isOpen: true, title: 'Errore', message: "Errore durante l'eliminazione dei volontari.", type: 'error' });
    }
  };

  const cancelDeleteSelected = () => {
    setIsBulkDeleteModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = [
      "COGNOME", "NOME", "CODICE EMERCOMNET", "DATA DI NASCITA", "LUOGO DI NASCITA",
      "CODICE FISCALE", "NUMERO DI TELEFONO", "E-MAIL", "COMUNE DI RESIDENZA",
      "4 ORE", "12 ORE", "Caposquadra", "HACCP", "Radio C2 EMERCOMNET", "Radio FIRCB",
      "Sala Operativa EMERCOMNET", "Patenti", "Motosega", "Muletto", "BLSD",
      "Manovre di disostruzione", "Primo Soccorso", "Visita Medica", "Altro"
    ];

    // Helper to check spec
    const hasSpec = (specs, specName) => specs && specs.includes(specName) ? "X" : "";

    // Helper to get patents
    const getPatents = (specs) => {
      if (!specs) return "";
      return specs.filter(s => s.startsWith("Patente")).map(s => s.replace("Patente ", "")).join(", ");
    };

    // Helper to get others
    const knownSpecs = [
      "Corso 4 ore", "Corso 12 ore", "Caposquadra",
      "Radio emercomnet", "Radio FIRCB", "Sala operativa",
      "HACCP", "BLSD", "Primo soccorso", "Visita medica",
      "Motosega", "Muletto", "Manovre di disostruzione"
    ];

    const getOthers = (specs) => {
      if (!specs) return "";
      return specs.filter(s => !knownSpecs.includes(s) && !s.startsWith("Patente")).join("; ");
    };

    const csvContent = [
      headers.join(";"),
      ...users.map(user => {
        // Split name
        const parts = (user.name || "").trim().split(/\s+/);
        let firstName = "";
        let lastName = "";
        if (parts.length > 0) {
          firstName = parts[0] || "";
          lastName = parts.slice(1).join(" ") || "";
        }

        const specs = user.specializations || [];

        const row = [
          lastName, // COGNOME
          firstName, // NOME
          user.emercomnetId || "",
          user.birthDate ? new Date(user.birthDate).toLocaleDateString('it-IT') : "",
          user.birthPlace || "",
          user.cf || "",
          user.phone || "",
          user.email || "",
          user.city || "",
          hasSpec(specs, "Corso 4 ore"),
          hasSpec(specs, "Corso 12 ore"),
          hasSpec(specs, "Caposquadra"),
          hasSpec(specs, "HACCP"),
          hasSpec(specs, "Radio emercomnet"),
          hasSpec(specs, "Radio FIRCB"),
          hasSpec(specs, "Sala operativa"),
          getPatents(specs),
          hasSpec(specs, "Motosega"),
          hasSpec(specs, "Muletto"),
          hasSpec(specs, "BLSD"),
          hasSpec(specs, "Manovre di disostruzione"),
          hasSpec(specs, "Primo soccorso"),
          hasSpec(specs, "Visita medica"),
          getOthers(specs)
        ].map(field => {
          // Handle null/undefined
          if (field === null || field === undefined) return "";
          const stringField = String(field);
          if (stringField.includes(";") || stringField.includes("\n")) {
            return `"${stringField.replace(/"/g, '""')}"`;
          }
          return stringField;
        });
        return row.join(";");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "volontari.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleImportCSV = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;

      // Robust CSV Parser
      const parseCSV = (input) => {
        const rows = [];
        let currentRow = [];
        let currentCell = '';
        let inQuotes = false;

        // Normalize line endings
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
          } else if (char === ';' && !inQuotes) {
            currentRow.push(currentCell.trim());
            currentCell = '';
          } else if (char === '\n' && !inQuotes) {
            currentRow.push(currentCell.trim());
            // Only add non-empty rows
            if (currentRow.some(c => c !== '')) {
              rows.push(currentRow);
            }
            currentRow = [];
            currentCell = '';
          } else {
            currentCell += char;
          }
        }
        // Push last row
        if (currentRow.length > 0 || currentCell !== '') {
          currentRow.push(currentCell.trim());
          if (currentRow.some(c => c !== '')) {
            rows.push(currentRow);
          }
        }
        return rows;
      };

      const rows = parseCSV(text);

      // Remove headers (assume first row is header)
      const dataRows = rows.slice(1);

      let importedCount = 0;
      let skippedCount = 0;
      let errors = [];

      for (const row of dataRows) {
        // COGNOME;NOME;CODICE EMERCOMNET;DATA DI NASCITA;LUOGO DI NASCITA;CODICE FISCALE;NUMERO DI TELEFONO;E-MAIL;COMUNE DI RESIDENZA;4 ORE;12 ORE;Caposquadra;HACCP;Radio C2 EMERCOMNET;Radio FIRCB;Sala Operativa EMERCOMNET;Patenti;Motosega;Muletto;BLSD;Manovre di disostruzione;Primo Soccorso;Visita Medica;Altro

        let userData = {};

        // Try to match the new format (24 columns)
        // Relaxed check: at least enough columns to reach Email (index 7)
        if (row.length >= 8) {
          const [lastName, firstName, emercomnetId, birthDateRaw, birthPlace, cf, phone, email, city,
            c4, c12, caposquadra, haccp, radioE, radioF, salaOp, patenti, motosega, muletto, blsd, manovre, primoSoc, visitaMed, altro] = row;

          if (!email || !email.includes('@')) {
            errors.push(`Email mancante o non valida per: ${firstName} ${lastName}`);
            continue;
          }

          // Parse date from DD.MM.YYYY or DD/MM/YYYY to YYYY-MM-DD
          let birthDate = "";
          if (birthDateRaw) {
            const parts = birthDateRaw.replace(/\./g, '/').split('/');
            if (parts.length === 3) {
              // Assume DD/MM/YYYY
              birthDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            } else {
              birthDate = birthDateRaw;
            }
          }

          const specs = [];
          if (c4 && c4.toUpperCase().trim() === 'X') specs.push("Corso 4 ore");
          if (c12 && c12.toUpperCase().trim() === 'X') specs.push("Corso 12 ore");
          if (caposquadra && caposquadra.toUpperCase().trim() === 'X') specs.push("Caposquadra");
          if (haccp && haccp.toUpperCase().trim() === 'X') specs.push("HACCP");
          if (radioE && radioE.toUpperCase().trim() === 'X') specs.push("Radio emercomnet");
          if (radioF && radioF.toUpperCase().trim() === 'X') specs.push("Radio FIRCB");
          if (salaOp && salaOp.toUpperCase().trim() === 'X') specs.push("Sala operativa");
          if (motosega && motosega.toUpperCase().trim() === 'X') specs.push("Motosega");
          if (muletto && muletto.toUpperCase().trim() === 'X') specs.push("Muletto");
          if (blsd && blsd.toUpperCase().trim() === 'X') specs.push("BLSD");
          if (manovre && manovre.toUpperCase().trim() === 'X') specs.push("Manovre di disostruzione");
          if (primoSoc && primoSoc.toUpperCase().trim() === 'X') specs.push("Primo soccorso");
          if (visitaMed && visitaMed.toUpperCase().trim() === 'X') specs.push("Visita medica");

          if (patenti) {
            const pList = patenti.split(/[,;]/).map(s => s.trim()).filter(s => s);
            pList.forEach(p => {
              // If it's just "B", convert to "Patente B"
              if (!p.toLowerCase().startsWith("patente")) {
                specs.push(`Patente ${p}`);
              } else {
                specs.push(p);
              }
            });
          }

          if (altro) specs.push(...altro.split(';').map(s => s.trim()).filter(s => s));

          // TODO: Initialize certifications with empty dates for imported specs?
          // For now, we leave them undefined, they will be treated as empty.

          userData = {
            name: `${firstName} ${lastName}`.trim(),
            email: email.trim(),
            phone: phone ? phone.trim() : '',
            cf: cf ? cf.trim().toUpperCase() : '',
            birthDate: birthDate,
            birthPlace: birthPlace ? birthPlace.trim() : '',
            city: city ? city.trim() : '',
            emercomnetId: emercomnetId ? emercomnetId.trim() : '',
            role: ROLES.VOLUNTEER,
            // status: 'Operativo', // Will be calculated
            specializations: specs,
            certifications: {}, // Init empty
            joinedAt: new Date().toISOString(),
            photoUrl: '',
            password: "1234"
          };

          // Apply status rules
          userData.status = calculateStatus(userData);

        } else {
          errors.push(`Formato riga non valido (colonne insufficienti): ${row.slice(0, 2).join(' ')}`);
          continue;
        }

        // Check for duplicates
        const isDuplicate = users.some(u =>
          (u.email && u.email.toLowerCase() === userData.email.toLowerCase()) ||
          (u.cf && userData.cf && u.cf.toUpperCase() === userData.cf.toUpperCase())
        );

        if (isDuplicate) {
          skippedCount++;
          continue;
        }

        try {
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'profiles'), userData);
          importedCount++;
        } catch (error) {
          console.error("Error importing user:", userData.email, error);
          errors.push(`Errore DB per ${userData.email}: ${error.message}`);
        }
      }

      let message = `Importazione completata: ${importedCount} volontari aggiunti.`;
      if (skippedCount > 0) message += `\n${skippedCount} duplicati ignorati.`;
      if (errors.length > 0) {
        message += `\n\nATTENZIONE: ${errors.length} righe non importate:\n` + errors.slice(0, 10).join('\n');
        if (errors.length > 10) message += `\n...e altri ${errors.length - 10} errori.`;
      }
      setNotification({
        isOpen: true,
        title: errors.length > 0 ? 'Importazione con Avvisi' : 'Importazione Completata',
        message: message,
        type: errors.length > 0 ? 'warning' : 'success'
      });
    };
    reader.readAsText(file);
  };

  const handlePhotoUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(file);
      setIsImageModalOpen(true);
    }
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setImageSrc(null);
    setCompletedCrop(null);
  };

  const uploadCroppedImage = async () => {
    // 1. Check refs and crop state
    // Fallback to 'crop' if 'completedCrop' is not set (e.g. user didn't interact)
    const activeCrop = completedCrop || crop;

    if (!activeCrop || !imgRef.current) {
      console.error("Missing crop or image ref:", { activeCrop, imgRef: !!imgRef.current });
      setNotification({ isOpen: true, title: 'Attenzione', message: "Impossibile ritagliare: immagine o area di ritaglio non valide. Prova a muovere leggermente la selezione.", type: 'warning' });
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      setNotification({ isOpen: true, title: 'Errore', message: "Utente non autenticato.", type: 'error' });
      return;
    }

    setUploading(true);

    try {
      const canvas = document.createElement('canvas');
      const image = imgRef.current;

      // Validate image loaded
      if (!image.naturalWidth || !image.naturalHeight) {
        throw new Error("Immagine non caricata correttamente (dimensioni 0).");
      }

      const naturalWidth = image.naturalWidth;
      const naturalHeight = image.naturalHeight;
      const displayedWidth = image.width;
      const displayedHeight = image.height;

      console.log("Image Dims:", { naturalWidth, naturalHeight, displayedWidth, displayedHeight });

      // Initialize pixelCrop from activeCrop
      let pixelCrop = { ...activeCrop };

      // Ensure we have a valid crop object with width/height
      if (!pixelCrop.width || !pixelCrop.height) {
        // Try to use a default center crop if width/height are missing/zero
        console.warn("Invalid crop dimensions, defaulting to 50% center crop");
        pixelCrop = {
          unit: '%',
          x: 25,
          y: 25,
          width: 50,
          height: 50
        };
      }

      // Handle Percentage Crop conversion
      if (pixelCrop.unit === '%') {
        pixelCrop.x = (pixelCrop.x / 100) * naturalWidth;
        pixelCrop.y = (pixelCrop.y / 100) * naturalHeight;
        pixelCrop.width = (pixelCrop.width / 100) * naturalWidth;
        pixelCrop.height = (pixelCrop.height / 100) * naturalHeight;
      } else {
        // Handle Pixel Crop (scaled from displayed to natural)
        // If crop was done on a scaled image, we need to scale up to natural size
        const scaleX = naturalWidth / displayedWidth;
        const scaleY = naturalHeight / displayedHeight;

        pixelCrop.x = pixelCrop.x * scaleX;
        pixelCrop.y = pixelCrop.y * scaleY;
        pixelCrop.width = pixelCrop.width * scaleX;
        pixelCrop.height = pixelCrop.height * scaleY;
      }

      // Prevent 0-dimension canvas issues
      if (pixelCrop.width <= 0 || pixelCrop.height <= 0) {
        console.error("Invalid crop dimensions", pixelCrop);
        setUploading(false);
        return;
      }

      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      // Wrap canvas.toBlob in a Promise
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((b) => {
          if (!b) reject(new Error("Canvas to Blob failed"));
          resolve(b);
        }, 'image/jpeg', 0.8);
      });

      console.log("Blob created successfully, size:", blob.size);

      const filename = `avatars/uploads/avatar_${Date.now()}.jpg`; // Fixed path syntax
      const storageRef = ref(storage, filename);

      console.log("Uploading to:", filename);
      await uploadBytes(storageRef, blob);
      console.log("Upload complete");

      const url = await getDownloadURL(storageRef);
      console.log("Download URL obtained:", url);

      setFormData(prev => {
        console.log("Updating formData with new photoUrl:", url);
        return { ...prev, photoUrl: url };
      });

      closeImageModal();
      setNotification({ isOpen: true, title: 'Foto Caricata', message: "Fatto! Ora clicca 'Salva Modifiche' per confermare.", type: 'success' });

    } catch (error) {
      console.error("Error upload/crop:", error);
      setNotification({ isOpen: true, title: 'Errore', message: "Errore caricamento su server: " + error.message, type: 'error' });
    } finally {
      setUploading(false);
    }
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
    handleCertificationChange,
    closeAll,
    setIsViewing,
    setIsEditing,
    setIsCreating,
    isDeleteModalOpen,
    handleDeleteUser,
    confirmDeleteUser,
    cancelDeleteUser,
    userToDelete,
    selectedUserIds,
    toggleUserSelection,
    toggleAllUsers,
    handleDeleteSelected,
    confirmDeleteSelected,
    cancelDeleteSelected,
    isBulkDeleteModalOpen,
    searchTerm,
    setSearchTerm,
    filterRole,
    setFilterRole,
    filterStatus,
    setFilterStatus,
    filteredUsers,
    isFiltersOpen,
    toggleFilters,
    handleExportCSV,
    handleImportCSV,
    notification,
    closeNotification,
    // Image Upload Exports
    imageSrc,
    crop,
    setCrop,
    completedCrop,
    setCompletedCrop,
    isImageModalOpen,
    setIsImageModalOpen,
    imgRef,
    uploading,
    handlePhotoUpload,
    uploadCroppedImage,
    closeImageModal
  };
};
