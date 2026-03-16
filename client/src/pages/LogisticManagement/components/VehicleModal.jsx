import React, { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { X, Save, Truck, Calendar, AlertTriangle, FileText, Radio, Gauge, Activity, Camera, Loader2, Trash2 } from 'lucide-react';
import Button from '../../../components/ui/Button';
import CustomSelect from '../../../components/ui/CustomSelect';

// Constants for Selects
const STATUS_OPTIONS = [
    { value: 'Operativo', label: 'Operativo', color: 'bg-emerald-500' },
    { value: 'Manutenzione', label: 'Manutenzione / Limitato', color: 'bg-amber-500' },
    { value: 'Guasto', label: 'Fuori Servizio (Guasto)', color: 'bg-red-500' }
];

const VehicleModal = ({ isOpen, onClose, onSave, initialData, onUploadPhoto }) => {
    const { register, handleSubmit, reset, control, formState: { errors }, setValue, watch } = useForm({
        defaultValues: {
            model: '',
            plate: '',
            radioId: '',
            km: '',
            insuranceExpiry: '',
            revisionExpiry: '',
            status: 'Operativo',
            notes: '',
            equipment: [],
            photoUrl: ''
        }
    });

    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [photoPreview, setPhotoPreview] = useState('');
    const photoInputRef = useRef(null);
    const currentPhotoUrl = watch('photoUrl');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset(initialData);
                setPhotoPreview(initialData.photoUrl || '');
            } else {
                reset({
                    model: '',
                    plate: '',
                    radioId: '',
                    km: '',
                    insuranceExpiry: '',
                    revisionExpiry: '',
                    status: 'Operativo',
                    notes: '',
                    equipment: [],
                    photoUrl: ''
                });
                setPhotoPreview('');
            }
        }
    }, [isOpen, initialData, reset]);

    if (!isOpen) return null;

    const handlePhotoSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show local preview immediately
        const localUrl = URL.createObjectURL(file);
        setPhotoPreview(localUrl);

        if (initialData?.id && onUploadPhoto) {
            try {
                setIsUploadingPhoto(true);
                const url = await onUploadPhoto('vehicles', initialData.id, file);
                if (url) {
                    setValue('photoUrl', url);
                    setPhotoPreview(url);
                }
            } catch (error) {
                console.error("Photo upload error", error);
            } finally {
                setIsUploadingPhoto(false);
            }
        } else {
            // For new items, store file reference for later upload
            setValue('_pendingPhotoFile', file);
            setValue('photoUrl', '__pending__');
        }
        if (photoInputRef.current) photoInputRef.current.value = '';
    };

    const removePhoto = () => {
        setPhotoPreview('');
        setValue('photoUrl', '');
        setValue('_pendingPhotoFile', null);
    };

    const onSubmit = (data) => {
        // Clean up internal fields
        const { _pendingPhotoFile, ...submitData } = data;
        submitData._pendingPhotoFile = _pendingPhotoFile;
        onSave(submitData);
    };

    return (
        <div className="modal-overlay animate-in fade-in edit-create-modal" onClick={onClose}>
            <div
                className="modal-content max-w-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="modal-header">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Truck size={24} className="text-slate-800" />
                        {initialData ? 'Modifica Mezzo' : 'Nuovo Mezzo'}
                    </h3>
                    <button onClick={onClose} className="modal-close-btn">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="modal-body">
                    <form id="vehicle-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                        {/* Photo Upload Area */}
                        <div className="flex flex-col items-center">
                            <input
                                type="file"
                                ref={photoInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handlePhotoSelect}
                            />
                            <div
                                className="relative w-full h-40 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 overflow-hidden cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors group"
                                onClick={() => !isUploadingPhoto && photoInputRef.current?.click()}
                            >
                                {photoPreview ? (
                                    <>
                                        <img src={photoPreview} alt="Foto mezzo" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                            <Camera size={28} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
                                        {isUploadingPhoto ? (
                                            <Loader2 size={32} className="animate-spin text-blue-500" />
                                        ) : (
                                            <>
                                                <Camera size={32} className="mb-2" />
                                                <span className="text-xs font-bold">Aggiungi foto</span>
                                            </>
                                        )}
                                    </div>
                                )}
                                {isUploadingPhoto && photoPreview && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <Loader2 size={32} className="animate-spin text-white" />
                                    </div>
                                )}
                            </div>
                            {photoPreview && !isUploadingPhoto && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); removePhoto(); }}
                                    className="mt-2 text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1"
                                >
                                    <Trash2 size={12} /> Rimuovi foto
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Model */}
                            <div className="col-span-1 md:col-span-2">
                                <label className="info-label">
                                    <Truck size={14} /> Modello Veicolo
                                </label>
                                <input
                                    type="text"
                                    {...register('model', { required: 'Il modello è obbligatorio' })}
                                    className="form-input"
                                />
                                {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model.message}</p>}
                            </div>

                            {/* Plate */}
                            <div>
                                <label className="info-label">
                                    <FileText size={14} /> Targa
                                </label>
                                <input
                                    type="text"
                                    {...register('plate', { required: 'La targa è obbligatoria' })}
                                    className="form-input uppercase font-mono"
                                    placeholder="AA 000 BB"
                                />
                                {errors.plate && <p className="text-red-500 text-xs mt-1">{errors.plate.message}</p>}
                            </div>

                            {/* Radio ID */}
                            <div>
                                <label className="info-label">
                                    <Radio size={14} /> ID EMERCOMNET
                                </label>
                                <input
                                    type="text"
                                    {...register('radioId')}
                                    className="form-input"
                                />
                            </div>

                            {/* KM */}
                            <div>
                                <label className="info-label">
                                    <Gauge size={14} /> Chilometri Attuali
                                </label>
                                <input
                                    type="number"
                                    {...register('km')}
                                    className="form-input"
                                    placeholder="0"
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label className="info-label">
                                    <Activity size={14} /> Stato Operativo
                                </label>
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomSelect
                                            value={field.value}
                                            onChange={field.onChange}
                                            options={STATUS_OPTIONS}
                                            placeholder="Seleziona stato..."
                                        />
                                    )}
                                />
                            </div>

                            {/* Insurance Expiry */}
                            <div>
                                <label className="info-label">
                                    <Calendar size={14} /> Scadenza Assicurazione
                                </label>
                                <input
                                    type="date"
                                    {...register('insuranceExpiry')}
                                    className="form-input"
                                />
                            </div>

                            {/* Revision Expiry */}
                            <div>
                                <label className="info-label">
                                    <Calendar size={14} /> Scadenza Revisione
                                </label>
                                <input
                                    type="date"
                                    {...register('revisionExpiry')}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="info-label">
                                <FileText size={14} /> Note / Dotazione Fissa
                            </label>
                            <textarea
                                {...register('notes')}
                                className="form-input min-h-[80px]"
                                placeholder="Eventuali note o elenco dotazione fissa..."
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
                            >
                                Annulla
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-[#003366] hover:bg-[#002244] text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2"
                            >
                                <Save size={18} />
                                {initialData ? 'Salva Modifiche' : 'Salva Mezzo'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VehicleModal;
