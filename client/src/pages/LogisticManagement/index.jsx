import React, { useMemo } from 'react';
import { Truck, Box, Plus, Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { useLogisticManagement } from './LogisticManagementLogic';

// Components
import VehiclesTab from './components/VehiclesTab';
import VehicleModal from './components/VehicleModal';
import VehicleDetailsModal from './components/VehicleDetailsModal';
import EquipmentTab from './components/EquipmentTab';
import EquipmentModal from './components/EquipmentModal';
import EquipmentDetailsModal from './components/EquipmentDetailsModal';

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

const LogisticManagement = ({ userProfile }) => {
    const {
        activeTab,
        setActiveTab,
        vehicles,
        equipment,
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
        editingItem,
        setEditingItem,
        viewingItem,
        setViewingItem,
        handleSaveVehicle,
        handleDeleteVehicle,
        handleSaveEquipment,
        handleDeleteEquipment,
        kpiData,
        filterLocation,
        setFilterLocation,
        isFiltersOpen,
        toggleFilters
    } = useLogisticManagement(userProfile);

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


    if (loading) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 text-blue-600 gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="pb-32">
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
                                {vehicles.length + equipment.length} Asset
                            </span>
                        </div>
                    </div>

                    {/* Tabs moved here */}
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
                        <button
                            onClick={() => { setActiveTab('equipment'); setFilterStatus('all'); setFilterCategory('all'); }}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 min-w-[150px] flex-1 ${activeTab === 'equipment'
                                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            <Box size={16} /> Magazzino
                        </button>
                        <button
                            onClick={() => { setActiveTab('vehicles'); setFilterStatus('all'); setFilterCategory('all'); }}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 min-w-[150px] flex-1 ${activeTab === 'vehicles'
                                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            <Truck size={16} /> Parco Mezzi
                        </button>
                    </div>
                </div>
            </div>



            {/* Search & Main Actions */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-row gap-3">
                    <div className="relative flex-grow">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder={activeTab === 'vehicles' ? "Cerca targa, modello, radio..." : "Cerca attrezzatura, codice, ubicazione..."}
                            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Mobile Filter Toggle */}
                    <div className="relative lg:hidden">
                        <button
                            onClick={toggleFilters}
                            className={`p-3 rounded-2xl border transition-all ${isFiltersOpen
                                ? 'bg-slate-800 text-white border-slate-800 shadow-md'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                        >
                            <SlidersHorizontal size={20} />
                        </button>

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
                                            ...(activeTab === 'vehicles' ? VEHICLE_STATUSES : EQUIPMENT_STATUSES)
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
                                                    { value: 'Sede Operativa', label: 'Sede Operativa' },
                                                    { value: 'Cementeria (Magazzino)', label: 'Cementeria' },
                                                    { value: 'Mezzo', label: 'Su Mezzo' },
                                                ]}
                                                placeholder="Ubicazione"
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
                                    ...(activeTab === 'vehicles' ? VEHICLE_STATUSES : EQUIPMENT_STATUSES)
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
                                            { value: 'Sede Operativa', label: 'Sede Operativa' },
                                            { value: 'Cementeria (Magazzino)', label: 'Cementeria' },
                                            { value: 'Mezzo', label: 'Su Mezzo' },
                                        ]}
                                        placeholder="Ubicazione"
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

                        {/* Add Button */}
                        <Button
                            className="hidden md:flex items-center gap-2 bg-blue-600 dark:bg-[#facc15] hover:bg-blue-700 text-white dark:!text-[#0f172a] px-4 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 whitespace-nowrap"
                            onClick={() => {
                                setEditingItem(null);
                                if (activeTab === 'vehicles') {
                                    setIsVehicleModalOpen(true);
                                } else {
                                    setIsEquipmentModalOpen(true);
                                }
                            }}
                        >
                            <Plus size={20} className="mr-2" />
                            {activeTab === 'vehicles' ? 'Nuovo Mezzo' : 'Nuova Attrezzatura'}
                        </Button>
                    </div>
                </div>



            </div>



            {/* Content Area */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 min-h-[400px]">
                {activeTab === 'vehicles' ? (
                    <VehiclesTab
                        vehicles={displayedVehicles}
                        searchTerm={searchTerm}
                        // Note: searchTerm is used for highlighting in component, but we filter here. 
                        // It's benign to pass it even if filtered list is passed.
                        // Actually VehiclesTab does its own filtering currently: 
                        // `const filteredVehicles = vehicles.filter(...)`
                        // If I pass `displayedVehicles` as `vehicles` prop, it will filter again (redundant but safe) OR I should remove filtering from VehiclesTab.
                        // Let's UPDATE VehiclesTab to expect *already filtered* list or keep it simple.
                        // The `VehiclesTab` component currently does filtering. 
                        // If I pass `displayedVehicles` it will filter a second time using `searchTerm`. 
                        // It won't break anything, just slight perf hit. 
                        // Ideally `VehiclesTab` should just render what it gets.
                        // I'll keep it as is for now to avoid breaking changes, `displayedVehicles` already accounts for search so the second filter will just match 100%.
                        onEdit={(item) => { setEditingItem(item); setIsVehicleModalOpen(true); }}
                        onView={(item) => { setViewingItem(item); }}
                        onDelete={handleDeleteVehicle}
                    />
                ) : (
                    <EquipmentTab
                        equipment={displayedEquipment}
                        searchTerm={searchTerm}
                        onEdit={(item) => { setEditingItem(item); setIsEquipmentModalOpen(true); }}
                        onView={(item) => { setViewingItem(item); }}
                        onDelete={handleDeleteEquipment}
                    />
                )}
            </div>



            {/* Mobile Floating Action Button */}
            <button
                onClick={() => {
                    setEditingItem(null);
                    activeTab === 'vehicles' ? setIsVehicleModalOpen(true) : setIsEquipmentModalOpen(true);
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
        </div >
    );
};

export default LogisticManagement;
