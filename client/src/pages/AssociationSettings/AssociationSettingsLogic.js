import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, appId } from '../../services/firebase';
import {
  ROLES, BOARD_ROLES, VOLUNTEER_ROLES,
  SPECIALIZATIONS_DATA, EVENT_TYPES, EVENT_VISIBILITY
} from '../../utils/constants';

// --- Default builders ---

const buildDefaultRoles = () => ({
  baseRoles: Object.entries(ROLES).map(([key, value]) => ({
    key,
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1)
  })),
  boardRoles: Object.entries(BOARD_ROLES).map(([key, value]) => ({ key, label: value })),
  volunteerRoles: Object.entries(VOLUNTEER_ROLES).map(([key, value]) => ({ key, label: value }))
});

const buildDefaultSpecializations = () => {
  const categories = [];
  Object.entries(SPECIALIZATIONS_DATA).forEach(([catName, catData]) => {
    categories.push({
      name: catName,
      items: catData.items || [],
      validityYears: catData.validityYears || {},
      colorKey: catName // used to map to a predefined color
    });
  });
  return { categories };
};

const buildDefaultNavigation = () => ({
  pages: [
    { id: 'home', label: 'Home Dashboard', enabled: true, system: true },
    { id: 'events', label: 'Eventi', enabled: true, system: true },
    { id: 'comms', label: 'Comunicazioni', enabled: true, system: true },
    { id: 'admin', label: 'Gestione Volontari', enabled: true, system: true },
    { id: 'logistics', label: 'Logistica', enabled: true, system: true },
    { id: 'direttivo', label: 'Dashboard Direttivo', enabled: true, system: true }
  ]
});

const buildDefaultEventTypes = () => {
  const types = [];
  Object.entries(EVENT_TYPES).forEach(([name, data]) => {
    types.push({ name, label: data.label, color: data.color });
  });
  return { types };
};

const buildDefaultEventVisibility = () => {
  const options = [];
  Object.entries(EVENT_VISIBILITY).forEach(([key, value]) => {
    let allowedRoles = [];
    if (key === 'ALL') allowedRoles = ['BASE_ALL'];
    else if (key === 'BOARD_ONLY') allowedRoles = ['BASE_BOARD'];
    else if (key === 'K9_ONLY') allowedRoles = ['VOLUNTEER_K9'];
    options.push({ key, label: value, allowedRoles });
  });
  return { options };
};

const buildDefaultBranding = (assocData) => ({
  name: assocData?.name || '',
  city: assocData?.city || '',
  logoUrl: assocData?.logoUrl || '',
  description: assocData?.description || '',
  privacyPolicyUrl: assocData?.privacyPolicyUrl || '',
  primaryColor: assocData?.primaryColor || '#1e40af',
  secondaryColor: assocData?.secondaryColor || '#f59e0b'
});

// --- Main Hook ---

