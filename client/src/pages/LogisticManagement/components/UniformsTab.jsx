import React from 'react';
import { Layers, Shirt, Pencil, Trash2, FileText } from 'lucide-react';
import Card from '../../../components/ui/Card';

const Badge = ({ label, value }) => (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{value}</span>
    </div>
);

const UniformsTab = ({ uniforms, searchTerm, onEdit, onDelete, onView }) => {

    const filteredUniforms = uniforms.filter(u =>
        (u.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (u.size?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'Nuova': return 'bg-emerald-500 shadow-emerald-500/50';
            case 'Buona': return 'bg-blue-500 shadow-blue-500/50';
            case 'Usurata': return 'bg-amber-500 shadow-amber-500/50';
            case 'Da Sostituire': return 'bg-red-500 shadow-red-500/50';
            default: return 'bg-slate-500 shadow-slate-500/50';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'Nuova': return 'text-emerald-600 dark:text-emerald-400';
            case 'Buona': return 'text-blue-600 dark:text-blue-400';
            case 'Usurata': return 'text-amber-600 dark:text-amber-400';
            case 'Da Sostituire': return 'text-red-600 dark:text-red-400';
            default: return 'text-slate-600 dark:text-slate-400';
        }
    };

    if (filteredUniforms.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 backdrop-blur-sm">
                <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-full mb-4">
                    <Shirt size={40} className="text-slate-400" />
                </div>
                <p className="text-lg font-bold text-slate-600 dark:text-slate-300">Nessuna divisa trovata</p>
                <p className="text-sm text-slate-400">Aggiungi una nuova divisa per iniziare.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-3 md:gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {filteredUniforms.map(uniform => (
                <div
                    key={uniform.id}
                    className="group relative bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-1 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800"
                >
                    {/* 
                        MOBILE LAYOUT (< md) - COMPACT LIST ITEM
                    */}
                    <div
                        className="md:hidden flex items-center p-3 gap-3 cursor-pointer active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors rounded-xl"
                        onClick={() => onView(uniform)}
                    >
                        {/* Status Strip */}
                        <div className={`w-1 self-stretch rounded-full ${getStatusColor(uniform.status)}`} />

                        {/* Thumbnail */}
                        {uniform.photoUrl ? (
                            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 ring-1 ring-slate-200 dark:ring-slate-700 shadow-md">
                                <img src={uniform.photoUrl} alt={uniform.name} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                                <Shirt size={20} className="text-slate-400" />
                            </div>
                        )}

                        {/* Main Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-slate-800 dark:text-white leading-tight truncate pr-2">
                                    {uniform.name}
                                </h3>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                                    {uniform.quantity} pz
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 rounded">{uniform.size}</span>
                                <span>•</span>
                                <span className={`${getStatusText(uniform.status)} truncate`}>
                                    {uniform.status}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 pl-2 border-l border-slate-100 dark:border-slate-800">
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(uniform); }}
                                className="p-2 text-slate-400 hover:text-blue-600 active:scale-95"
                            >
                                <Pencil size={18} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(uniform.id); }}
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
                        {/* Status Strip */}
                        <div className={`absolute top-6 left-0 w-1.5 h-12 rounded-r-lg ${getStatusColor(uniform.status)}`} />

                        <div className="p-6 pl-8 h-full flex flex-col">

                            {/* Photo Banner */}
                            {uniform.photoUrl && (
                                <div className="-mx-2 -mt-1 mb-4 h-28 rounded-xl overflow-hidden">
                                    <img src={uniform.photoUrl} alt={uniform.name} className="w-full h-full object-cover" />
                                </div>
                            )}

                            {/* Header */}
                            <div className="mb-4 pr-6">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                                    {uniform.season}
                                </span>
                                <h3 className="font-black text-lg text-slate-800 dark:text-white leading-tight">
                                    {uniform.name}
                                </h3>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-6 mt-2">
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Taglia</span>
                                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-black">
                                        <Shirt size={14} className="text-slate-400" />
                                        <span className="text-slate-700 dark:text-white">{uniform.size}</span>
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Quantità</span>
                                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-black">
                                        <Layers size={14} className="text-slate-400" />
                                        <span className="text-slate-700 dark:text-white">{uniform.quantity}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Status Text */}
                            <div className={`text-xs font-bold flex items-center gap-1.5 mb-4 ${getStatusText(uniform.status)}`}>
                                <div className={`w-2 h-2 rounded-full ${getStatusColor(uniform.status)}`} />
                                {uniform.status}
                            </div>

                            {uniform.notes && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl mb-4">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-2">
                                        "{uniform.notes}"
                                    </p>
                                </div>
                            )}

                            {/* Footer Actions */}
                            <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                                <button
                                    onClick={() => onView(uniform)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow active:scale-95 border border-transparent"
                                >
                                    <FileText size={16} />
                                    <span>Dettagli</span>
                                </button>
                                <button
                                    onClick={() => onEdit(uniform)}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow active:scale-95 border border-transparent hover:border-slate-200 dark:border-slate-700 dark:hover:border-slate-600"
                                >
                                    <Pencil size={16} />
                                    <span>Modifica</span>
                                </button>
                                <button
                                    onClick={() => onDelete(uniform.id)}
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

export default UniformsTab;
