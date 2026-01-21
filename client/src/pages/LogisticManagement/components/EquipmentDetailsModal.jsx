import React from 'react';
import { X, Box, MapPin, Calendar, Activity, Tag } from 'lucide-react';

const EquipmentDetailsModal = ({ isOpen, onClose, equipment }) => {
    if (!isOpen || !equipment) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Header Image / Pattern */}
                <div className="h-24 bg-[#facc15] relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 text-slate-800 rounded-full transition-colors backdrop-blur-md"
                    >
                        <X size={20} />
                    </button>
                    <div className="absolute -bottom-8 left-6">
                        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-900">
                            <Box size={32} className="text-slate-800 dark:text-slate-200" />
                        </div>
                    </div>
                </div>

                <div className="pt-10 px-6 pb-6">
                    {/* Title & Category */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                                {equipment.category}
                            </div>
                            <h2 className="text-xl font-black text-slate-800 dark:text-white leading-tight">
                                {equipment.name}
                            </h2>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${equipment.status === 'Funzionante' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' :
                            equipment.status === 'Rotto' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' :
                                'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                            }`}>
                            {equipment.status}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div className="text-slate-400 text-[10px] font-bold uppercase mb-1 flex items-center gap-1">
                                <Box size={12} /> Quantità
                            </div>
                            <div className="font-bold text-slate-700 dark:text-slate-200 text-lg">
                                {equipment.quantity} <span className="text-sm font-medium text-slate-400">pz</span>
                            </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div className="text-slate-400 text-[10px] font-bold uppercase mb-1 flex items-center gap-1">
                                <Calendar size={12} /> Scadenza
                            </div>
                            <div className="font-bold text-slate-700 dark:text-slate-200">
                                {equipment.expiryDate ? new Date(equipment.expiryDate).toLocaleDateString() : 'N/A'}
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="mb-6 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800">
                        <div className="text-blue-500 dark:text-blue-400 text-xs font-bold uppercase mb-2 flex items-center gap-1">
                            <MapPin size={14} /> Luogo
                        </div>
                        <div className="font-bold text-slate-700 dark:text-white">
                            {equipment.location || 'Posizione non specificata'}
                        </div>
                    </div>

                    {/* Notes */}
                    {equipment.notes && (
                        <div className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl italic">
                            "{equipment.notes}"
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EquipmentDetailsModal;
