import React from 'react';
import { Users, Phone, Award, Edit2, PlusCircle, UserRoundPlus, X, Shield, User, Trash2, AlertTriangle, Search, SlidersHorizontal, Download, Upload, CheckCircle, XCircle, Info, Mail, Calendar, MapPin, CreditCard, Hash, Lock, Home } from 'lucide-react';
import { ROLES, ROLE_LABELS, BOARD_ROLES, VOLUNTEER_ROLES, SPECIALIZATIONS_DATA, canManageVolunteers } from '../../utils/constants';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import CustomSelect from '../../components/ui/CustomSelect';
import DeleteConfirmationModal from '../../components/ui/DeleteConfirmationModal';
import { useAdminDashboard } from './AdminDashboardLogic';
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
    ...roleOptions,
    { value: VOLUNTEER_ROLES.K9, label: 'Unità Cinofila', color: 'bg-amber-500' }
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

  const volunteerRoleOptions = [
    { value: '', label: 'Nessun Ruolo', color: 'bg-slate-200 text-slate-600' },
    ...Object.values(VOLUNTEER_ROLES).map(r => ({
      value: r,
      label: r,
      color: 'bg-amber-500'
    }))
  ];

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-header">
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
            {selectedUserIds.length > 0 && canManageVolunteers(userProfile) && (
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
            {canManageVolunteers(userProfile) && (
              <button
                onClick={openCreate}
                className="hidden md:flex items-center gap-2 bg-blue-600 dark:bg-[#facc15] hover:bg-blue-700 text-white dark:!text-[#0f172a] px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                <UserRoundPlus size={18} />
                Nuovo Volontario
              </button>
            )}
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
                    disabled={!canManageVolunteers(userProfile)}
                  />
                </th>
                <th className="p-4 text-xs font-bold text-slate-800 dark:text-slate-50 uppercase tracking-wider">Volontario</th>
                <th className="p-4 text-xs font-bold text-slate-800 dark:text-slate-50 uppercase tracking-wider">Codice Emercomnet</th>
                <th className="p-4 text-xs font-bold text-slate-800 dark:text-slate-50 uppercase tracking-wider">Ruolo</th>
                <th className="p-4 text-xs font-bold text-slate-800 dark:text-slate-50 uppercase tracking-wider">Stato</th>
                <th className="p-4 text-xs font-bold text-slate-800 dark:text-slate-50 uppercase tracking-wider text-right">Azioni</th>
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
                    {user.role !== ROLES.PRESIDENT && canManageVolunteers(userProfile) && (
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
                    {user.volunteerRole ? (
                      <Badge text={user.volunteerRole} color="amber" size="sm" />
                    ) : user.boardRole ? (
                      <Badge text={user.boardRole} color="purple" size="sm" />
                    ) : (
                      <Badge
                        text={ROLE_LABELS[user.role]}
                        color={user.role === ROLES.PRESIDENT ? 'yellow' : user.role === ROLES.BOARD ? 'purple' : 'blue'}
                        size="sm"
                      />
                    )}
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
                      {canManageVolunteers(userProfile) && (
                        <button
                          onClick={() => openEdit(user)}
                          className="p-2 text-slate-400 hover:text-[var(--color-pc-blue-700)] hover:bg-blue-50 rounded-full transition-colors"
                          title="Modifica Dati"
                        >
                          <Edit2 size={18} />
                        </button>
                      )}
                      {canManageVolunteers(userProfile) && user.role !== ROLES.PRESIDENT && (
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
      <div className="md:hidden space-y-3 pb-2">
        {filteredUsers.map(user => (
          <div
            key={user.id}
            onClick={() => openView(user)}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm active:scale-[0.99] transition-transform volunteer-card-mobile"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar src={user.photoUrl} name={user.name} size="md" />
                <div>
                  <h4 className="font-bold text-slate-800">{formatName(user.name)}</h4>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
              <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                {canManageVolunteers(userProfile) && (
                  <button
                    onClick={() => openEdit(user)}
                    className="p-2 text-slate-400 hover:text-[var(--color-pc-blue-700)] bg-slate-50 rounded-full"
                  >
                    <Edit2 size={16} />
                  </button>
                )}
                {canManageVolunteers(userProfile) && user.role !== ROLES.PRESIDENT && (
                  <button
                    onClick={() => handleDeleteUser(user)}
                    className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 rounded-full"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-50 p-2.5 rounded-lg">
                <span className="text-xs text-slate-400 block mb-1.5 font-medium uppercase tracking-wider">Ruolo</span>
                {user.volunteerRole ? (
                  <Badge text={user.volunteerRole} color="amber" size="sm" />
                ) : user.boardRole ? (
                  <Badge text={user.boardRole} color="purple" size="sm" />
                ) : (
                  <Badge
                    text={ROLE_LABELS[user.role]}
                    color={user.role === ROLES.PRESIDENT ? 'yellow' : user.role === ROLES.BOARD ? 'purple' : 'blue'}
                    size="sm"
                  />
                )}
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
          {canManageVolunteers(userProfile) && (
            <div className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm cursor-pointer">
              <Upload size={18} />
              Importa CSV
            </div>
          )}
        </label>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm"
        >
          <Download size={18} />
          Esporta CSV
        </button>
      </div>

      {canManageVolunteers(userProfile) && (
        <button
          onClick={openCreate}
          className="fixed right-6 bottom-24 md:hidden w-14 h-14 bg-blue-600 dark:bg-[#facc15] text-white dark:!text-[#0f172a] rounded-full shadow-lg flex items-center justify-center z-40 transition-transform active:scale-95"
        >
          <UserRoundPlus size={28} />
        </button>
      )}

      {/* VIEW MODAL */}
      {isViewing && selectedUser && (
        <div className="modal-overlay animate-in fade-in" onClick={() => setIsViewing(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="font-bold text-slate-800">Scheda Volontario</h3>
              <button onClick={() => setIsViewing(false)} className="modal-close-btn"><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="modal-profile-header">
                <Avatar src={selectedUser.photoUrl} name={selectedUser.name} size="xl" className="mb-3 shadow-md" />
                <h2 className="modal-profile-name">{selectedUser.name}</h2>
                {selectedUser.volunteerRole ? (
                  <Badge text={selectedUser.volunteerRole} color="amber" className="mt-1" />
                ) : selectedUser.boardRole ? (
                  <Badge text={selectedUser.boardRole} color="purple" className="mt-1" />
                ) : (
                  <Badge text={ROLE_LABELS[selectedUser.role]} color={selectedUser.role === ROLES.PRESIDENT ? 'yellow' : selectedUser.role === ROLES.BOARD ? 'purple' : 'blue'} className="mt-1" />
                )}
              </div>

              <div className="space-y-6">
                <div className="info-grid">
                  <div className="info-card">
                    <p className="info-label"><Mail size={14} /> Email</p>
                    <p className="info-value whitespace-nowrap overflow-x-auto no-scrollbar" title={selectedUser.email}>{selectedUser.email}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label"><Phone size={14} /> Telefono</p>
                    <p className="info-value whitespace-nowrap overflow-x-auto no-scrollbar" title={selectedUser.phone}>{selectedUser.phone || '-'}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label"><CreditCard size={14} /> Codice Fiscale</p>
                    <p className="info-value uppercase whitespace-nowrap overflow-x-auto no-scrollbar" title={selectedUser.cf}>{selectedUser.cf || '-'}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label"><Calendar size={14} /> Data di Nascita</p>
                    <p className="info-value whitespace-nowrap overflow-x-auto no-scrollbar">{selectedUser.birthDate ? new Date(selectedUser.birthDate).toLocaleDateString('it-IT') : '-'}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label"><Hash size={14} /> Codice Emercomnet</p>
                    <p className="info-value whitespace-nowrap overflow-x-auto no-scrollbar" title={selectedUser.emercomnetId}>{selectedUser.emercomnetId || '-'}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label"><Home size={14} /> Residenza</p>
                    <p className="info-value whitespace-nowrap overflow-x-auto no-scrollbar" title={selectedUser.city}>{selectedUser.city || '-'}</p>
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
                          <h5 className={`spec-category-title ${data.titleColor}`}>
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
                {canManageVolunteers(userProfile) && (
                  <Button onClick={() => { setIsViewing(false); openEdit(selectedUser); }} variant="outline" size="sm">
                    <Edit2 size={16} /> Modifica Dati
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {(isEditing || isCreating) && (
        <div className="modal-overlay animate-in fade-in edit-create-modal" onClick={closeAll}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="font-bold text-slate-800">{isCreating ? 'Nuovo Volontario' : 'Modifica Profilo'}</h3>
              <button onClick={closeAll} className="modal-close-btn"><X size={20} /></button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleSave} className="space-y-8">

                {/* DATI PERSONALI */}
                <section>
                  <h4 className="form-section-title">
                    <User size={16} className="text-blue-500" /> Dati Personali
                  </h4>
                  <div className="form-grid">
                    <div>
                      <label className="info-label"><User size={14} /> Nome</label>
                      <input type="text" required className="form-input" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                    </div>
                    <div>
                      <label className="info-label"><User size={14} /> Cognome</label>
                      <input type="text" required className="form-input" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                    </div>
                    <div>
                      <label className="info-label"><Calendar size={14} /> Data di Nascita</label>
                      <input type="date" className="form-input" value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} />
                    </div>
                    <div>
                      <label className="info-label"><MapPin size={14} /> Luogo di Nascita</label>
                      <input type="text" className="form-input" value={formData.birthPlace} onChange={e => setFormData({ ...formData, birthPlace: e.target.value })} />
                    </div>
                    <div>
                      <label className="info-label"><CreditCard size={14} /> Codice Fiscale</label>
                      <input type="text" className="form-input uppercase" value={formData.cf} onChange={e => setFormData({ ...formData, cf: e.target.value })} />
                    </div>
                    <div>
                      <label className="info-label"><Hash size={14} /> Codice Identificativo Emercomnet</label>
                      <input type="text" className="form-input" value={formData.emercomnetId} onChange={e => setFormData({ ...formData, emercomnetId: e.target.value })} />
                    </div>
                    <div>
                      <label className="info-label"><Home size={14} /> Città di Residenza</label>
                      <input type="text" className="form-input" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                    </div>
                    <div>
                      <label className="info-label"><Phone size={14} /> Telefono</label>
                      <input type="tel" className="form-input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div>
                      <label className="info-label"><Mail size={14} /> Email</label>
                      <input type="email" required className="form-input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    {(isCreating || (isEditing && userProfile?.role === ROLES.PRESIDENT)) && (
                      <div className="md:col-span-2">
                        <label className="info-label">
                          <Lock size={14} /> {isCreating ? 'Password Iniziale' : 'Nuova Password (lascia vuoto per mantenere la corrente)'}
                        </label>
                        <input
                          type="text"
                          required={isCreating}
                          className="form-input"
                          value={formData.password || ''}
                          onChange={e => setFormData({ ...formData, password: e.target.value })}
                          placeholder={isEditing ? "Inserisci nuova password..." : ""}
                        />
                      </div>
                    )}
                  </div>
                </section>

                {/* RUOLO & ABILITAZIONI */}
                <section>
                  <h4 className="form-section-title">
                    <Shield size={16} className="text-purple-500" /> Ruolo & Abilitazioni
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="info-label">Stato Operativo</label>
                      <CustomSelect
                        value={formData.status}
                        onChange={val => setFormData({ ...formData, status: val })}
                        options={statusOptions}
                      />
                    </div>
                    <div>
                      <label className="info-label">Ruolo Organizzativo</label>
                      <CustomSelect
                        value={formData.role}
                        onChange={val => setFormData({ ...formData, role: val })}
                        options={roleOptions}
                      />
                    </div>
                    {formData.role === ROLES.BOARD && (
                      <div>
                        <label className="info-label">Incarico Direttivo</label>
                        <CustomSelect
                          value={formData.boardRole || ''}
                          onChange={val => setFormData({ ...formData, boardRole: val })}
                          options={boardRoleOptions}
                          placeholder="Seleziona..."
                        />
                      </div>
                    )}
                    {(formData.role === ROLES.VOLUNTEER || formData.role === ROLES.BOARD) && (
                      <div>
                        <label className="info-label">Ruolo Volontario / Specializzazione</label>
                        <CustomSelect
                          value={formData.volunteerRole || ''}
                          onChange={val => setFormData({ ...formData, volunteerRole: val })}
                          options={volunteerRoleOptions}
                          placeholder="Seleziona..."
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="specs-section-title mb-3">
                      <Award size={14} /> Abilitazioni
                    </h4>
                    <div className="space-y-4">
                      {Object.entries(SPECIALIZATIONS_DATA).map(([category, data]) => (
                        <div key={category} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <h5 className={`flex items-center gap-2 font-bold text-xs uppercase mb-3 ${data.titleColor}`}>
                            {data.icon} {category}
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {data.items.map(item => (
                              <button
                                key={item}
                                type="button"
                                onClick={() => toggleSpec(item)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${formData.specializations.includes(item)
                                  ? `${data.color} border-transparent shadow-sm`
                                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:dark:border-slate-600'
                                  }`}
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* Custom Specializations */}
                      <div className="bg-slate-50 dark:bg-[var(--color-slate-100)] p-3 rounded-xl border border-slate-100 dark:border-slate-200">
                        <h5 className="flex items-center gap-2 font-bold text-xs uppercase mb-3 text-slate-500 dark:text-slate-400">
                          <PlusCircle size={14} /> Altre Abilitazioni
                        </h5>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {formData.specializations
                            .filter(s => !Object.values(SPECIALIZATIONS_DATA).flatMap(d => d.items).includes(s))
                            .map(s => (
                              <div key={s} className="flex items-center gap-1 bg-slate-800 dark:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm">
                                {s}
                                <button
                                  type="button"
                                  onClick={() => toggleSpec(s)}
                                  className="hover:text-red-300 transition-colors"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={customSpec}
                            onChange={e => setCustomSpec(e.target.value)}
                            placeholder="Nuova abilitazione..."
                            className="flex-grow px-3 py-2 rounded-lg text-sm border border-slate-200 bg-white dark:bg-[var(--color-slate-50)] dark:text-white dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addCustomSpec())}
                          />
                          <button
                            type="button"
                            onClick={addCustomSpec}
                            disabled={!customSpec.trim()}
                            className="bg-slate-800 dark:bg-[#bae0ff] text-white dark:text-[#1e293b] px-3 py-2 rounded-lg hover:bg-slate-700 dark:hover:bg-[#a0d2f0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <PlusCircle size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button type="button" variant="outline" onClick={closeAll}>
                    Annulla
                  </Button>
                  <Button type="submit">
                    {isCreating ? 'Crea Volontario' : 'Salva Modifiche'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isBulkDeleteModalOpen}
        onClose={cancelDeleteSelected}
        onConfirm={confirmDeleteSelected}
        title="Elimina Volontari"
        message={`Stai per eliminare ${selectedUserIds.length} volontari selezionati. Questa azione è irreversibile. Sei sicuro di voler procedere?`}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={cancelDeleteUser}
        onConfirm={confirmDeleteUser}
        title="Elimina Volontario"
        message={selectedUser ? `Stai per eliminare il profilo di ${selectedUser.name}. Questa azione è irreversibile. Sei sicuro di voler procedere?` : ''}
      />
    </div>
  );
};

export default AdminDashboard;