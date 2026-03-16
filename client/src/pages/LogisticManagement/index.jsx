import React, { useMemo } from 'react';
import { Truck, Box, Plus, Search, Filter, X, SlidersHorizontal, Shirt, Download, Upload } from 'lucide-react';
import { exportToCsv } from '../../utils/exportToCsv';
import { useLogisticManagement } from './LogisticManagementLogic';

// Components
import VehiclesTab from './components/VehiclesTab';
import VehicleModal from './components/VehicleModal';
import VehicleDetailsModal from './components/VehicleDetailsModal';
import EquipmentTab from './components/EquipmentTab';
import EquipmentModal from './components/EquipmentModal';
import EquipmentDetailsModal from './components/EquipmentDetailsModal';
import UniformsTab from './components/UniformsTab';
import UniformModal from './components/UniformModal';
import UniformDetailsModal from './components/UniformDetailsModal';
import DeleteConfirmationModal from '../../components/ui/DeleteConfirmationModal';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import CustomSelect from '../../components/ui/CustomSelect';

// Constants for filters
const VEHICLE_STATUSES = [
    { value: 'Operativo', label: 'Operativo', color: 'bg-emerald-500' },
    { value: 'Manutenzione', label: 'Manutenzione', color: 'bg-amber-500' },
    { value: 'Guasto', label: 'Guasto', color: 'bg-red-500' }
];

const EQUIPMENT_STATUSES = [
    { value: 'Funzionante', label: 'Funzionante', color: 'bg-emerald-500' },
    { value: 'Da Revisionare', label: 'Da Revisionare', color: 'bg-amber-500' },
    { value: 'Rotto', label: 'Rotto', color: 'bg-red-500' }
];
const EQUIPMENT_CATEGORIES = ['Elettrico', 'Idraulico', 'Sanitario', 'DPI', 'Radio', 'Logistica', 'Altro'];

const UNIFORM_STATUSES = [
    { value: 'Nuova', label: 'Nuova', color: 'bg-emerald-500' },
    { value: 'Buona', label: 'Buona', color: 'bg-blue-500' },
    { value: 'Usurata', label: 'Usurata', color: 'bg-amber-500' },
    { value: 'Da Sostituire', label: 'Da Sostituire', color: 'bg-red-500' }
];

const UNIFORM_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Unica'];
const UNIFORM_SEASONS = ['Estiva', 'Invernale', '4 Stagioni'];

