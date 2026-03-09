import React from 'react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { Edit2, Trash2, MapPin, Box, Calendar, Wrench, MoreVertical, Circle, FileText } from 'lucide-react';

const EquipmentTab = ({ equipment, onEdit, onDelete, onView, searchTerm }) => {

    const filteredEquipment = equipment.filter(e =>
        (e.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (e.category?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (e.location?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'Funzionante': return 'bg-emerald-500 shadow-emerald-500/50';
            case 'Rotto': return 'bg-red-500 shadow-red-500/50';
            case 'Da Revisionare': return 'bg-amber-500 shadow-amber-500/50';
            default: return 'bg-blue-500 shadow-blue-500/50';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'Funzionante': return 'text-emerald-600 dark:text-emerald-400';
            case 'Da Revisionare': return 'text-amber-600 dark:text-amber-400';
            case 'Rotto': return 'text-red-600 dark:text-red-400';
            default: return 'text-blue-600 dark:text-blue-400';
        }
    };

    if (filteredEquipment.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 backdrop-blur-sm">
                <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-full mb-4">
                    <Box size={40} className="text-slate-400" />
                </div>
                <p className="text-lg font-bold text-slate-600 dark:text-slate-300">Nessuna attrezzatura trovata</p>
                <p className="text-sm text-slate-400">Aggiungi un nuovo asset per iniziare.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-3 md:gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {filteredEquipment.map(item => (
                <div
                    key={item.id}
                    className="group relative bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-1 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800"
                >
                    {/* 
                        MOBILE LAYOUT (< md) - COMPACT LIST ITEM
                    */}
                    <div
                        className="md:hidden flex items-center p-3 gap-3 cursor-pointer active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors rounded-xl"
                        onClick={() => onView(item)}
                    >
                        {/* Status Dot */}
                        <div className={`w-2 h-2 rounded-full shrink-0 ${getStatusColor(item.status)}`} />

                        {/* Main Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-slate-800 dark:text-white leading-tight truncate pr-2">
                                    {item.name}
                                </h3>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                                    {item.quantity} pz
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-1 truncate max-w-[120px]">
                                    <MapPin size={12} className="text-blue-500" />
                                    <span className="truncate">{item.location || 'N/A'}</span>
                                </div>
                                <span>•</span>
                                <span className={`${getStatusText(item.status)} truncate`}>
                                    {item.status}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 pl-2 border-l border-slate-100 dark:border-slate-800">
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                                className="p-2 text-slate-400 hover:text-blue-600 active:scale-95"
                            >
                                <Edit2 size={18} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                className="p-2 text-slate-400 hover:text-red-600 active:scale-95"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>

                    {/* 
                        DESKTOP LAYOUT (>= md) - CARD
                    */}
                    <div className="hidden md:block">
                        {/* Status Dot */}
                        <div className={`absolute top-6 right-6 w-3 h-3 rounded-full ${getStatusColor(item.status)}`} />

                        <div className="p-6 pl-8 h-full flex flex-col">

                            {/* Header */}
                            <div className="mb-4 pr-6">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                                    {item.category}
                                </span>
                                <h3 className="font-black text-lg text-slate-800 dark:text-white leading-tight">
                                    {item.name}
                                </h3>
                            </div>

                            {/* Location Badge */}
                            <div className="mb-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200 rounded-lg text-xs font-bold w-full border border-transparent dark:border-slate-700">
                                    <MapPin size={14} className="text-blue-500" />
                                    <span className="truncate">{item.location || 'Posizione non specificata'}</span>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Quantità</span>
                                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-black">
                                        <Box size={14} className="text-slate-400" />
                                        <span className="text-slate-700 dark:text-white">{item.quantity}</span>
                                    </div>
                                </div>

                                {item.expiryDate ? (
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Scadenza</span>
                                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-black">
                                            <Calendar size={14} className="text-slate-400" />
                                            <span className="text-slate-700 dark:text-white">{new Date(item.expiryDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 opacity-50">
                                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Scadenza</span>
                                        <span className="text-xs text-slate-400 font-medium">N/A</span>
                                    </div>
                                )}
                            </div>

                            {/* Status Text */}
                            <div className={`text-xs font-bold flex items-center gap-1.5 mb-4 ${getStatusText(item.status)}`}>
                                <Circle size={8} fill="currentColor" />
                                {item.status}
                            </div>

                            {/* Footer Actions */}
                            <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                                <button
                                    onClick={() => onView(item)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow active:scale-95 border border-transparent"
                                >
                                    <FileText size={16} />
                                    <span>Dettagli</span>
                                </button>
                                <button
                                    onClick={() => onEdit(item)}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow active:scale-95 border border-transparent hover:border-slate-200 dark:border-slate-700 dark:hover:border-slate-600"
                                >
                                    <Edit2 size={16} />
                                    <span>Modifica</span>
                                </button>
                                <button
                                    onClick={() => onDelete(item.id)}
                                    className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all active:scale-95"
                                    title="Elimina"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default EquipmentTab;
