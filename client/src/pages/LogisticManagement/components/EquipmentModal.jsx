import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { X, Save, Box, Calendar, MapPin, Tag, Hash, Activity, FileText, Truck, Layers } from 'lucide-react';
import Button from '../../../components/ui/Button';
import CustomSelect from '../../../components/ui/CustomSelect';

// Constants
const STATUS_OPTIONS = [
    { value: 'Funzionante', label: 'Funzionante', color: 'bg-emerald-500' },
    { value: 'Da Revisionare', label: 'Da Revisionare', color: 'bg-amber-500' },
    { value: 'Rotto', label: 'Rotto', color: 'bg-red-500' }
];

const CATEGORY_OPTIONS = [
    'Elettrico',
    'Idraulico',
    'Sanitario',
    'DPI',
    'Radio',
    'Logistica',
    'Altro'
];

const EquipmentModal = ({ isOpen, onClose, onSave, initialData, vehicles }) => {
    const { register, handleSubmit, reset, control, formState: { errors }, watch } = useForm({
        defaultValues: {
            name: '',
            category: 'Altro',
            quantity: 1,
            locationType: 'Sede', // 'Sede' | 'Cementeria' | 'vehicle'
            locationDetail: '',
            status: 'Funzionante',
            expiryDate: '',
            notes: ''
        }
    });

    const locationType = watch('locationType');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Heuristic to determine location type from string
                // "Mezzo: ..." -> vehicle
                // "Cementeria ..." -> Cementeria
                // "Sede ..." -> Sede
                let type = 'Sede';
                let detail = initialData.location || '';

                if (initialData.location?.startsWith('Mezzo: ')) {
                    type = 'vehicle';
                    detail = initialData.location.replace('Mezzo: ', '');
                } else if (initialData.location?.startsWith('Cementeria')) {
                    type = 'Cementeria';
                    detail = initialData.location.replace('Cementeria - ', '').replace('Cementeria', '');
                } else if (initialData.location?.startsWith('Sede')) {
                    type = 'Sede';
                    detail = initialData.location.replace('Sede - ', '').replace('Sede', '');
                }

                reset({
                    ...initialData,
                    locationType: type,
                    locationDetail: detail
                });
            } else {
                reset({
                    name: '',
                    category: 'Altro',
                    quantity: 1,
                    locationType: 'Sede',
                    locationDetail: '',
                    status: 'Funzionante',
                    expiryDate: '',
                    notes: ''
                });
            }
        }
    }, [isOpen, initialData, reset]);

    if (!isOpen) return null;

    const onSubmit = (data) => {
        // Format location string
        let finalLocation = "";

        if (data.locationType === 'vehicle') {
            finalLocation = `Mezzo: ${data.locationDetail}`;
        } else {
            // Prefix with location type (Sede or Cementeria)
            const prefix = data.locationType === 'Sede' ? 'Sede' : 'Cementeria';
            finalLocation = data.locationDetail ? `${prefix} - ${data.locationDetail}` : prefix;
        }

        const finalData = {
            ...data,
            location: finalLocation
        };
        onSave(finalData);
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
                        <Box size={24} className="text-slate-800" />
                        {initialData ? 'Modifica Attrezzatura' : 'Nuova Attrezzatura'}
                    </h3>
                    <button onClick={onClose} className="modal-close-btn">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="modal-body">
                    <form id="equipment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Name */}
                            <div className="col-span-1 md:col-span-2">
                                <label className="info-label">
                                    <Tag size={14} /> Nome Attrezzatura
                                </label>
                                <input
                                    type="text"
                                    {...register('name', { required: 'Il nome è obbligatorio' })}
                                    className="form-input"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                            </div>

                            <div>
                                <label className="info-label">
                                    <Layers size={14} /> Categoria
                                </label>
                                <Controller
                                    name="category"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomSelect
                                            value={field.value}
                                            onChange={field.onChange}
                                            options={CATEGORY_OPTIONS}
                                            placeholder="Seleziona categoria..."
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

                            {/* Status */}
                            <div>
                                <label className="info-label">
                                    <Activity size={14} /> Stato
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

                            {/* Expiry (Optional) */}
                            <div>
                                <label className="info-label">
                                    <Calendar size={14} /> Scadenza (opzionale)
                                </label>
                                <input
                                    type="date"
                                    {...register('expiryDate')}
                                    className="form-input"
                                />
                            </div>

                            {/* Location */}
                            <div className="col-span-1 md:col-span-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                <label className="info-label mb-2"><MapPin size={14} /> Luogo</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                    <label className="cursor-pointer">
                                        <input type="radio" value="Sede" {...register('locationType')} className="peer sr-only" />
                                        <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 peer-checked:border-blue-500 peer-checked:text-blue-600 dark:peer-checked:text-blue-400 transition-all hover:border-blue-300">
                                            <MapPin size={20} className="mb-2" />
                                            <span className="text-xs font-bold">Sede</span>
                                        </div>
                                    </label>
                                    <label className="cursor-pointer">
                                        <input type="radio" value="Cementeria" {...register('locationType')} className="peer sr-only" />
                                        <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 peer-checked:border-blue-500 peer-checked:text-blue-600 dark:peer-checked:text-blue-400 transition-all hover:border-blue-300">
                                            <Box size={20} className="mb-2" />
                                            <span className="text-xs font-bold">Cementeria</span>
                                        </div>
                                    </label>
                                    <label className="cursor-pointer">
                                        <input type="radio" value="vehicle" {...register('locationType')} className="peer sr-only" />
                                        <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 peer-checked:border-blue-500 peer-checked:text-blue-600 dark:peer-checked:text-blue-400 transition-all hover:border-blue-300">
                                            <Truck size={20} className="mb-2" />
                                            <span className="text-xs font-bold">Su Mezzo</span>
                                        </div>
                                    </label>
                                </div>

                                {locationType === 'vehicle' ? (
                                    <div className="flex items-center gap-2">
                                        <Truck size={16} className="text-slate-400" />
                                        <div className="w-full">
                                            <Controller
                                                name="locationDetail"
                                                control={control}
                                                render={({ field }) => {
                                                    const vehicleOptions = vehicles && vehicles.length > 0
                                                        ? vehicles.map(v => ({ value: `${v.model} (${v.plate})`, label: `${v.model} - ${v.plate}` }))
                                                        : [{ value: 'Mezzo Generico', label: 'Mezzo Generico' }];

                                                    return (
                                                        <CustomSelect
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                            options={vehicleOptions}
                                                            placeholder="Seleziona un mezzo..."
                                                        />
                                                    );
                                                }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        {...register('locationDetail')}
                                        className="form-input"
                                        placeholder={locationType === 'Sede' ? "es. Scaffale 1, Armadio B..." : "es. Scaffale 1, Armadio B..."}
                                    />
                                )}
                            </div>

                            {/* Notes */}
                            <div className="col-span-1 md:col-span-2">
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
                                {initialData ? 'Salva Modifiche' : 'Salva Attrezzatura'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EquipmentModal;
