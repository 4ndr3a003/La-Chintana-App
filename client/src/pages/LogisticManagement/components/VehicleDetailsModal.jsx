import React, { useState, useRef } from 'react';
import { X, Truck, Calendar, Radio, Gauge, MapPin, AlertTriangle, ShieldCheck, Wrench, FileText, Upload, Trash2, Loader2, Download } from 'lucide-react';
import DeleteConfirmationModal from '../../../components/ui/DeleteConfirmationModal';

const VehicleDetailsModal = ({ isOpen, onClose, vehicle, onUploadDocument, onDeleteDocument }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [docToDelete, setDocToDelete] = useState(null); // Document object or null
    const [isDeleting, setIsDeleting] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        try {
            setIsUploading(true);
            await onUploadDocument(vehicle.id, file);
        } catch (error) {
            console.error("Upload error", error);
            alert('Errore caricamento documento');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };
    
    const confirmDelete = async () => {
        if (!docToDelete) return;
        try {
            setIsDeleting(true);
            await onDeleteDocument(vehicle.id, docToDelete.id);
        } catch (error) {
            console.error("Delete error", error);
            alert("Errore durante l'eliminazione del documento");
        } finally {
            setIsDeleting(false);
            setDocToDelete(null);
        }
    };

    if (!isOpen || !vehicle) return null;

    const checkExpiry = (dateStr) => {
        if (!dateStr) return { status: 'ok', days: null };
        const d = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return { status: 'expired', label: 'Scaduta' };
        if (diffDays <= 30) return { status: 'warning', label: 'In Scadenza' };
        return { status: 'ok', label: 'Valida' };
    };

    const insCheck = checkExpiry(vehicle.insuranceExpiry);
    const revCheck = checkExpiry(vehicle.revisionExpiry);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Header Image / Pattern */}
                <div className="h-32 relative">
                    {vehicle.photoUrl ? (
                        <img src={vehicle.photoUrl} alt={vehicle.model} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-[#facc15]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 text-white rounded-full transition-colors backdrop-blur-md"
                    >
                        <X size={20} />
                    </button>
                    <div className="absolute -bottom-8 left-6 z-10">
                        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-900">
                            <Truck size={32} className="text-slate-800 dark:text-slate-200" />
                        </div>
                    </div>
                </div>

                <div className="pt-10 px-6 pb-6">
                    {/* Title & Status */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-black text-slate-800 dark:text-white leading-tight mb-1">
                                {vehicle.model}
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-sm font-bold border border-slate-200 dark:border-slate-700">
                                    {vehicle.plate}
                                </span>
                            </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${vehicle.status === 'Operativo' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' :
                            vehicle.status === 'Guasto' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' :
                                'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                            }`}>
                            {vehicle.status}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl flex flex-col justify-between border border-slate-100 dark:border-slate-800 relative overflow-hidden group/card hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-lg text-blue-600 dark:text-blue-400">
                                    <Radio size={14} />
                                </div>
                                <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-400">Sigla Radio</p>
                            </div>
                            <div className="font-bold text-slate-700 dark:text-slate-200 font-mono tracking-tight leading-tight break-words z-10">
                                {vehicle.radioId || '-'}
                            </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl flex flex-col justify-between border border-slate-100 dark:border-slate-800 relative overflow-hidden group/card hover:border-amber-200 dark:hover:border-amber-800 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="bg-amber-100 dark:bg-amber-900/30 p-1.5 rounded-lg text-amber-600 dark:text-amber-400">
                                    <Gauge size={14} />
                                </div>
                                <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-400">Km Attuali</p>
                            </div>
                            <div className="font-bold text-slate-700 dark:text-slate-200 text-lg z-10">
                                {vehicle.km ? vehicle.km.toLocaleString() : '-'}
                            </div>
                        </div>
                    </div>

                    {/* Deadlines */}
                    <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${insCheck.status === 'ok' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                                    <ShieldCheck size={18} />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase">Assicurazione</div>
                                    <div className="font-bold text-slate-700 dark:text-white text-sm">
                                        {vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toLocaleDateString() : '-'}
                                    </div>
                                </div>
                            </div>
                            {insCheck.status !== 'ok' && (
                                <AlertTriangle size={18} className="text-red-500" />
                            )}
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${revCheck.status === 'ok' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                                    <Wrench size={18} />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase">Revisione</div>
                                    <div className="font-bold text-slate-700 dark:text-white text-sm">
                                        {vehicle.revisionExpiry ? new Date(vehicle.revisionExpiry).toLocaleDateString() : '-'}
                                    </div>
                                </div>
                            </div>
                            {revCheck.status !== 'ok' && (
                                <AlertTriangle size={18} className="text-red-500" />
                            )}
                        </div>
                    </div>

                    {/* Documents */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <FileText size={16} className="text-blue-500" />
                                Documenti Allegati
                            </h3>
                            <div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    onChange={handleFileChange} 
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                />
                                <button 
                                    disabled={isUploading}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400 p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold disabled:opacity-50"
                                >
                                    {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                    <span>Carica</span>
                                </button>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            {vehicle.documents && vehicle.documents.length > 0 ? (
                                vehicle.documents.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="bg-white dark:bg-slate-900 p-2 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
                                                <FileText size={16} className="text-slate-500" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate" title={doc.name}>
                                                    {doc.name}
                                                </p>
                                                <p className="text-[10px] text-slate-400">
                                                    {new Date(doc.uploadedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 ml-2 shrink-0">
                                            <a 
                                                href={doc.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                title="Scarica/Visualizza"
                                            >
                                                <Download size={16} />
                                            </a>
                                            <button 
                                                onClick={() => setDocToDelete(doc)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Elimina"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 border-dashed">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Nessun documento allegato</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    {vehicle.notes && (
                        <div className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl italic">
                            "{vehicle.notes}"
                        </div>
                    )}
                </div>
            </div>
            
            <DeleteConfirmationModal
                isOpen={!!docToDelete}
                onClose={() => !isDeleting && setDocToDelete(null)}
                onConfirm={confirmDelete}
                title="Elimina Documento"
                message={`Sei sicuro di voler eliminare il documento "${docToDelete?.name}"? Questa azione non può essere annullata.`}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default VehicleDetailsModal;
