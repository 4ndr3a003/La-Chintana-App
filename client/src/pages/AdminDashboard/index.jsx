import React from 'react';
import { Users, Phone, Award, Edit2, PlusCircle, X, Shield, User, Trash2, AlertTriangle, Search, SlidersHorizontal, Download, Upload, CheckCircle, XCircle, Info } from 'lucide-react';
import { ROLES, ROLE_LABELS, BOARD_ROLES, SPECIALIZATIONS_DATA } from '../../utils/constants';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import CustomSelect from '../../components/ui/CustomSelect';
import { useAdminDashboard } from './AdminDashboardLogic';
import { IonModal, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton } from '@ionic/react';
import './AdminDashboard.css';

const AdminDashboard = ({ userProfile }) => {
  const {
    selectedUser,
    isEditing,
    isCreating,
    isViewing,
    formData,
    customSpec,
    setFormData,
    setCustomSpec,
    openEdit,
    openCreate,
    openView,
    handleSave,
    toggleSpec,
    addCustomSpec,
    closeAll,
    setIsViewing,
    isDeleteModalOpen,
    handleDeleteUser,
    confirmDeleteUser,
    cancelDeleteUser,
    selectedUserIds,
    toggleUserSelection,
    toggleAllUsers,
    handleDeleteSelected,
    confirmDeleteSelected,
    cancelDeleteSelected,
    isBulkDeleteModalOpen,
    searchTerm,
    setSearchTerm,
    filterRole,
    setFilterRole,
    filterStatus,
    setFilterStatus,
    filteredUsers,
    isFiltersOpen,
    toggleFilters,
    handleExportCSV,
    handleImportCSV,
    notification,
    closeNotification
  } = useAdminDashboard();

  const formatName = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length < 2) return fullName;
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');
    return `${lastName} ${firstName}`;
  };

  const statusOptions = [
    { value: 'Operativo', label: 'Operativo', color: 'bg-green-500' },
    { value: 'Non Operativo', label: 'Non Operativo', color: 'bg-red-500' }
  ];

  const roleOptions = Object.values(ROLES).map(r => ({
    value: r,
    label: ROLE_LABELS[r],
    color: r === ROLES.PRESIDENT ? 'bg-yellow-500' : r === ROLES.BOARD ? 'bg-purple-500' : 'bg-blue-500'
  }));

  const filterRoleOptions = [
    { value: 'Tutti', label: 'Tutti i Ruoli' },
    ...roleOptions
  ];

  const filterStatusOptions = [
    { value: 'Tutti', label: 'Tutti gli Stati' },
    ...statusOptions
  ];

  const boardRoleOptions = Object.values(BOARD_ROLES).map(r => ({
    value: r,
    label: r,
    color: 'bg-purple-500'
  }));

  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-header">
         <h3 className="dashboard-title">
            <Users className="text-blue-600" size={28} /> Gestione Volontari
         </h3>
         <span className="user-count-badge">{filteredUsers.length} Volontari</span>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex gap-3">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Cerca volontario..." 
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Mobile Filter Toggle Button */}
            <button
                onClick={toggleFilters}
                className={`lg:hidden flex items-center justify-center px-4 rounded-xl border transition-colors ${isFiltersOpen ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-700 border-slate-200'}`}
            >
                <SlidersHorizontal size={20} />
            </button>
            
            {/* Desktop Filters */}
            <div className="hidden lg:flex gap-4 items-center">
                {selectedUserIds.length > 0 && userProfile?.role === ROLES.PRESIDENT && (
                    <button
                        onClick={handleDeleteSelected}
                        className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-red-200 transition-colors shadow-sm shrink-0 animate-in fade-in"
                    >
                        <Trash2 size={18} />
                        Elimina ({selectedUserIds.length})
                    </button>
                )}
                <div className="w-48">
                    <CustomSelect 
                        options={filterRoleOptions}
                        value={filterRole}
                        onChange={setFilterRole}
                        placeholder="Filtra per Ruolo"
                    />
                </div>
                <div className="w-48">
                    <CustomSelect 
                        options={filterStatusOptions}
                        value={filterStatus}
                        onChange={setFilterStatus}
                        placeholder="Filtra per Stato"
                    />
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm shrink-0"
                >
                    <PlusCircle size={18} />
                    Nuovo Volontario
                </button>
            </div>
        </div>

        {/* Mobile Filters Content */}
        {isFiltersOpen && (
            <div className="lg:hidden flex flex-col gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2">
                <CustomSelect 
                    options={filterRoleOptions}
                    value={filterRole}
                    onChange={setFilterRole}
                    placeholder="Filtra per Ruolo"
                />
                <CustomSelect 
                    options={filterStatusOptions}
                    value={filterStatus}
                    onChange={setFilterStatus}
                    placeholder="Filtra per Stato"
                />
            </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200" style={{ backgroundColor: 'var(--color-pc-yellow)' }}>
                <th className="p-4 w-10">
                    <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        checked={filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.filter(u => u.role !== ROLES.PRESIDENT).length}
                        onChange={toggleAllUsers}
                    />
                </th>
                <th className="p-4 text-xs font-bold text-slate-800 uppercase tracking-wider">Volontario</th>
                <th className="p-4 text-xs font-bold text-slate-800 uppercase tracking-wider">Codice Emercomnet</th>
                <th className="p-4 text-xs font-bold text-slate-800 uppercase tracking-wider">Ruolo</th>
                <th className="p-4 text-xs font-bold text-slate-800 uppercase tracking-wider">Stato</th>
                <th className="p-4 text-xs font-bold text-slate-800 uppercase tracking-wider text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(user => (
                <tr 
                  key={user.id} 
                  onClick={() => openView(user)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <td className="p-4" onClick={e => e.stopPropagation()}>
                    {user.role !== ROLES.PRESIDENT && (
                        <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            checked={selectedUserIds.includes(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                        />
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={user.photoUrl} name={user.name} size="sm" />
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{formatName(user.name)}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                      {user.emercomnetId || '-'}
                    </span>
                  </td>
                  <td className="p-4">
                     <Badge 
                       text={ROLE_LABELS[user.role]} 
                       color={user.role === ROLES.PRESIDENT ? 'yellow' : user.role === ROLES.BOARD ? 'purple' : 'blue'} 
                     />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${user.status?.trim().toLowerCase() === 'non operativo' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                      <span className={`text-sm font-medium ${user.status?.trim().toLowerCase() === 'non operativo' ? 'text-red-700' : 'text-green-700'}`}>
                        {user.status || 'Operativo'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                      <button 
                          onClick={() => openEdit(user)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          title="Modifica Dati"
                      >
                          <Edit2 size={18} />
                      </button>
                      {userProfile?.role === ROLES.PRESIDENT && user.role !== ROLES.PRESIDENT && (
                          <button 
                              onClick={() => handleDeleteUser(user)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                              title="Elimina Volontario"
                          >
                              <Trash2 size={18} />
                          </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3 pb-20">
        {filteredUsers.map(user => (
            <div 
                key={user.id} 
                onClick={() => openView(user)} 
                className="bg-white rounded-xl border border-slate-200 shadow-sm active:scale-[0.99] transition-transform overflow-hidden"
            >
                <div className="flex items-start justify-between p-4 border-b border-slate-100 bg-amber-200">
                    <div className="flex items-center gap-3">
                        <Avatar src={user.photoUrl} name={user.name} size="md" />
                        <div>
                            <h4 className="font-bold text-slate-800">{formatName(user.name)}</h4>
                            <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                    </div>
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        <button 
                            onClick={() => openEdit(user)} 
                            className="p-2 text-slate-400 hover:text-blue-600 bg-white/60 rounded-full"
                        >
                            <Edit2 size={16} />
                        </button>
                        {userProfile?.role === ROLES.PRESIDENT && user.role !== ROLES.PRESIDENT && (
                            <button 
                                onClick={() => handleDeleteUser(user)} 
                                className="p-2 text-slate-400 hover:text-red-600 bg-white/60 rounded-full"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm p-4">
                    <div className="bg-slate-50 p-2.5 rounded-lg">
                        <span className="text-xs text-slate-400 block mb-1.5 font-medium uppercase tracking-wider">Ruolo</span>
                        <Badge 
                            text={ROLE_LABELS[user.role]} 
                            color={user.role === ROLES.PRESIDENT ? 'yellow' : user.role === ROLES.BOARD ? 'purple' : 'blue'} 
                            size="sm"
                        />
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg">
                        <span className="text-xs text-slate-400 block mb-1.5 font-medium uppercase tracking-wider">Stato</span>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${user.status?.trim().toLowerCase() === 'non operativo' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                            <span className={`font-bold text-xs ${user.status?.trim().toLowerCase() === 'non operativo' ? 'text-red-700' : 'text-green-700'}`}>
                                {user.status || 'Operativo'}
                            </span>
                        </div>
                    </div>
                    <div className="col-span-2 bg-slate-50 p-2.5 rounded-lg flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Codice Emercomnet</span>
                        <span className="font-mono text-slate-700 font-bold">{user.emercomnetId || '-'}</span>
                    </div>
                </div>
            </div>
        ))}
      </div>

      {/* Import/Export Actions */}
      <div className="flex justify-end gap-3 mt-6 mb-20 px-4 md:px-0">
        <input
          type="file"
          accept=".csv"
          onChange={handleImportCSV}
          style={{ display: 'none' }}
          id="csv-upload"
        />
        <label htmlFor="csv-upload">
            <div className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm cursor-pointer">
                <Upload size={18} />
                Importa CSV
            </div>
        </label>
        <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm"
        >
            <Download size={18} />
            Esporta CSV
        </button>
      </div>

      <button 
        onClick={openCreate}
        className="fab-button lg:hidden"
      >
        <PlusCircle size={28} />
      </button>

      {/* VIEW MODAL */}
      <IonModal
        isOpen={isViewing && !!selectedUser}
        onDidDismiss={() => setIsViewing(false)}
        breakpoints={[0, 0.92]}
        initialBreakpoint={0.92}
        className="custom-modal"
      >
        <IonHeader>
          <IonToolbar className="modal-toolbar">
            <IonTitle className="font-bold text-white">Scheda Volontario</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setIsViewing(false)} className="modal-close-btn">
                <X size={20} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding" scrollY={true}>
          <div className="modal-body-content">
             {selectedUser && (
                <>
                <div className="modal-profile-header">
                   <Avatar src={selectedUser.photoUrl} name={selectedUser.name} size="xl" className="mb-3 shadow-md" />
                   <h2 className="modal-profile-name">{selectedUser.name}</h2>
                   <Badge text={ROLE_LABELS[selectedUser.role]} color={selectedUser.role === ROLES.PRESIDENT ? 'yellow' : selectedUser.role === ROLES.BOARD ? 'purple' : 'blue'} className="mt-1" />
                   {selectedUser.boardRole && <Badge text={selectedUser.boardRole} color="purple" className="mt-1" />}
                </div>
                
                <div className="space-y-6">
                    <div className="info-grid">
                        <div className="info-card">
                            <p className="info-label">Email</p>
                            <p className="info-value break-all">{selectedUser.email}</p>
                        </div>
                        <div className="info-card">
                            <p className="info-label">Telefono</p>
                            <p className="info-value">{selectedUser.phone || '-'}</p>
                        </div>
                        <div className="info-card">
                            <p className="info-label">Codice Fiscale</p>
                            <p className="info-value uppercase">{selectedUser.cf || '-'}</p>
                        </div>
                        <div className="info-card">
                            <p className="info-label">Data di Nascita</p>
                            <p className="info-value">{selectedUser.birthDate ? new Date(selectedUser.birthDate).toLocaleDateString('it-IT') : '-'}</p>
                        </div>
                        <div className="info-card col-span-2">
                            <p className="info-label">Residenza</p>
                            <p className="info-value">{selectedUser.city || '-'}</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="specs-section-title">
                           <Shield size={14} /> Abilitazioni ({selectedUser.specializations?.length || 0})
                        </h4>
                        <div className="space-y-3">
                            {Object.entries(SPECIALIZATIONS_DATA).map(([category, data]) => {
                                const userSpecs = data.items.filter(i => selectedUser.specializations?.includes(i));
                                if (userSpecs.length === 0) return null;
                                return (
                                    <div key={category} className="spec-category-card">
                                        <h5 className={`spec-category-title ${data.color.split(' ')[1]}`}>
                                            {data.icon} {category}
                                        </h5>
                                        <div className="spec-tags-wrapper">
                                            {userSpecs.map(item => (
                                                <span key={item} className={`spec-tag ${data.color}`}>
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                            {selectedUser.specializations?.filter(s => !Object.values(SPECIALIZATIONS_DATA).flatMap(d => d.items).includes(s)).length > 0 && (
                                <div className="spec-category-card">
                                    <h5 className="text-[10px] font-bold uppercase mb-2 text-slate-400">Altro</h5>
                                    <div className="spec-tags-wrapper">
                                        {selectedUser.specializations.filter(s => !Object.values(SPECIALIZATIONS_DATA).flatMap(d => d.items).includes(s)).map(s => (
                                            <span key={s} className="custom-spec-tag">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {(!selectedUser.specializations || selectedUser.specializations.length === 0) && (
                                <span className="text-sm text-slate-400 italic">Nessuna abilitazione</span>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="modal-footer">
                    <Button onClick={() => { setIsViewing(false); openEdit(selectedUser); }} variant="outline" size="sm">
                        <Edit2 size={16} /> Modifica Dati
                    </Button>
                </div>
                </>
             )}
          </div>
        </IonContent>
      </IonModal>

      <IonModal
        isOpen={isEditing || isCreating}
        onDidDismiss={closeAll}
        breakpoints={[0, 0.92]}
        initialBreakpoint={0.92}
        className="custom-modal"
      >
        <IonHeader>
          <IonToolbar className="modal-toolbar">
            <IonTitle className="font-bold text-white">{isCreating ? 'Nuovo Volontario' : 'Modifica Profilo'}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={closeAll} className="modal-close-btn">
                <X size={20} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding" scrollY={true}>
          <div className="modal-body-content">
                <form onSubmit={handleSave} className="space-y-8">
                   
                   {/* DATI PERSONALI */}
                   <section>
                     <h4 className="form-section-title">
                       <User size={16} className="text-blue-500"/> Dati Personali
                     </h4>
                     <div className="form-grid">
                        <div>
                          <label className="info-label">Nome</label>
                          <input type="text" required className="form-input" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                        </div>
                        <div>
                          <label className="info-label">Cognome</label>
                          <input type="text" required className="form-input" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                        </div>
                        <div>
                          <label className="info-label">Data di Nascita</label>
                          <input type="date" className="form-input" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                        </div>
                        <div>
                          <label className="info-label">Luogo di Nascita</label>
                          <input type="text" className="form-input" value={formData.birthPlace} onChange={e => setFormData({...formData, birthPlace: e.target.value})} />
                        </div>
                        <div>
                          <label className="info-label">Codice Fiscale</label>
                          <input type="text" className="form-input uppercase" value={formData.cf} onChange={e => setFormData({...formData, cf: e.target.value})} />
                        </div>
                        <div>
                          <label className="info-label">Codice Identificativo Emercomnet</label>
                          <input type="text" className="form-input" value={formData.emercomnetId} onChange={e => setFormData({...formData, emercomnetId: e.target.value})} />
                        </div>
                        <div>
                          <label className="info-label">Città di Residenza</label>
                          <input type="text" className="form-input" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                        </div>
                        <div>
                          <label className="info-label">Telefono</label>
                          <input type="tel" className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                        <div>
                          <label className="info-label">Email</label>
                          <input type="email" required className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                        {(isCreating || (isEditing && userProfile?.role === ROLES.PRESIDENT)) && (
                          <div className="md:col-span-2">
                            <label className="info-label">
                                {isCreating ? 'Password Iniziale' : 'Nuova Password (lascia vuoto per mantenere la corrente)'}
                            </label>
                            <input 
                                type="text" 
                                required={isCreating} 
                                className="form-input" 
                                value={formData.password || ''} 
                                onChange={e => setFormData({...formData, password: e.target.value})} 
                                placeholder={isEditing ? "Inserisci nuova password..." : ""}
                            />
                          </div>
                        )}
                     </div>
                   </section>

                   {/* RUOLO & ABILITAZIONI */}
                   <section>
                     <h4 className="form-section-title">
                       <Shield size={16} className="text-purple-500"/> Ruolo & Abilitazioni
                     </h4>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                       <div>
                          <label className="info-label">Stato Operativo</label>
                          <CustomSelect 
                            value={formData.status}
                            onChange={val => setFormData({...formData, status: val})}
                            options={statusOptions}
                          />
                       </div>
                       <div>
                          <label className="info-label">Ruolo Organizzativo</label>
                          <CustomSelect 
                            value={formData.role}
                            onChange={val => setFormData({...formData, role: val})}
                            options={roleOptions}
                          />
                       </div>
                       {formData.role === ROLES.BOARD && (
                         <div>
                            <label className="info-label">Incarico Direttivo</label>
                            <CustomSelect 
                              value={formData.boardRole || ''}
                              onChange={val => setFormData({...formData, boardRole: val})}
                              options={boardRoleOptions}
                              placeholder="Seleziona..."
                            />
                         </div>
                       )}
                     </div>

                     <div className="space-y-4">
                        {Object.entries(SPECIALIZATIONS_DATA).map(([category, data]) => (
                          <div key={category} className={`p-4 rounded-xl border ${data.color}`}>
                            <h5 className="font-bold text-xs uppercase mb-3 flex items-center gap-2 opacity-90">
                              {data.icon} {category}
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {data.items.map(item => (
                                <label key={item} className="spec-checkbox-label hover:bg-white/60">
                                  <input 
                                    type="checkbox" 
                                    checked={formData.specializations?.includes(item)}
                                    onChange={() => toggleSpec(item)}
                                    className="spec-checkbox-input"
                                  />
                                  <span className="spec-checkbox-text">{item}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                        
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                           <h5 className="font-bold text-slate-700 text-xs uppercase mb-3">Altre Abilitazioni</h5>
                           <div className="flex gap-2">
                             <input 
                               type="text" 
                               placeholder="Aggiungi..." 
                               className="custom-spec-input"
                               value={customSpec}
                               onChange={e => setCustomSpec(e.target.value)}
                             />
                             <button type="button" onClick={addCustomSpec} className="custom-spec-add-btn">
                               +
                             </button>
                           </div>
                           <div className="flex flex-wrap gap-2 mt-3">
                             {formData.specializations?.filter(s => !Object.values(SPECIALIZATIONS_DATA).flatMap(d => d.items).includes(s)).map(s => (
                               <span key={s} className="custom-spec-tag-edit">
                                 {s}
                                 <button type="button" onClick={() => toggleSpec(s)} className="custom-spec-remove-btn"><X size={12}/></button>
                               </span>
                             ))}
                           </div>
                        </div>
                     </div>
                   </section>

                   <div className="form-footer">
                      <Button type="button" variant="ghost" onClick={closeAll}>Annulla</Button>
                      <Button type="submit">Salva Modifiche</Button>
                   </div>
                </form>
          </div>
        </IonContent>
      </IonModal>

      {/* Delete Confirmation Modal */}
      <IonModal
        isOpen={isDeleteModalOpen}
        onDidDismiss={cancelDeleteUser}
        breakpoints={[0, 0.4]}
        initialBreakpoint={0.4}
        className="custom-modal"
      >
        <IonContent className="ion-padding" scrollY={true}>
          <div className="flex flex-col items-center text-center h-full justify-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="text-amber-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Elimina Volontario</h3>
              <p className="text-sm text-slate-500 mb-6">
                Sei sicuro di voler eliminare questo volontario? Questa azione non può essere annullata.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={cancelDeleteUser}
                  className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Annulla
                </button>
                <button 
                  onClick={confirmDeleteUser}
                  className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Elimina
                </button>
              </div>
            </div>
        </IonContent>
      </IonModal>

      {/* Bulk Delete Confirmation Modal */}
      <IonModal
        isOpen={isBulkDeleteModalOpen}
        onDidDismiss={cancelDeleteSelected}
        breakpoints={[0, 0.4]}
        initialBreakpoint={0.4}
        className="custom-modal"
      >
        <IonContent className="ion-padding" scrollY={true}>
          <div className="flex flex-col items-center text-center h-full justify-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="text-amber-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Elimina {selectedUserIds.length} Volontari</h3>
              <p className="text-sm text-slate-500 mb-6">
                Sei sicuro di voler eliminare i volontari selezionati? Questa azione non può essere annullata.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={cancelDeleteSelected}
                  className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Annulla
                </button>
                <button 
                  onClick={confirmDeleteSelected}
                  className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Elimina Tutto
                </button>
              </div>
            </div>
        </IonContent>
      </IonModal>

      {/* Notification Modal */}
      <IonModal
        isOpen={notification.isOpen}
        onDidDismiss={closeNotification}
        breakpoints={[0, 0.5]}
        initialBreakpoint={0.5}
        className="custom-modal"
      >
        <IonContent className="ion-padding" scrollY={true}>
          <div className="flex flex-col items-center text-center h-full justify-center relative">
            <button 
                onClick={closeNotification}
                className="absolute top-0 right-0 text-slate-400 hover:text-slate-600 transition-colors"
            >
                <X size={20} />
            </button>
            <div className="flex flex-col items-center text-center w-full">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  notification.type === 'success' ? 'bg-green-100 text-green-600' :
                  notification.type === 'error' ? 'bg-red-100 text-red-600' :
                  notification.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                  'bg-blue-100 text-blue-600'
              }`}>
                {notification.type === 'success' && <CheckCircle size={24} />}
                {notification.type === 'error' && <XCircle size={24} />}
                {notification.type === 'warning' && <AlertTriangle size={24} />}
                {notification.type === 'info' && <Info size={24} />}
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{notification.title}</h3>
              <div className="text-sm text-slate-600 mb-6 whitespace-pre-wrap text-left w-full bg-slate-50 p-3 rounded-lg border border-slate-100 max-h-60 overflow-y-auto font-mono">
                {notification.message}
              </div>
              <button 
                onClick={closeNotification}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 transition-colors"
              >
                Chiudi
              </button>
            </div>
          </div>
        </IonContent>
      </IonModal>
    </div>
  );
};

export default AdminDashboard;
