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

  // Bulk Actions State
  const [selectedUserIds, setSelectedUserIds] = useState([]);

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
      status: user.status || 'Operativo',
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
      boardRole: formData.boardRole || null,
      specializations: formData.specializations,
      phone: formData.phone || '',
      cf: formData.cf || '',
      birthDate: formData.birthDate || '',
      birthPlace: formData.birthPlace || '',
      city: formData.city || '',
      emercomnetId: formData.emercomnetId || '',
      status: formData.status, // Pass current form status to helper
      // Keep existing fields if editing
      ...(isEditing ? {} : { 
        joinedAt: new Date().toISOString(),
        password: formData.password, // Only save password on create (simplified)
        photoUrl: ''
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

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Sei sicuro di voler eliminare il volontario ${user.name}? L'azione è irreversibile.`)) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', user.id));
        setNotification({ isOpen: true, title: 'Successo', message: "Volontario eliminato con successo.", type: 'success' });
      } catch (error) {
        console.error("Error deleting user:", error);
        setNotification({ isOpen: true, title: 'Errore', message: "Errore durante l'eliminazione del volontario.", type: 'error' });
      }
    }
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
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      // Select all except President
      const allIds = filteredUsers
        .filter(u => u.role !== ROLES.PRESIDENT)
        .map(u => u.id);
      setSelectedUserIds(allIds);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedUserIds.length === 0) return;
    if (window.confirm(`Sei sicuro di voler eliminare ${selectedUserIds.length} volontari? L'azione è irreversibile.`)) {
      try {
        const promises = selectedUserIds.map(id => 
          deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', id))
        );
        await Promise.all(promises);
        setSelectedUserIds([]);
        setNotification({ isOpen: true, title: 'Successo', message: `${selectedUserIds.length} volontari eliminati con successo.`, type: 'success' });
      } catch (error) {
        console.error("Error deleting users:", error);
        setNotification({ isOpen: true, title: 'Errore', message: "Errore durante l'eliminazione dei volontari.", type: 'error' });
      }
    }
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
                joinedAt: new Date().toISOString(),
                photoUrl: ''
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
    handleDeleteUser,
    selectedUserIds,
    toggleUserSelection,
    toggleAllUsers,
    handleDeleteSelected,
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
    closeNotification
  };
};
