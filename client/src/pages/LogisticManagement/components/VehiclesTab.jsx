import React from 'react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { Edit2, Trash2, AlertTriangle, Calendar, Radio, Gauge, Truck, MoreVertical, ShieldCheck, ShieldAlert, Wrench, Circle } from 'lucide-react';

const VehiclesTab = ({ vehicles, onEdit, onDelete, onView, searchTerm }) => {

    const filteredVehicles = vehicles.filter(v =>
        (v.model?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (v.plate?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (v.radioId?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const checkExpiry = (dateStr) => {
        if (!dateStr) return { status: 'ok', days: null };
        const d = new Date(dateStr);
        const now = new Date();
        const diffTime = d - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { status: 'expired', days: Math.abs(diffDays) };
        if (diffDays <= 30) return { status: 'warning', days: diffDays };
        return { status: 'ok', days: diffDays };
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Operativo': return 'bg-emerald-500 shadow-emerald-500/50';
            case 'Guasto': return 'bg-red-500 shadow-red-500/50';
            case 'Manutenzione': return 'bg-yellow-500 shadow-yellow-500/50';
            default: return 'bg-slate-400';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'Operativo': return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
            case 'Guasto': return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
            case 'Manutenzione': return 'text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
            default: return 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400';
        }
    };


    if (filteredVehicles.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 backdrop-blur-sm">
                <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-full mb-4">
                    <Truck size={40} className="text-slate-400" />
                </div>
                <p className="text-lg font-bold text-slate-600 dark:text-slate-300">Nessun mezzo trovato</p>
                <p className="text-sm text-slate-400">Prova a modificare i filtri o aggiungi un nuovo mezzo.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-3 md:gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {filteredVehicles.map(v => {
                const insCheck = checkExpiry(v.insuranceExpiry);
                const revCheck = checkExpiry(v.revisionExpiry);
                const hasWarning = insCheck.status !== 'ok' || revCheck.status !== 'ok';

                return (
                    <div
                        key={v.id}
                        className="group relative bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-1 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800"
                    >
                        {/* 
                            MOBILE LAYOUT (< md) - COMPACT LIST ITEM
                        */}
                        <div
                            className="md:hidden flex items-center p-3 gap-3 cursor-pointer active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors rounded-xl"
                            onClick={() => onView(v)}
                        >
                            {/* Status Strip (Left Border equivalent) */}
                            <div className={`w-1 self-stretch rounded-full ${getStatusColor(v.status)}`}></div>

                            {/* Main Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-slate-800 dark:text-white leading-tight truncate pr-2">
                                        {v.model}
                                    </h3>
                                    {/* Warnings Row */}
                                    <div className="flex gap-1 shrink-0">
                                        {insCheck.status !== 'ok' && (
                                            <ShieldAlert size={14} className={insCheck.status === 'expired' ? 'text-red-500' : 'text-amber-500'} />
                                        )}
                                        {revCheck.status !== 'ok' && (
                                            <Wrench size={14} className={revCheck.status === 'expired' ? 'text-red-500' : 'text-amber-500'} />
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                    <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 rounded">{v.plate}</span>
                                    <span>•</span>
                                    <span className={`${v.status === 'Operativo' ? 'text-emerald-600' : v.status === 'Guasto' ? 'text-red-600' : 'text-amber-600'}`}>
                                        {v.status}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 pl-2 border-l border-slate-100 dark:border-slate-800">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(v); }}
                                    className="p-2 text-slate-400 hover:text-blue-600 active:scale-95"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(v.id); }}
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
                            {/* Status Line Gradient */}
                            <div className={`absolute top-6 left-0 w-1.5 h-12 rounded-r-lg ${getStatusColor(v.status)}`} />

                            <div className="p-6 pl-8 h-full flex flex-col">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="font-black text-lg text-slate-800 dark:text-white leading-tight tracking-tight mb-2">
                                            {v.model}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            {/* Italian License Plate Style */}
                                            <div className="flex items-center h-6 rounded bg-white border border-slate-300 overflow-hidden shadow-sm select-none">
                                                <div className="bg-[#003399] w-3 h-full flex items-center justify-center relative">
                                                    <div className="absolute top-0.5 left-1/2 -translate-x-1/2 rounded-full border border-white/80 w-2 h-2 flex items-center justify-center">
                                                        <span className="text-[4px] text-white font-bold leading-none scale-75">I</span>
                                                    </div>
                                                </div>
                                                <span className="font-mono text-xs font-black bg-white text-black px-1.5 h-full flex items-center tracking-widest leading-none pt-0.5">
                                                    {v.plate}
                                                </span>
                                                <div className="bg-[#003399] w-3 h-full flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#FFCC00] mb-2 opacity-80"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getStatusText(v.status)}`}>
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-2 h-2 rounded-full ${v.status === 'Operativo' ? 'bg-emerald-500 animate-pulse' : v.status === 'Guasto' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                                            {v.status}
                                        </div>
                                    </div>
                                </div>

                                {/* Specs Grid */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-800">
                                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl text-blue-600 dark:text-blue-400">
                                            <Radio size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-400">Radio</p>
                                            <p className="text-sm font-bold text-slate-700 dark:text-white">{v.radioId || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-800">
                                        <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-xl text-amber-600 dark:text-amber-400">
                                            <Gauge size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-400">Chilometri</p>
                                            <p className="text-sm font-bold text-slate-700 dark:text-white">{v.km ? v.km.toLocaleString() : '-'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Deadlines Section */}
                                <div className="mb-6 space-y-3">
                                    {/* Insurance */}
                                    <div className={`flex items-center justify-between p-2.5 rounded-xl border text-sm transition-colors ${insCheck.status === 'expired' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' : insCheck.status === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800' : 'bg-transparent border-transparent'}`}>
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <ShieldCheck size={14} className={insCheck.status !== 'ok' ? 'text-current' : 'text-slate-400'} />
                                            <span className="font-medium">Assicurazione</span>
                                        </div>
                                        {v.insuranceExpiry ? (
                                            <div className="flex items-center gap-2">
                                                <span className={`font-mono font-bold ${insCheck.status === 'expired' ? 'text-red-600' : insCheck.status === 'warning' ? 'text-amber-600' : 'text-slate-700 dark:text-white'}`}>
                                                    {new Date(v.insuranceExpiry).toLocaleDateString('it-IT')}
                                                </span>
                                                {insCheck.status !== 'ok' && (
                                                    <AlertTriangle size={14} className={insCheck.status === 'expired' ? 'text-red-500' : 'text-amber-500'} />
                                                )}
                                            </div>
                                        ) : <span className="text-xs text-slate-400">-</span>}
                                    </div>

                                    {/* Revision */}
                                    <div className={`flex items-center justify-between p-2.5 rounded-xl border text-sm transition-colors ${revCheck.status === 'expired' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' : revCheck.status === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800' : 'bg-transparent border-transparent'}`}>
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <Wrench size={14} className={revCheck.status !== 'ok' ? 'text-current' : 'text-slate-400'} />
                                            <span className="font-medium">Revisione</span>
                                        </div>
                                        {v.revisionExpiry ? (
                                            <div className="flex items-center gap-2">
                                                <span className={`font-mono font-bold ${revCheck.status === 'expired' ? 'text-red-600' : revCheck.status === 'warning' ? 'text-amber-600' : 'text-slate-700 dark:text-white'}`}>
                                                    {new Date(v.revisionExpiry).toLocaleDateString('it-IT')}
                                                </span>
                                                {revCheck.status !== 'ok' && (
                                                    <AlertTriangle size={14} className={revCheck.status === 'expired' ? 'text-red-500' : 'text-amber-500'} />
                                                )}
                                            </div>
                                        ) : <span className="text-xs text-slate-400">-</span>}
                                    </div>
                                </div>

                                {/* Notes */}
                                {v.notes && (
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl mb-4">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-2">
                                            "{v.notes}"
                                        </p>
                                    </div>
                                )}

                                {/* Footer Actions */}
                                <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                                    <button
                                        onClick={() => onEdit(v)}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow active:scale-95 border border-transparent hover:border-slate-200 dark:border-slate-700 dark:hover:border-slate-600"
                                    >
                                        <Edit2 size={16} />
                                        <span>Modifica</span>
                                    </button>
                                    <button
                                        onClick={() => onDelete(v.id)}
                                        className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all active:scale-95"
                                        title="Elimina"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default VehiclesTab;
