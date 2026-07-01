import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../services/firebase';
import {
  ROLES as DEFAULT_ROLES,
  BOARD_ROLES as DEFAULT_BOARD_ROLES,
  VOLUNTEER_ROLES as DEFAULT_VOLUNTEER_ROLES,
  EVENT_TYPES as DEFAULT_EVENT_TYPES,
  EVENT_VISIBILITY as DEFAULT_EVENT_VISIBILITY,
  SPECIALIZATIONS_DATA as DEFAULT_SPECIALIZATIONS
} from '../utils/constants';

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const mixColor = (hex, mixHex, weight) => {
    const color1 = hexToRgb(hex);
    const color2 = hexToRgb(mixHex);
    if (!color1 || !color2) return hex;
    const w = weight * 2 - 1;
    const w1 = (w/1+1) / 2;
    const w2 = 1 - w1;
    const r = Math.round(color1.r * w2 + color2.r * w1);
    const g = Math.round(color1.g * w2 + color2.g * w1);
    const b = Math.round(color1.b * w2 + color2.b * w1);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const applyBranding = (primary, secondary) => {
    const applyScale = (prefix, baseColor) => {
        document.documentElement.style.setProperty(`--color-${prefix}-50`, mixColor(baseColor, '#ffffff', 0.9));
        document.documentElement.style.setProperty(`--color-${prefix}-100`, mixColor(baseColor, '#ffffff', 0.8));
        document.documentElement.style.setProperty(`--color-${prefix}-200`, mixColor(baseColor, '#ffffff', 0.6));
        document.documentElement.style.setProperty(`--color-${prefix}-300`, mixColor(baseColor, '#ffffff', 0.4));
        document.documentElement.style.setProperty(`--color-${prefix}-400`, mixColor(baseColor, '#ffffff', 0.2));
        document.documentElement.style.setProperty(`--color-${prefix}-500`, mixColor(baseColor, '#ffffff', 0.1));
        document.documentElement.style.setProperty(`--color-${prefix}-600`, baseColor);
        document.documentElement.style.setProperty(`--color-${prefix}-700`, mixColor(baseColor, '#000000', 0.2));
        document.documentElement.style.setProperty(`--color-${prefix}-800`, mixColor(baseColor, '#000000', 0.4));
        document.documentElement.style.setProperty(`--color-${prefix}-900`, mixColor(baseColor, '#000000', 0.6));
        document.documentElement.style.setProperty(`--color-${prefix}`, baseColor);
    };

    if (primary) {
        applyScale('pc-blue', primary);
        document.documentElement.style.setProperty('--bg-header', primary);
        document.documentElement.style.setProperty('--color-primary', primary);
    }
    if (secondary) {
        applyScale('pc-yellow', secondary);
        document.documentElement.style.setProperty('--color-secondary', secondary);
        // Force specific yellow aliases for amber compatibility
        document.documentElement.style.setProperty('--color-amber-400', secondary);
        document.documentElement.style.setProperty('--color-amber-500', mixColor(secondary, '#000000', 0.1));
    }
};

const AssociationSettingsContext = createContext();

export const useAppSettings = () => {
  const context = useContext(AssociationSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within an AssociationSettingsProvider');
  }
  return context;
};

export const AssociationSettingsProvider = ({ children, associationId }) => {
  const [settings, setSettings] = useState({
    roles: DEFAULT_ROLES,
    boardRoles: DEFAULT_BOARD_ROLES,
    volunteerRoles: DEFAULT_VOLUNTEER_ROLES,
    eventTypes: DEFAULT_EVENT_TYPES,
    eventVisibility: DEFAULT_EVENT_VISIBILITY,
    eventVisibilityOptions: [
      { key: 'ALL', label: 'Tutti', allowedRoles: ['BASE_ALL'] },
      { key: 'BOARD_ONLY', label: 'Solo Direttivo', allowedRoles: ['BASE_BOARD'] },
      { key: 'K9_ONLY', label: 'Solo Cinofili', allowedRoles: ['VOLUNTEER_K9'] }
    ],
    specializations: DEFAULT_SPECIALIZATIONS,
    navigation: { pages: [] }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!associationId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const assocDocPath = `artifacts/${appId}/public/data/associations/${associationId}`;
    const basePath = `${assocDocPath}/settings`;

    // Listen for main association branding
    const unsubAssoc = onSnapshot(doc(db, assocDocPath), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        applyBranding(data.primaryColor, data.secondaryColor);
        setSettings(prev => ({ ...prev, associationInfo: data }));
      }
    });

    // Listeners for all settings
    const unsubRoles = onSnapshot(doc(db, basePath, 'roles'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setSettings(prev => ({
          ...prev,
          boardRoles: data.boardRoles ? Object.fromEntries(data.boardRoles.map(r => [r.key, r.label])) : DEFAULT_BOARD_ROLES,
          volunteerRoles: data.volunteerRoles ? Object.fromEntries(data.volunteerRoles.map(r => [r.key, r.label])) : DEFAULT_VOLUNTEER_ROLES
        }));
      }
    });

    const unsubSpecs = onSnapshot(doc(db, basePath, 'specializations'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.categories) {
          const mergedSpecs = {};
          data.categories.forEach(cat => {
            mergedSpecs[cat.name] = {
              ...DEFAULT_SPECIALIZATIONS[cat.name], // Fallback to get icons/colors if available
              items: cat.items || [],
              validityYears: cat.validityYears || {}
            };
            if (!mergedSpecs[cat.name].icon) {
              // Default styling for new custom categories
              mergedSpecs[cat.name].color = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700";
              mergedSpecs[cat.name].titleColor = "text-slate-700 dark:text-slate-300";
            }
          });
          setSettings(prev => ({ ...prev, specializations: mergedSpecs }));
        }
      }
    });

    const unsubNav = onSnapshot(doc(db, basePath, 'navigation'), (snap) => {
      if (snap.exists()) {
        setSettings(prev => ({ ...prev, navigation: snap.data() }));
      }
    });

    const unsubEvents = onSnapshot(doc(db, basePath, 'event_types'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.types) {
          const mergedEvents = {};
          data.types.forEach(type => {
            mergedEvents[type.name] = { label: type.label, color: type.color };
          });
          setSettings(prev => ({ ...prev, eventTypes: mergedEvents }));
        }
      }
    });

    const unsubVis = onSnapshot(doc(db, basePath, 'event_visibility'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.options) {
          const mergedVis = {};
          data.options.forEach(opt => {
            mergedVis[opt.key] = opt.label;
          });
          setSettings(prev => ({ 
            ...prev, 
            eventVisibility: mergedVis,
            eventVisibilityOptions: data.options 
          }));
        }
      }
    });

    setLoading(false);

    return () => {
      unsubAssoc();
      unsubRoles();
      unsubSpecs();
      unsubNav();
      unsubEvents();
      unsubVis();
    };
  }, [associationId]);

  return (
    <AssociationSettingsContext.Provider value={{ ...settings, loading }}>
      {children}
    </AssociationSettingsContext.Provider>
  );
};
