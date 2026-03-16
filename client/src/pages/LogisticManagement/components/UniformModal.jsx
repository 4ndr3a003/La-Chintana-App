import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { X, Save, Shirt, Hash, FileText, User } from 'lucide-react';
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

const UniformModal = ({ isOpen, onClose, onSave, initialData }) => {
    const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            size: 'M',
            season: '4 Stagioni',
            status: 'Nuova',
            quantity: 1,
            notes: ''
        }
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({ ...initialData });
            } else {
                reset({
                    name: '',
                    size: 'M',
                    season: '4 Stagioni',
                    status: 'Nuova',
                    quantity: 1,
                    notes: ''
                });
            }
        }
    }, [isOpen, initialData, reset]);

    if (!isOpen) return null;

    const onSubmit = (data) => {
        onSave(data);
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
