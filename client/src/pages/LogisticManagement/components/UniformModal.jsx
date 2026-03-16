import React, { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { X, Save, Shirt, Hash, FileText, Camera, Loader2, Trash2 } from 'lucide-react';
import CustomSelect from '../../../components/ui/CustomSelect';

const UNIFORM_STATUSES = [
    { value: 'Nuova', label: 'Nuova' },
    { value: 'Buona', label: 'Buona' },
    { value: 'Usurata', label: 'Usurata' },
    { value: 'Da Sostituire', label: 'Da Sostituire' }
];

const UNIFORM_SIZES = [
    { value: 'XS', label: 'XS' },
    { value: 'S', label: 'S' },
    { value: 'M', label: 'M' },
    { value: 'L', label: 'L' },
    { value: 'XL', label: 'XL' },
    { value: 'XXL', label: 'XXL' },
    { value: '3XL', label: '3XL' },
    { value: 'Unica', label: 'Unica' }
];

const UNIFORM_SEASONS = [
    { value: 'Estiva', label: 'Estiva' },
    { value: 'Invernale', label: 'Invernale' },
    { value: '4 Stagioni', label: '4 Stagioni' }
];

const UniformModal = ({ isOpen, onClose, onSave, initialData, onUploadPhoto }) => {
    const { register, handleSubmit, reset, control, formState: { errors }, setValue, watch } = useForm({
        defaultValues: {
            name: '',
            size: 'M',
            season: '4 Stagioni',
            status: 'Nuova',
            quantity: 1,
            notes: '',
            photoUrl: ''
        }
    });

    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [photoPreview, setPhotoPreview] = useState('');
    const photoInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({ ...initialData });
                setPhotoPreview(initialData.photoUrl || '');
            } else {
                reset({
                    name: '',
                    size: 'M',
                    season: '4 Stagioni',
                    status: 'Nuova',
                    quantity: 1,
                    notes: '',
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

        const localUrl = URL.createObjectURL(file);
        setPhotoPreview(localUrl);

        if (initialData?.id && onUploadPhoto) {
            try {
                setIsUploadingPhoto(true);
                const url = await onUploadPhoto('uniforms', initialData.id, file);
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
        const { _pendingPhotoFile, ...submitData } = data;
        submitData._pendingPhotoFile = _pendingPhotoFile;
        onSave(submitData);
    };

    return (
        <div className="modal-overlay animate-in fade-in" onClick={onClose}>
            <div
                className="modal-content max-w-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="modal-header">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Shirt size={24} className="text-slate-800" />
                        {initialData ? 'Modifica Divisa' : 'Nuova Divisa'}
                    </h3>
                    <button onClick={onClose} className="modal-close-btn">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="modal-body">
                    <form id="uniform-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">

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
                                        <img src={photoPreview} alt="Foto divisa" className="w-full h-full object-cover" />
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

                        {/* Name */}
                        <div>
                            <label className="info-label">
                                <Shirt size={14} /> Tipo / Nome Divisa
                            </label>
                            <input
                                type="text"
                                {...register('name', { required: 'Il nome è obbligatorio' })}
                                className="form-input"
                                placeholder="es. Pantalone Operativo"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Size */}
                            <div>
                                <label className="info-label">
                                    <Shirt size={14} /> Taglia
                                </label>
                                <Controller
                                    name="size"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomSelect
                                            value={field.value}
                                            onChange={field.onChange}
                                            options={UNIFORM_SIZES}
                                            placeholder="Seleziona taglia..."
                                        />
                                    )}
                                />
                            </div>

                            {/* Season */}
                            <div>
                                <label className="info-label">
                                    <Shirt size={14} /> Stagione
                                </label>
                                <Controller
                                    name="season"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomSelect
                                            value={field.value}
                                            onChange={field.onChange}
                                            options={UNIFORM_SEASONS}
                                            placeholder="Seleziona stagione..."
                                        />
                                    )}
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label className="info-label">
                                    <Shirt size={14} /> Stato
                                </label>
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomSelect
                                            value={field.value}
                                            onChange={field.onChange}
                                            options={UNIFORM_STATUSES}
                                            placeholder="Seleziona stato..."
                                        />
                                    )}
                                />
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="info-label">
                                    <Hash size={14} /> Quantità
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    {...register('quantity')}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="info-label">
                                <FileText size={14} /> Note
                            </label>
                            <textarea
                                {...register('notes')}
                                rows={2}
                                className="form-input min-h-[60px] resize-none"
                                placeholder="Note aggiuntive..."
                            />
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 px-6 pb-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
                    >
                        Annulla
                    </button>
                    <button
                        form="uniform-form"
                        type="submit"
                        className="px-6 py-2 bg-[#003366] hover:bg-[#002244] text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2"
                    >
                        <Save size={18} />
                        {initialData ? 'Salva Modifiche' : 'Salva Divisa'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UniformModal;
