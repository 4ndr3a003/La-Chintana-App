import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { X, Save, Truck, Calendar, AlertTriangle, FileText, Radio, Gauge, Activity, Trash2 } from 'lucide-react';
import Button from '../../../components/ui/Button';
import CustomSelect from '../../../components/ui/CustomSelect';

// Constants for Selects
const STATUS_OPTIONS = [
    { value: 'Operativo', label: 'Operativo', color: 'bg-emerald-500' },
    { value: 'Manutenzione', label: 'Manutenzione / Limitato', color: 'bg-amber-500' },
    { value: 'Guasto', label: 'Fuori Servizio (Guasto)', color: 'bg-red-500' }
];

const VehicleModal = ({ isOpen, onClose, onSave, initialData }) => {
    const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
        defaultValues: {
            model: '',
            plate: '',
            radioId: '',
            km: '',
            insuranceExpiry: '',
            revisionExpiry: '',
            status: 'Operativo',
            notes: '',
            equipment: []
        }
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset(initialData);
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
                    equipment: []
                });
            }
        }
    }, [isOpen, initialData, reset]);

    if (!isOpen) return null;

    const onSubmit = (data) => {
        console.log("Submitting vehicle data:", data);
        onSave(data);
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
