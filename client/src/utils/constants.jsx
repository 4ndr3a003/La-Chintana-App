import React from 'react';
import {
  Shield,
  Radio,
  HeartPulse,
  HardHat,
  Truck
} from 'lucide-react';

export const ROLES = {
  PRESIDENT: 'presidente',
  BOARD: 'direttivo',
  VOLUNTEER: 'volontario'
};

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
  'Servizio': { color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Servizio' },
  'Esercitazione': { color: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Esercitazione' },
  'Riunione': { color: 'bg-slate-200 text-slate-700 border-slate-300', label: 'Riunione' },
  'Emergenza': { color: 'bg-red-50 text-red-700 border-red-200', label: 'Emergenza' },
  'Formazione': { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Formazione' },
  'Direttivo': { color: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Direttivo' }
};

export const SPECIALIZATIONS_DATA = {
  "Formazione Base & Sicurezza": {
    items: [
      "Corso 4 ore",
      "Corso 12 ore",
      "Caposquadra"
    ],
    icon: <Shield size={18} className="text-emerald-600" />,
    color: "bg-emerald-50 text-emerald-700 border-emerald-100"
  },
  "Radio & Sala Operativa": {
    items: [
      "Radio emercomnet",
      "Radio FIRCB",
      "Sala operativa"
    ],
    icon: <Radio size={18} className="text-blue-600" />,
    color: "bg-blue-50 text-blue-700 border-blue-100"
  },
  "Sanità & Igiene": {
    items: [
      "HACCP",
      "BLSD",
      "Primo soccorso",
      "Visita medica",
      "Manovre di disostruzione"
    ],
    icon: <HeartPulse size={18} className="text-red-600" />,
    color: "bg-red-50 text-red-700 border-red-100"
  },
  "Operatività": {
    items: [
      "Motosega",
      "Muletto"
    ],
    icon: <HardHat size={18} className="text-orange-600" />,
    color: "bg-orange-50 text-orange-700 border-orange-100"
  },
  "Patenti di Guida": {
    items: [
      "Patente B", "Patente BE",
      "Patente C", "Patente CE",
      "Patente D", "Patente DE"
    ],
    icon: <Truck size={18} className="text-slate-600" />,
    color: "bg-slate-100 text-slate-700 border-slate-200"
  },
  "Patenti di Guida": {
    items: [
      "Patente B", "Patente BE",
      "Patente C", "Patente CE",
      "Patente D", "Patente DE"
    ],
    icon: <Truck size={18} className="text-slate-600" />,
    color: "bg-slate-100 text-slate-700 border-slate-200"
  }
};

export const VOLUNTEER_ROLES = {
  K9: 'Unità Cinofila'
};

export const hasAdminAccess = (user) => {
  if (!user) return false;
  return user.role === ROLES.PRESIDENT || user.role === ROLES.BOARD;
};

export const canManageVolunteers = (user) => {
  if (!user) return false;
  // President and Vice President can manage volunteers
  if (user.role === ROLES.PRESIDENT) return true;
  if (user.role === ROLES.BOARD && user.boardRole === BOARD_ROLES.VP) return true;
  return false;
};

export const canManageContent = (user) => {
  if (!user) return false;
  // President, Vice President, and Secretary can manage content (Events, Communications)
  if (user.role === ROLES.PRESIDENT) return true;
  if (user.role === ROLES.BOARD && (user.boardRole === BOARD_ROLES.VP || user.boardRole === BOARD_ROLES.SECRETARY)) return true;
  return false;
};