const LogisticManagement = ({ userProfile, showToast }) => {
    const {
        activeTab,
        setActiveTab,
        vehicles,
        equipment,
        uniforms,
        loading,
        searchTerm,
        setSearchTerm,
        filterStatus,
        setFilterStatus,
        filterCategory,
        setFilterCategory,
        isVehicleModalOpen,
        setIsVehicleModalOpen,
        isEquipmentModalOpen,
        setIsEquipmentModalOpen,
        isUniformModalOpen,
        setIsUniformModalOpen,
        editingItem,
        setEditingItem,
        viewingItem,
        setViewingItem,
        handleSaveVehicle,
        handleDeleteVehicle,
        handleSaveEquipment,
        handleDeleteEquipment,
        handleSaveUniform,
        handleDeleteUniform,
        handleUploadVehicleDocument,
        handleDeleteVehicleDocument,
        filterLocation,
        setFilterLocation,
        isFiltersOpen,
        toggleFilters,
        isImportingCSV,
        handleImportCSV
    } = useLogisticManagement(userProfile, showToast);

    // Modal Delete State
    const [deleteModal, setDeleteModal] = React.useState({
        isOpen: false,
        type: null, // 'vehicle' | 'equipment'
        id: null
    });
    const [isDeleting, setIsDeleting] = React.useState(false);

    const openDeleteModal = (type, id) => {
        setDeleteModal({ isOpen: true, type, id });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.id || !deleteModal.type) return;

        setIsDeleting(true);
        try {
            if (deleteModal.type === 'vehicle') {
                await handleDeleteVehicle(deleteModal.id);
            } else if (deleteModal.type === 'equipment') {
                await handleDeleteEquipment(deleteModal.id);
            } else if (deleteModal.type === 'uniform') {
                await handleDeleteUniform(deleteModal.id);
            }
            setDeleteModal({ isOpen: false, type: null, id: null });
        } catch (error) {
            console.error("Error deleting:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    // Filter Logic Implementation in View (or could be moved to logic hook, but view is fine for display logic)
    const displayedVehicles = useMemo(() => {
        return vehicles.filter(v => {
            const matchesSearch = (v.model?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (v.plate?.toLowerCase() || '').includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'all' || v.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [vehicles, searchTerm, filterStatus]);

    const displayedEquipment = useMemo(() => {
        return equipment.filter(e => {
            const matchesSearch = (e.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (e.location?.toLowerCase() || '').includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'all' || e.status === filterStatus;
            const matchesCategory = filterCategory === 'all' || e.category === filterCategory;

            let matchesLocation = true;
            if (filterLocation !== 'all') {
                if (filterLocation === 'Mezzo') {
                    matchesLocation = e.location && e.location.startsWith('Mezzo:');
                } else {
                    matchesLocation = (e.location || '') === filterLocation || (e.location || '').startsWith(filterLocation);
                }
            }

            return matchesSearch && matchesStatus && matchesCategory && matchesLocation;
        });
    }, [equipment, searchTerm, filterStatus, filterCategory, filterLocation]);

    const displayedUniforms = useMemo(() => {
        return uniforms.filter(u => {
            const matchesSearch = (u.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (u.assignedTo?.toLowerCase() || '').includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'all' || u.status === filterStatus;
            const matchesSize = filterCategory === 'all' || u.size === filterCategory;
            const matchesSeason = filterLocation === 'all' || u.season === filterLocation;

            return matchesSearch && matchesStatus && matchesSize && matchesSeason;
        });
    }, [uniforms, searchTerm, filterStatus, filterCategory, filterLocation]);


    const handleDownloadCSV = () => {
        const timestamp = new Date().toISOString().split('T')[0];
        if (activeTab === 'vehicles') {
            const dataToExport = displayedVehicles.map(v => ({
                Modello: v.model,
                Targa: v.plate,
                Stato: v.status,
                Patente: v.requiredLicense,
                Posti: v.seats,
                Radio: v.radio,
                Note: v.notes
            }));
            exportToCsv(`Mezzi_${timestamp}.csv`, dataToExport);
        } else if (activeTab === 'equipment') {
            const dataToExport = displayedEquipment.map(e => ({
                Nome: e.name,
                Categoria: e.category,
                Sede: e.location,
                Stato: e.status,
                Quantità: e.quantity,
                Scadenza: e.expiryDate || 'N/D',
                Note: e.notes
            }));
            exportToCsv(`Attrezzature_${timestamp}.csv`, dataToExport);
        } else if (activeTab === 'uniforms') {
            const dataToExport = displayedUniforms.map(u => ({
                Nome: u.name,
                Taglia: u.size,
                Stagione: u.season,
                Stato: u.status,
                Quantità: u.quantity,
                Note: u.notes
            }));
            exportToCsv(`Divise_${timestamp}.csv`, dataToExport);
        }

        if (showToast) {
            showToast(
                `Il file CSV è stato generato ed è in fase di download.`,
                'Download Avviato',
                'success'
            );
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 text-blue-600 gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="pb-32 relative">
            {/* CSV Import Loading Overlay */}
            {isImportingCSV && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[9999] animate-in fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 max-w-sm mx-4">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Importazione in corso...</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center">Caricamento e aggiornamento dei dati dal file CSV.</p>
                    </div>
                </div>
            )}
            {/* Increased padding-bottom for mobile nav overlap */}

            {/* Header & Dashboard */}
            <div className="mb-8 pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-6 w-full md:w-auto">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-3">
                                <Truck className="text-blue-600" size={32} />
                                Logistica & Mezzi
                            </h1>
                            <span className="md:hidden bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold px-3 py-1 rounded-lg">
                                {vehicles.length + equipment.length + uniforms.length} Asset
                            </span>
                        </div>
                    </div>

                    {/* Tabs moved here */}
                    <div className="flex flex-wrap p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
                        <button
                            onClick={() => { setActiveTab('equipment'); setFilterStatus('all'); setFilterCategory('all'); setFilterLocation('all'); }}
                            className={`px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 min-w-[120px] md:min-w-[150px] flex-1 ${activeTab === 'equipment'
                                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            <Box size={16} /> Magazzino
                        </button>
                        <button
                            onClick={() => { setActiveTab('vehicles'); setFilterStatus('all'); setFilterCategory('all'); setFilterLocation('all'); }}
                            className={`px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 min-w-[120px] md:min-w-[150px] flex-1 ${activeTab === 'vehicles'
                                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            <Truck size={16} /> Mezzi
                        </button>
                        <button
                            onClick={() => { setActiveTab('uniforms'); setFilterStatus('all'); setFilterCategory('all'); setFilterLocation('all'); }}
                            className={`px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 min-w-[120px] md:min-w-[150px] flex-1 ${activeTab === 'uniforms'
                                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            <Shirt size={16} /> Divise
                        </button>
                    </div>
                </div>
            </div>



            {/* Search & Main Actions */}
            <div className="flex flex-col gap-4 mb-6">
                {/* Action Row - Desktop */}
                <div className="hidden lg:flex justify-start items-center gap-3 mb-4">
                    {/* Add Button */}
                    <Button
                        className="flex items-center gap-2 bg-blue-600 dark:bg-[#facc15] hover:bg-blue-700 text-white dark:!text-[#0f172a] px-4 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 whitespace-nowrap text-sm font-bold"
                        onClick={() => {
                            setEditingItem(null);
                            if (activeTab === 'vehicles') {
                                setIsVehicleModalOpen(true);
                            } else if (activeTab === 'equipment') {
                                setIsEquipmentModalOpen(true);
                            } else if (activeTab === 'uniforms') {
                                setIsUniformModalOpen(true);
                            }
                        }}
                    >
                        <Plus size={20} />
                        {activeTab === 'vehicles' ? 'Nuovo Mezzo' : activeTab === 'equipment' ? 'Nuova Attrezzatura' : 'Nuova Divisa'}
                    </Button>

                    {/* CSV Actions */}
                    <div className="flex gap-2">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleImportCSV}
                            style={{ display: 'none' }}
                            id="csv-upload-desktop"
                        />
                        <label
                            htmlFor="csv-upload-desktop"
                            className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer active:scale-95 whitespace-nowrap"
                            title="Importa da CSV"
                        >
                            <Upload size={20} />
                            <span>Importa</span>
                        </label>

                        <button
                            className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-blue-600 font-bold dark:text-blue-400 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 whitespace-nowrap"
                            onClick={handleDownloadCSV}
                        >
                            <Download size={20} />
                            <span>Esporta CSV</span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-row gap-3">
                    <div className="relative flex-grow">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder={activeTab === 'vehicles' ? "Cerca targa, modello, radio..." : activeTab === 'uniforms' ? "Cerca divisa o volontario..." : "Cerca attrezzatura"}
                            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Mobile Download Button */}
                    <div className="lg:hidden flex border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleImportCSV}
                            style={{ display: 'none' }}
                            id="csv-upload-mobile"
                        />
                        <label
                            htmlFor="csv-upload-mobile"
                            className="p-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center justify-center"
                            title="Importa CSV"
                        >
                            <Upload size={20} />
                        </label>
                        <button
                            onClick={handleDownloadCSV}
                            className="p-3 bg-white dark:bg-slate-800 text-blue-600 border-r border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors"
                            title="Esporta CSV"
                        >
                            <Download size={20} />
                        </button>
                        {/* Mobile Filter Toggle */}
                        <button
                            onClick={toggleFilters}
                            className={`p-3 transition-all ${isFiltersOpen
                                ? 'bg-slate-800 text-white shadow-md'
                                : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                        >
                            <SlidersHorizontal size={20} />
                        </button>
                    </div>

                    <div className="relative lg:hidden">
                        {/* Mobile Filters Dropdown */}
                        {isFiltersOpen && (
                            <div className="absolute top-full right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-20 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="font-bold text-slate-700 dark:text-slate-200">Filtri</span>
                                    <button
                                        onClick={() => {
                                            setFilterStatus('all');
                                            setFilterCategory('all');
                                            setFilterLocation('all');
                                        }}
                                        className="text-xs font-bold text-red-500 hover:text-red-600"
                                    >
                                        Resetta
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <CustomSelect
                                        value={filterStatus}
                                        onChange={setFilterStatus}
                                        options={[
                                            { value: 'all', label: 'Tutti gli stati' },
                                            ...(activeTab === 'vehicles' ? VEHICLE_STATUSES : activeTab === 'uniforms' ? UNIFORM_STATUSES : EQUIPMENT_STATUSES)
                                        ]}
                                        placeholder="Stato"
                                    />

                                    {activeTab === 'equipment' && (
                                        <>
                                            <CustomSelect
                                                value={filterCategory}
                                                onChange={setFilterCategory}
                                                options={[
                                                    { value: 'all', label: 'Tutte le categorie' },
                                                    ...EQUIPMENT_CATEGORIES.map(c => ({ value: c, label: c }))
                                                ]}
                                                placeholder="Categoria"
                                            />
                                            <CustomSelect
                                                value={filterLocation}
                                                onChange={setFilterLocation}
                                                options={[
                                                    { value: 'all', label: 'Tutte le sedi' },
                                                    { value: 'Sede', label: 'Sede' },
                                                    { value: 'Cementeria (Magazzino)', label: 'Cementeria' },
                                                    { value: 'Mezzo', label: 'Su Mezzo' },
                                                ]}
                                            />
                                        </>
                                    )}

                                    {activeTab === 'uniforms' && (
                                        <>
                                            <CustomSelect
                                                value={filterCategory}
                                                onChange={setFilterCategory}
                                                options={[
                                                    { value: 'all', label: 'Tutte le taglie' },
                                                    ...UNIFORM_SIZES.map(s => ({ value: s, label: s }))
                                                ]}
                                                placeholder="Taglia"
                                            />
                                            <CustomSelect
                                                value={filterLocation}
                                                onChange={setFilterLocation}
                                                options={[
                                                    { value: 'all', label: 'Tutte le stagioni' },
                                                    ...UNIFORM_SEASONS.map(s => ({ value: s, label: s }))
                                                ]}
                                                placeholder="Stagione"
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Desktop Filters & Actions */}
                    <div className="hidden lg:flex gap-4 items-center">

                        {/* Filters directly in line */}
                        <div className="w-48">
                            <CustomSelect
                                value={filterStatus}
                                onChange={setFilterStatus}
                                options={[
                                    { value: 'all', label: 'Tutti gli stati' },
                                    ...(activeTab === 'vehicles' ? VEHICLE_STATUSES : activeTab === 'uniforms' ? UNIFORM_STATUSES : EQUIPMENT_STATUSES)
                                ]}
                                placeholder="Stato"
                            />
                        </div>

                        {/* Equipment Filters */}
                        {activeTab === 'equipment' && (
                            <>
                                <div className="w-48">
                                    <CustomSelect
                                        value={filterCategory}
                                        onChange={setFilterCategory}
                                        options={[
                                            { value: 'all', label: 'Tutte le categorie' },
                                            ...EQUIPMENT_CATEGORIES.map(c => ({ value: c, label: c }))
                                        ]}
                                        placeholder="Categoria"
                                    />
                                </div>
                                <div className="w-48">
                                    <CustomSelect
                                        value={filterLocation}
                                        onChange={setFilterLocation}
                                        options={[
                                            { value: 'all', label: 'Tutte le sedi' },
                                            { value: 'Sede', label: 'Sede' },
                                            { value: 'Cementeria (Magazzino)', label: 'Cementeria' },
                                            { value: 'Mezzo', label: 'Su Mezzo' },
                                        ]}
                                    />
                                </div>
                            </>
                        )}
                        {/* Uniform Filters */}
                        {activeTab === 'uniforms' && (
                            <>
                                <div className="w-48">
                                    <CustomSelect
                                        value={filterCategory}
                                        onChange={setFilterCategory}
                                        options={[
                                            { value: 'all', label: 'Tutte le taglie' },
                                            ...UNIFORM_SIZES.map(s => ({ value: s, label: s }))
                                        ]}
                                        placeholder="Taglia"
                                    />
                                </div>
                                <div className="w-48">
                                    <CustomSelect
                                        value={filterLocation}
                                        onChange={setFilterLocation}
                                        options={[
                                            { value: 'all', label: 'Tutte le stagioni' },
                                            ...UNIFORM_SEASONS.map(s => ({ value: s, label: s }))
                                        ]}
                                        placeholder="Stagione"
                                    />
                                </div>
                            </>
                        )}

                        {/* Clear Filters Button */}
                        {(filterStatus !== 'all' || filterCategory !== 'all' || filterLocation !== 'all' || searchTerm) && (
                            <button
                                onClick={() => { setFilterStatus('all'); setFilterCategory('all'); setFilterLocation('all'); setSearchTerm(''); }}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Resetta Filtri"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </div>



            </div>



            {/* Content Area */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 min-h-[400px]">
                {activeTab === 'vehicles' ? (
                    <VehiclesTab
                        vehicles={displayedVehicles}
                        searchTerm={searchTerm}
                        onEdit={(item) => { setEditingItem(item); setIsVehicleModalOpen(true); }}
                        onView={(item) => { setViewingItem(item); }}
                        onDelete={(id) => openDeleteModal('vehicle', id)}
                    />
                ) : activeTab === 'equipment' ? (
                    <EquipmentTab
                        equipment={displayedEquipment}
                        searchTerm={searchTerm}
                        onEdit={(item) => { setEditingItem(item); setIsEquipmentModalOpen(true); }}
                        onView={(item) => { setViewingItem(item); }}
                        onDelete={(id) => openDeleteModal('equipment', id)}
                    />
                ) : (
                    <UniformsTab
                        uniforms={displayedUniforms}
                        searchTerm={searchTerm}
                        onEdit={(item) => { setEditingItem(item); setIsUniformModalOpen(true); }}
                        onView={(item) => { setViewingItem(item); }}
                        onDelete={(id) => openDeleteModal('uniform', id)}
                    />
                )}
            </div>



            {/* Mobile Floating Action Button */}
            <button
                onClick={() => {
                    setEditingItem(null);
                    if (activeTab === 'vehicles') setIsVehicleModalOpen(true);
                    else if (activeTab === 'equipment') setIsEquipmentModalOpen(true);
                    else setIsUniformModalOpen(true);
                }}
                className="fixed right-6 bottom-24 lg:hidden w-14 h-14 bg-blue-600 dark:bg-[#facc15] text-white dark:!text-[#0f172a] rounded-full shadow-lg flex items-center justify-center z-40 transition-transform active:scale-95"
            >
                <Plus size={28} />
            </button>

            {/* Modals */}
            <VehicleModal
                isOpen={isVehicleModalOpen}
                onClose={() => setIsVehicleModalOpen(false)}
                onSave={handleSaveVehicle}
                initialData={editingItem}
            />

            <VehicleDetailsModal
                isOpen={!!viewingItem && activeTab === 'vehicles'}
                onClose={() => setViewingItem(null)}
                vehicle={viewingItem}
                onUploadDocument={handleUploadVehicleDocument}
                onDeleteDocument={handleDeleteVehicleDocument}
            />

            <EquipmentModal
                isOpen={isEquipmentModalOpen}
                onClose={() => setIsEquipmentModalOpen(false)}
                onSave={handleSaveEquipment}
                initialData={editingItem}
                vehicles={vehicles}
            />

            <EquipmentDetailsModal
                isOpen={!!viewingItem && activeTab === 'equipment'}
                onClose={() => setViewingItem(null)}
                equipment={viewingItem}
            />

            <UniformModal
                isOpen={isUniformModalOpen}
                onClose={() => setIsUniformModalOpen(false)}
                onSave={handleSaveUniform}
                initialData={editingItem}
            />

            <UniformDetailsModal
                isOpen={!!viewingItem && activeTab === 'uniforms'}
                onClose={() => setViewingItem(null)}
                uniform={viewingItem}
            />

            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
                title={deleteModal.type === 'vehicle' ? "Elimina Mezzo" : deleteModal.type === 'equipment' ? "Elimina Attrezzatura" : "Elimina Divisa"}
                message={deleteModal.type === 'vehicle'
                    ? "Sei sicuro di voler eliminare questo mezzo? L'actionè è irreversibile."
                    : deleteModal.type === 'equipment'
                    ? "Sei sicuro di voler eliminare questa attrezzatura? L'azione è irreversibile."
                    : "Sei sicuro di voler eliminare questa divisa? L'azione è irreversibile."}
            />
        </div >
    );
};

export default LogisticManagement;
