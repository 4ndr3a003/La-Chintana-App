import React from 'react';
import {
  Shield,
  Radio,
  RadioTower,
  HeartPulse,
  HardHat,
  Truck,
  PawPrint
} from 'lucide-react';

export const ROLES = {
  PRESIDENT: 'presidente',
  BOARD: 'direttivo',
  VOLUNTEER: 'volontario'
};

export const IS_HIDDEN_FIELD = 'isHidden';

export const BOARD_ROLES = {
  VP: 'Vicepresidente',
  SECRETARY: 'Segretario',
  TREASURER: 'Tesoriere',
  MEMBER: 'Consigliere',
  VEHICLES: 'Responsabile Mezzi',
  K9: 'Responsabile Unità Cinofila',
  KITCHEN: 'Responsabile Cucina'
};

export const ROLE_LABELS = {
  [ROLES.PRESIDENT]: 'Presidente',
  [ROLES.BOARD]: 'Direttivo',
  [ROLES.VOLUNTEER]: 'Volontario'
};

export const EVENT_TYPES = {
  'Servizio': { color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800', label: 'Servizio' },
  'Esercitazione': { color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800', label: 'Esercitazione' },
  'Riunione': { color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700', label: 'Riunione' },
  'Emergenza': { color: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800', label: 'Emergenza' },
  'Formazione': { color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', label: 'Formazione' }
};

export const EVENT_VISIBILITY = {
  ALL: 'Tutti',
  BOARD_ONLY: 'Solo Direttivo',
  K9_ONLY: 'Solo Cinofili'
};

export const SPECIALIZATIONS_DATA = {
  "Formazione Base & Sicurezza": {
    items: [
      "Corso 4 ore",
      "Corso 12 ore",
      "Caposquadra"
    ],
    // Default validity in years
    validityYears: {
      "Corso 4 ore": 5,
      "Corso 12 ore": 5,
      "Caposquadra": 5
    },
    icon: <Shield size={18} className="text-emerald-600 dark:text-[var(--color-pc-green-600)]" />,
    color: "bg-[var(--color-pc-green-100)] dark:bg-emerald-900/20 text-[var(--color-pc-green-700)] dark:text-emerald-400 border-[var(--color-pc-green-200)] dark:border-emerald-800",
    titleColor: "text-emerald-700 dark:text-emerald-400"
  },
  "Radio & Sala Operativa": {
    items: [
      "Radio emercomnet",
      "Radio FIRCB",
      "Sala operativa"
    ],
    validityYears: {
      "Radio emercomnet": 5,
      "Radio FIRCB": 5,
      "Sala operativa": 5
    },
    icon: <RadioTower size={18} className="text-blue-600 dark:text-[var(--color-pc-blue-600)]" />,
    color: "bg-[var(--color-pc-blue-100)] dark:bg-blue-900/20 text-[var(--color-pc-blue-700)] dark:text-blue-400 border-[var(--color-pc-blue-200)] dark:border-blue-800",
    titleColor: "text-blue-700 dark:text-blue-400"
  },
  "Sanità & Igiene": {
    items: [
      "HACCP",
      "BLSD",
      "Primo soccorso",
      "Visita medica",
      "Manovre di disostruzione"
    ],
    validityYears: {
      "HACCP": 5, // TEMPORARY DEFAULT
      "BLSD": 2,
      "Primo soccorso": 5, // TEMPORARY DEFAULT
      "Visita medica": 5, // TEMPORARY DEFAULT
      "Manovre di disostruzione": 5 // TEMPORARY DEFAULT
    },
    icon: <HeartPulse size={18} className="text-red-600 dark:text-[var(--color-pc-red-600)]" />,
    color: "bg-[var(--color-pc-red-100)] dark:bg-red-900/20 text-[var(--color-pc-red-700)] dark:text-red-400 border-[var(--color-pc-red-200)] dark:border-red-800",
    titleColor: "text-red-700 dark:text-red-400"
  },
  "Operatività": {
    items: [
      "Motosega",
      "Muletto"
    ],
    validityYears: {
      "Motosega": 5,
      "Muletto": 5
    },
    icon: <HardHat size={18} className="text-orange-600 dark:text-[var(--color-pc-orange-600)]" />,
    color: "bg-[var(--color-pc-orange-100)] dark:bg-orange-900/20 text-[var(--color-pc-orange-700)] dark:text-orange-400 border-[var(--color-pc-orange-200)] dark:border-orange-800",
    titleColor: "text-orange-700 dark:text-orange-400"
  },
  "Patenti di Guida": {
    items: [
      "Patente B", "Patente BE",
      "Patente C", "Patente CE",
      "Patente D", "Patente DE"
    ],
    icon: <Truck size={18} className="text-slate-600 dark:text-white" />,
    color: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-100 border-slate-200 dark:border-slate-700",
    titleColor: "text-slate-700 dark:!text-white"
  }
};

export const VOLUNTEER_ROLES = {
  K9: 'Cinofilo'
};

export const hasAdminAccess = (user) => {
  if (!user) return false;
  return user.role === ROLES.PRESIDENT || user.role === ROLES.BOARD;
};

export const canManageVolunteers = (user) => {
  if (!user) return false;
  // President and Board can manage volunteers (Equal Powers)
  if (user.role === ROLES.PRESIDENT || user.role === ROLES.BOARD) return true;
  return false;
};

export const canManageContent = (user) => {
  if (!user) return false;
  // President and Board can manage content (Equal Powers)
  if (user.role === ROLES.PRESIDENT || user.role === ROLES.BOARD) return true;
  return false;
};