export const useAssociationSettings = (assocId) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('roles');
  const [saveMessage, setSaveMessage] = useState(null);

  // Settings State
  const [roles, setRoles] = useState(null);
  const [specializations, setSpecializations] = useState(null);
  const [navigation, setNavigation] = useState(null);
  const [eventTypes, setEventTypes] = useState(null);
  const [eventVisibility, setEventVisibility] = useState(null);
  const [branding, setBranding] = useState(null);

  // Association root data (for branding)
  const [assocData, setAssocData] = useState(null);

  // --- Firestore paths ---
  const settingsPath = (docName) =>
    doc(db, 'artifacts', appId, 'public', 'data', 'associations', assocId, 'settings', docName);

  const assocDocPath = () =>
    doc(db, 'artifacts', appId, 'public', 'data', 'associations', assocId);

  // --- Load all settings ---
  useEffect(() => {
    if (!assocId) return;

    const loadAll = async () => {
      setLoading(true);
      try {
        // Load in parallel, catching individual errors to avoid aborting the whole Promise.all
        const safeGetDoc = (path) => getDoc(path).catch(e => { console.warn('Warning loading doc:', path, e); return { exists: () => false }; });
        
        const [rolesSnap, specSnap, navSnap, etSnap, evSnap, assocSnap] = await Promise.all([
          safeGetDoc(settingsPath('roles')),
          safeGetDoc(settingsPath('specializations')),
          safeGetDoc(settingsPath('navigation')),
          safeGetDoc(settingsPath('event_types')),
          safeGetDoc(settingsPath('event_visibility')),
          safeGetDoc(assocDocPath())
        ]);

        const aData = assocSnap.exists() ? assocSnap.data() : {};
        setAssocData(aData);

        setRoles(rolesSnap.exists() ? rolesSnap.data() : buildDefaultRoles());
        setSpecializations(specSnap.exists() ? specSnap.data() : buildDefaultSpecializations());
        setNavigation(navSnap.exists() ? navSnap.data() : buildDefaultNavigation());
        setEventTypes(etSnap.exists() ? etSnap.data() : buildDefaultEventTypes());
        setEventVisibility(evSnap.exists() ? evSnap.data() : buildDefaultEventVisibility());
        setBranding(buildDefaultBranding(aData));
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [assocId]);

  // --- Flash save message ---
  const flashMessage = useCallback((msg, type = 'success') => {
    setSaveMessage({ msg, type });
    setTimeout(() => setSaveMessage(null), 3000);
  }, []);

  // --- Save functions ---

  const saveRoles = async () => {
    setSaving(true);
    try {
      await setDoc(settingsPath('roles'), roles);
      flashMessage('Ruoli salvati con successo!');
    } catch (e) {
      console.error(e);
      flashMessage('Errore nel salvataggio dei ruoli.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveSpecializations = async () => {
    setSaving(true);
    try {
      await setDoc(settingsPath('specializations'), specializations);
      flashMessage('Corsi e specializzazioni salvati!');
    } catch (e) {
      console.error(e);
      flashMessage('Errore nel salvataggio.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveNavigation = async () => {
    setSaving(true);
    try {
      await setDoc(settingsPath('navigation'), navigation);
      flashMessage('Pagine e navigazione salvate!');
    } catch (e) {
      console.error(e);
      flashMessage('Errore nel salvataggio.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveEventTypes = async () => {
    setSaving(true);
    try {
      await setDoc(settingsPath('event_types'), eventTypes);
      flashMessage('Tipologie evento salvate!');
    } catch (e) {
      console.error(e);
      flashMessage('Errore nel salvataggio.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveEventVisibility = async () => {
    setSaving(true);
    try {
      await setDoc(settingsPath('event_visibility'), eventVisibility);
      flashMessage('Visibilità evento salvata!');
    } catch (e) {
      console.error(e);
      flashMessage('Errore nel salvataggio.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveBranding = async (logoFile) => {
    console.log("=== START SAVE BRANDING ===");
    setSaving(true);
    try {
      let logoUrl = branding.logoUrl || '';
      if (logoFile) {
        const logoRef = ref(storage, `associations_logos/${assocId}_${Date.now()}`);
        await uploadBytes(logoRef, logoFile);
        logoUrl = await getDownloadURL(logoRef);
      }

      // Ensure no undefined values
      const brandingData = {
        name: branding.name || '',
        city: branding.city || '',
        logoUrl: logoUrl || '',
        description: branding.description || '',
        privacyPolicyUrl: branding.privacyPolicyUrl || '',
        primaryColor: branding.primaryColor || '#ef4444',
        secondaryColor: branding.secondaryColor || '#f59e0b'
      };
      console.log("Saving branding data to Firestore:", brandingData);

      // Save to association root document
      await setDoc(assocDocPath(), brandingData, { merge: true });

      setBranding(brandingData);
      flashMessage('Personalizzazione salvata!');
      console.log("=== SAVE BRANDING SUCCESS ===");
    } catch (e) {
      console.error("=== SAVE BRANDING ERROR ===", e);
      flashMessage('Errore nel salvataggio.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // --- Roles helpers ---

  const addBoardRole = (label) => {
    if (!label.trim()) return;
    const key = label.trim().toUpperCase().replace(/\s+/g, '_');
    setRoles(prev => ({
      ...prev,
      boardRoles: [...prev.boardRoles, { key, label: label.trim() }]
    }));
  };

  const removeBoardRole = (key) => {
    setRoles(prev => ({
      ...prev,
      boardRoles: prev.boardRoles.filter(r => r.key !== key)
    }));
  };

  const updateBoardRoleLabel = (key, newLabel) => {
    setRoles(prev => ({
      ...prev,
      boardRoles: prev.boardRoles.map(r => r.key === key ? { ...r, label: newLabel } : r)
    }));
  };

  const addVolunteerRole = (label) => {
    if (!label.trim()) return;
    const key = label.trim().toUpperCase().replace(/\s+/g, '_');
    setRoles(prev => ({
      ...prev,
      volunteerRoles: [...prev.volunteerRoles, { key, label: label.trim() }]
    }));
  };

  const removeVolunteerRole = (key) => {
    setRoles(prev => ({
      ...prev,
      volunteerRoles: prev.volunteerRoles.filter(r => r.key !== key)
    }));
  };

  const updateVolunteerRoleLabel = (key, newLabel) => {
    setRoles(prev => ({
      ...prev,
      volunteerRoles: prev.volunteerRoles.map(r => r.key === key ? { ...r, label: newLabel } : r)
    }));
  };

  // --- Specializations helpers ---

  const addSpecCategory = (name) => {
    if (!name.trim()) return;
    setSpecializations(prev => ({
      ...prev,
      categories: [...prev.categories, {
        name: name.trim(),
        items: [],
        validityYears: {},
        colorKey: 'default'
      }]
    }));
  };

  const removeSpecCategory = (catName) => {
    setSpecializations(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.name !== catName)
    }));
  };

  const addSpecItem = (catName, itemName) => {
    if (!itemName.trim()) return;
    setSpecializations(prev => ({
      ...prev,
      categories: prev.categories.map(c => {
        if (c.name === catName) {
          return {
            ...c,
            items: [...c.items, itemName.trim()],
            validityYears: { ...c.validityYears, [itemName.trim()]: 5 }
          };
        }
        return c;
      })
    }));
  };

  const removeSpecItem = (catName, itemName) => {
    setSpecializations(prev => ({
      ...prev,
      categories: prev.categories.map(c => {
        if (c.name === catName) {
          const newVY = { ...c.validityYears };
          delete newVY[itemName];
          return {
            ...c,
            items: c.items.filter(i => i !== itemName),
            validityYears: newVY
          };
        }
        return c;
      })
    }));
  };

  const updateSpecValidity = (catName, itemName, years) => {
    setSpecializations(prev => ({
      ...prev,
      categories: prev.categories.map(c => {
        if (c.name === catName) {
          return {
            ...c,
            validityYears: { ...c.validityYears, [itemName]: parseInt(years) || 0 }
          };
        }
        return c;
      })
    }));
  };

  const updateSpecCategoryName = (oldName, newName) => {
    if (!newName.trim()) return;
    setSpecializations(prev => ({
      ...prev,
      categories: prev.categories.map(c =>
        c.name === oldName ? { ...c, name: newName.trim() } : c
      )
    }));
  };

  // --- Navigation helpers ---

  const togglePage = (pageId) => {
    setNavigation(prev => ({
      ...prev,
      pages: prev.pages.map(p =>
        p.id === pageId ? { ...p, enabled: !p.enabled } : p
      )
    }));
  };

  const addCustomPage = (label) => {
    if (!label.trim()) return;
    const id = 'custom_' + label.trim().toLowerCase().replace(/\s+/g, '_');
    setNavigation(prev => ({
      ...prev,
      pages: [...prev.pages, { id, label: label.trim(), enabled: true, system: false }]
    }));
  };

  const removeCustomPage = (pageId) => {
    setNavigation(prev => ({
      ...prev,
      pages: prev.pages.filter(p => p.id !== pageId)
    }));
  };

  const updateCustomPageLabel = (pageId, newLabel) => {
    if (!newLabel.trim()) return;
    setNavigation(prev => ({
      ...prev,
      pages: prev.pages.map(p =>
        p.id === pageId ? { ...p, label: newLabel.trim() } : p
      )
    }));
  };

  // --- Event Types helpers ---

  const addEventType = (name) => {
    if (!name.trim()) return;
    setEventTypes(prev => ({
      ...prev,
      types: [...prev.types, {
        name: name.trim(),
        label: name.trim(),
        color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
      }]
    }));
  };

  const removeEventType = (name) => {
    setEventTypes(prev => ({
      ...prev,
      types: prev.types.filter(t => t.name !== name)
    }));
  };

  const updateEventTypeColor = (name, color) => {
    setEventTypes(prev => ({
      ...prev,
      types: prev.types.map(t =>
        t.name === name ? { ...t, color } : t
      )
    }));
  };

  const updateEventTypeName = (oldName, newName) => {
    if (!newName.trim()) return;
    setEventTypes(prev => ({
      ...prev,
      types: prev.types.map(t =>
        t.name === oldName ? { ...t, name: newName.trim(), label: newName.trim() } : t
      )
    }));
  };

  // --- Event Visibility helpers ---

  const addVisibilityOption = (label) => {
    if (!label.trim()) return;
    const key = label.trim().toUpperCase().replace(/\s+/g, '_');
    setEventVisibility(prev => ({
      ...prev,
      options: [...prev.options, { key, label: label.trim(), allowedRoles: [] }]
    }));
  };

  const removeVisibilityOption = (key) => {
    setEventVisibility(prev => ({
      ...prev,
      options: prev.options.filter(o => o.key !== key)
    }));
  };

  const updateVisibilityLabel = (key, newLabel) => {
    setEventVisibility(prev => ({
      ...prev,
      options: prev.options.map(o =>
        o.key === key ? { ...o, label: newLabel } : o
      )
    }));
  };

  const toggleVisibilityRole = (key, roleId) => {
    setEventVisibility(prev => ({
      ...prev,
      options: prev.options.map(o => {
        if (o.key !== key) return o;
        const currentRoles = o.allowedRoles || [];
        const hasRole = currentRoles.includes(roleId);
        
        // If clicking 'BASE_ALL', clear other roles and just set BASE_ALL, or toggle it
        if (roleId === 'BASE_ALL') {
          return { ...o, allowedRoles: hasRole ? [] : ['BASE_ALL'] };
        }
        
        // Otherwise, if we toggle another role, remove BASE_ALL first
        let newRoles = currentRoles.filter(r => r !== 'BASE_ALL');
        
        if (hasRole) {
          newRoles = newRoles.filter(r => r !== roleId);
        } else {
          newRoles.push(roleId);
        }
        return { ...o, allowedRoles: newRoles };
      })
    }));
  };

  return {
    loading, saving, activeTab, setActiveTab, saveMessage,
    // Data
    roles, specializations, navigation, eventTypes, eventVisibility, branding, assocData,
    // Save
    saveRoles, saveSpecializations, saveNavigation, saveEventTypes, saveEventVisibility, saveBranding,
    // Roles
    addBoardRole, removeBoardRole, updateBoardRoleLabel,
    addVolunteerRole, removeVolunteerRole, updateVolunteerRoleLabel,
    // Specializations
    addSpecCategory, removeSpecCategory, addSpecItem, removeSpecItem, updateSpecValidity, updateSpecCategoryName,
    // Navigation
    togglePage, addCustomPage, removeCustomPage, updateCustomPageLabel,
    // Event Types
    addEventType, removeEventType, updateEventTypeColor, updateEventTypeName,
    // Event Visibility
    addVisibilityOption, removeVisibilityOption, updateVisibilityLabel, toggleVisibilityRole,
    // Branding
    setBranding
  };
};
