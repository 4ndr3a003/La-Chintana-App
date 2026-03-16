import React from 'react';
import { Users, Phone, Award, Edit2, PlusCircle, UserRoundPlus, X, Shield, User, Trash2, AlertTriangle, Search, SlidersHorizontal, Download, Upload, CheckCircle, XCircle, Info, Mail, Calendar, MapPin, CreditCard, Hash, Lock, Home, RefreshCw, Camera, FileText, Globe, Activity, Briefcase } from 'lucide-react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { ROLES, ROLE_LABELS, BOARD_ROLES, VOLUNTEER_ROLES, SPECIALIZATIONS_DATA, canManageVolunteers } from '../../utils/constants';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import CustomSelect from '../../components/ui/CustomSelect';
import DeleteConfirmationModal from '../../components/ui/DeleteConfirmationModal';
import { useAdminDashboard } from './AdminDashboardLogic';
import './AdminDashboard.css';

const AdminDashboard = ({ userProfile, showToast }) => {
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
    userToDelete,
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
    isImportingCSV,
    notification,
    closeNotification,
    handleCertificationChange,
    // Image Upload
    imageSrc,
    crop,
    setCrop,
    setCompletedCrop,
    isImageModalOpen,
    setIsImageModalOpen,
    imgRef,
    uploading,
    handlePhotoUpload,
    uploadCroppedImage,
    closeImageModal
  } = useAdminDashboard(showToast);

  const formatName = (user) => {
    // Usa i campi separati se disponibili per supportare nomi composti
    if (user.firstName && user.lastName) {
      return `${user.lastName} ${user.firstName}`;
    }
    // Fallback per utenti senza campi separati
    const fullName = typeof user === 'string' ? user : user?.name;
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
      {/* CSV Import Loading Overlay */}
      {isImportingCSV && (
        <div className="modal-overlay animate-in fade-in" style={{ zIndex: 9999 }}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 max-w-sm mx-4">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Importazione in corso...</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">Caricamento e aggiornamento dei dati dei volontari dal file CSV.</p>
          </div>
        </div>
      )}
      <div className="admin-dashboard-header">
        <h3 className="dashboard-title">
          <Users className="text-blue-600" size={28} /> Gestione Volontari
        </h3>
        <span className="user-count-badge">{filteredUsers.length} Volontari</span>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        {/* Action Row - Desktop */}
        <div className="hidden lg:flex justify-start items-center gap-3 mb-4">
          {canManageVolunteers(userProfile) && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-blue-600 dark:bg-[#facc15] hover:bg-blue-700 text-white dark:!text-[#0f172a] px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 text-sm font-bold"
            >
              <PlusCircle size={18} />
              Nuovo Volontario
            </button>
          )}

          {/* CSV Actions */}
          <div className="flex gap-2">
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              style={{ display: 'none' }}
              id="csv-upload-desktop"
            />
            {canManageVolunteers(userProfile) && (
              <label
                htmlFor="csv-upload-desktop"
                className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer active:scale-95 whitespace-nowrap"
                title="Importa da CSV"
              >
                <Upload size={18} />
                <span>Importa</span>
              </label>
            )}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-blue-600 font-bold dark:text-blue-400 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 whitespace-nowrap"
              title="Esporta in CSV"
            >
              <Download size={18} />
              <span>Esporta CSV</span>
            </button>
          </div>
        </div>

        <div className="flex flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Cerca volontario..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Mobile Actions & Filter Toggle */}
          <div className="lg:hidden flex border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm h-[46px] divide-x divide-slate-200 dark:divide-slate-700">
            {canManageVolunteers(userProfile) && (
              <>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  style={{ display: 'none' }}
                  id="csv-upload-mobile-header"
                />
                <label
                  htmlFor="csv-upload-mobile-header"
                  className="w-[48px] bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center justify-center"
                  title="Importa CSV"
                >
                  <Upload size={20} />
                </label>
              </>
            )}
            <button
              onClick={handleExportCSV}
              className="w-[48px] bg-white dark:bg-slate-800 text-blue-600 hover:bg-slate-50 transition-colors flex items-center justify-center"
              title="Esporta CSV"
            >
              <Download size={20} />
            </button>
            <button
              onClick={toggleFilters}
              className={`w-[48px] transition-all flex items-center justify-center ${isFiltersOpen 
                ? 'bg-[#004d9d] dark:bg-[#facc15] text-white dark:text-slate-900 shadow-inner' 
                : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              <SlidersHorizontal size={20} />
            </button>
          </div>

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
          </div>
        </div>

        {/* Mobile Filters Dropdown */}
        <div className="relative lg:hidden">
          {isFiltersOpen && (
            <div className="absolute top-full right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-20 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-slate-700 dark:text-slate-200">Filtri</span>
                <button
                  onClick={() => {
                    setFilterRole('Tutti');
                    setFilterStatus('Tutti');
                    setSearchTerm('');
                  }}
                  className="text-xs font-bold text-red-500 hover:text-red-600"
                >
                  Resetta
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold text-slate-400 ml-1 font-mono">Ruolo</p>
                  <CustomSelect
                    options={filterRoleOptions}
                    value={filterRole}
                    onChange={setFilterRole}
                    placeholder="Filtra per Ruolo"
                  />
                </div>
                
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold text-slate-400 ml-1 font-mono">Stato</p>
                  <CustomSelect
                    options={filterStatusOptions}
                    value={filterStatus}
                    onChange={setFilterStatus}
                    placeholder="Filtra per Stato"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
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
                <th className="p-4 text-xs font-bold text-slate-800 dark:text-slate-50 uppercase tracking-wider">ID Emercomnet</th>
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
                        <p className="font-bold text-slate-800 text-sm">{formatName(user)}</p>
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
                    <div className="flex flex-col gap-1">
                      {user.role === ROLES.PRESIDENT ? (
                        <Badge text={ROLE_LABELS[user.role]} color="yellow" size="sm" />
                      ) : user.role === ROLES.BOARD ? (
                        <Badge text={user.boardRole || ROLE_LABELS[user.role]} color="purple" size="sm" />
                      ) : user.role === ROLES.VOLUNTEER && !user.volunteerRole ? (
                        <Badge text={ROLE_LABELS[user.role]} color="blue" size="sm" />
                      ) : null}

                      {user.volunteerRole && (
                        <Badge text={user.volunteerRole} color="amber" size="sm" />
                      )}
                    </div>
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
                  <h4 className="font-bold text-slate-800">{formatName(user)}</h4>
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
                <div className="flex flex-col gap-1 items-start">
                  {user.role === ROLES.PRESIDENT ? (
                    <Badge text={ROLE_LABELS[user.role]} color="yellow" size="sm" />
                  ) : user.role === ROLES.BOARD ? (
                    <Badge text={user.boardRole || ROLE_LABELS[user.role]} color="purple" size="sm" />
                  ) : user.role === ROLES.VOLUNTEER && !user.volunteerRole ? (
                    <Badge text={ROLE_LABELS[user.role]} color="blue" size="sm" />
                  ) : null}

                  {user.volunteerRole && (
                    <Badge text={user.volunteerRole} color="amber" size="sm" />
                  )}
                </div>
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
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">ID Emercomnet</span>
                <span className="font-mono text-slate-700 font-bold">{user.emercomnetId || '-'}</span>
              </div>
            </div>
          </div>
        ))}
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
                <div className="flex flex-col items-center gap-1 mt-1">
                  {selectedUser.role === ROLES.PRESIDENT ? (
                    <Badge text={ROLE_LABELS[selectedUser.role]} color="yellow" />
                  ) : selectedUser.role === ROLES.BOARD ? (
                    <Badge text={selectedUser.boardRole || ROLE_LABELS[selectedUser.role]} color="purple" />
                  ) : selectedUser.role === ROLES.VOLUNTEER && !selectedUser.volunteerRole ? (
                    <Badge text={ROLE_LABELS[selectedUser.role]} color="blue" />
                  ) : null}

                  {selectedUser.volunteerRole && (
                    <Badge text={selectedUser.volunteerRole} color="amber" />
                  )}
                </div>
              </div>

              {/* Expiration Alerts */}
              {(() => {
                const expiringCerts = selectedUser.certifications ? Object.entries(selectedUser.certifications).filter(([_, cert]) => {
                  if (!cert.expirationDate) return false;
                  const days = Math.ceil((new Date(cert.expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
                  return days <= 30;
                }) : [];

                if (expiringCerts.length > 0) {
                  return (
                    <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl animate-in slide-in-from-top-2 fade-in">
                      <div className="flex items-center gap-2 mb-2 text-amber-800 dark:text-amber-400 font-bold">
                        <AlertTriangle size={18} />
                        <h4>Attenzione: Scadenze Rilevate</h4>
                      </div>
                      <ul className="space-y-2">
                        {expiringCerts.map(([name, cert]) => {
                          const days = Math.ceil((new Date(cert.expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
                          const isExpired = days < 0;
                          return (
                            <li key={name} className="flex items-center justify-between text-sm bg-white dark:bg-slate-800 p-2 rounded-lg border border-amber-100 dark:border-amber-900/50">
                              <span className="font-medium text-slate-700 dark:text-slate-300">{name}</span>
                              <span className={`text-xs font-bold px-2 py-1 rounded-md ${isExpired ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                {isExpired ? `Scaduto da ${Math.abs(days)} gg` : `Scade tra ${days} gg`}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                }
                return null;
              })()}

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
                    <p className="info-label"><MapPin size={14} /> Luogo di Nascita</p>
                    <p className="info-value whitespace-nowrap overflow-x-auto no-scrollbar" title={selectedUser.birthPlace}>{selectedUser.birthPlace || '-'}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label"><Hash size={14} /> ID Emercomnet</p>
                    <p className="info-value whitespace-nowrap overflow-x-auto no-scrollbar" title={selectedUser.emercomnetId}>{selectedUser.emercomnetId || '-'}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label"><Home size={14} /> Residenza</p>
                    <p className="info-value whitespace-nowrap overflow-x-auto no-scrollbar" title={selectedUser.city}>{selectedUser.city || '-'}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label"><MapPin size={14} /> Indirizzo</p>
                    <p className="info-value whitespace-nowrap overflow-x-auto no-scrollbar" title={selectedUser.address}>{selectedUser.address || '-'}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label"><Activity size={14} /> Gruppo Sanguigno</p>
                    <p className="info-value whitespace-nowrap overflow-x-auto no-scrollbar" title={selectedUser.bloodGroup}>{selectedUser.bloodGroup || '-'}</p>
                  </div>
                  <div className="info-card">
                    <p className="info-label"><Globe size={14} /> Lingue Parlate</p>
                    <p className="info-value whitespace-nowrap overflow-x-auto no-scrollbar" title={selectedUser.spokenLanguages}>{selectedUser.spokenLanguages || '-'}</p>
                  </div>
                  <div className="info-card md:col-span-2">
                    <p className="info-label"><Briefcase size={14} /> Info Datore Lavoro</p>
                    <p className="info-value whitespace-pre-wrap" title={selectedUser.employerNotes}>{selectedUser.employerNotes || '-'}</p>
                  </div>
                </div>

                {/* Additional ID Cards Section */}
                <div className="mt-4">
                  <h4 className="specs-section-title mb-3">
                    <FileText size={14} /> Documenti d'Identità
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="info-label mb-1">C. Identità</p>
                      <p className="font-medium text-sm text-slate-800">{selectedUser.idCard || '-'}</p>
                      <p className="text-xs text-slate-500 mt-1">Scad: {selectedUser.idCardExp ? new Date(selectedUser.idCardExp).toLocaleDateString('it-IT') : '-'}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="info-label mb-1">Patente</p>
                      <p className="font-medium text-sm text-slate-800">{selectedUser.driverLicense || '-'}</p>
                      <p className="text-xs text-slate-500 mt-1">Scad: {selectedUser.driverLicenseExp ? new Date(selectedUser.driverLicenseExp).toLocaleDateString('it-IT') : '-'}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="info-label mb-1">Passaporto</p>
                      <p className="font-medium text-sm text-slate-800">{selectedUser.passport || '-'}</p>
                      <p className="text-xs text-slate-500 mt-1">Scad: {selectedUser.passportExp ? new Date(selectedUser.passportExp).toLocaleDateString('it-IT') : '-'}</p>
                    </div>
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
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                {isCreating ? <UserRoundPlus size={24} className="text-blue-600" /> : <User size={24} className="text-blue-600" />}
                <span>{isCreating ? 'Nuovo Volontario' : 'Modifica Profilo'}</span>
              </h3>
              <button onClick={closeAll} className="modal-close-btn"><X size={20} /></button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleSave} className="space-y-8">

                {/* PHOTO UPLOAD SECTION IN EDIT MODAL - MOVED TO TOP */}
                <section className="flex flex-col items-center justify-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                  <p className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Foto Profilo</p>
                  <div className="relative group">
                    <Avatar src={formData.photoUrl} name={`${formData.firstName} ${formData.lastName}`} size="xl" className="shadow-md" />
                    <label
                      className="absolute bottom-0 right-0 p-2 rounded-full cursor-pointer bg-slate-900 text-white hover:bg-slate-700 transition-all shadow-md active:scale-95"
                      title="Aggiorna Foto"
                    >
                      <Camera size={16} />
                      <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} />
                    </label>
                    {uploading && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                </section>

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
                      <label className="info-label"><Hash size={14} /> ID Emercomnet</label>
                      <input type="text" className="form-input" value={formData.emercomnetId} onChange={e => setFormData({ ...formData, emercomnetId: e.target.value })} />
                    </div>
                    <div>
                      <label className="info-label"><Home size={14} /> Città di Residenza</label>
                      <input type="text" className="form-input" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                    </div>
                    <div>
                      <label className="info-label"><MapPin size={14} /> Indirizzo</label>
                      <input type="text" className="form-input" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
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
                      <div>
                        <label className="info-label">
                          <Lock size={14} /> {isCreating ? 'Password Iniziale' : 'Nuova Password (lascia vuoto per mantenere la corrente)'}
                        </label>
                        <input
                          type="text"
                          required={false}
                          className="form-input"
                          value={formData.password || ''}
                          onChange={e => setFormData({ ...formData, password: e.target.value })}
                          placeholder={isEditing ? "Inserisci nuova password..." : ""}
                        />
                      </div>
                    )}
                  </div>
                </section>

                {/* DOCUMENTI D'IDENTITA */}
                <section>
                  <h4 className="form-section-title mt-6">
                    <FileText size={16} className="text-indigo-500" /> Documenti d'Identità
                  </h4>
                  <div className="form-grid">
                    <div>
                      <label className="info-label">ID Carta d'Identità</label>
                      <input type="text" className="form-input" value={formData.idCard} onChange={e => setFormData({ ...formData, idCard: e.target.value })} />
                    </div>
                    <div>
                      <label className="info-label">Scadenza C.I.</label>
                      <input type="date" className="form-input" value={formData.idCardExp} onChange={e => setFormData({ ...formData, idCardExp: e.target.value })} />
                    </div>
                    <div>
                      <label className="info-label">ID Patente</label>
                      <input type="text" className="form-input" value={formData.driverLicense} onChange={e => setFormData({ ...formData, driverLicense: e.target.value })} />
                    </div>
                    <div>
                      <label className="info-label">Scadenza Patente</label>
                      <input type="date" className="form-input" value={formData.driverLicenseExp} onChange={e => setFormData({ ...formData, driverLicenseExp: e.target.value })} />
                    </div>
                    <div>
                      <label className="info-label">ID Passaporto</label>
                      <input type="text" className="form-input" value={formData.passport} onChange={e => setFormData({ ...formData, passport: e.target.value })} />
                    </div>
                    <div>
                      <label className="info-label">Scadenza Passaporto</label>
                      <input type="date" className="form-input" value={formData.passportExp} onChange={e => setFormData({ ...formData, passportExp: e.target.value })} />
                    </div>
                  </div>
                </section>

                {/* ULTERIORI INFORMAZIONI */}
                <section>
                  <h4 className="form-section-title mt-6">
                    <Activity size={16} className="text-rose-500" /> Ulteriori Informazioni
                  </h4>
                  <div className="form-grid">
                    <div>
                      <label className="info-label"><Activity size={14} /> Gruppo Sanguigno</label>
                      <input type="text" className="form-input outline-rose-500" placeholder="es. A+, 0-" value={formData.bloodGroup} onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })} />
                    </div>
                    <div>
                      <label className="info-label"><Globe size={14} /> Lingue Parlate</label>
                      <input type="text" className="form-input" placeholder="es. Inglese, Spagnolo" value={formData.spokenLanguages} onChange={e => setFormData({ ...formData, spokenLanguages: e.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="info-label"><Briefcase size={14} /> Dati Datore di Lavoro / Note</label>
                      <textarea className="form-input min-h-[80px]" value={formData.employerNotes} onChange={e => setFormData({ ...formData, employerNotes: e.target.value })} />
                    </div>
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
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {data.items.map(item => {
                              const isSelected = formData.specializations.includes(item);
                              const certData = formData.certifications?.[item] || {};
                              const isPatente = category === "Patenti di Guida";

                              return (
                                <div
                                  key={item}
                                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${isSelected
                                    ? `${data.color} shadow-sm ring-1 ring-black/5 dark:ring-white/10`
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                    }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => toggleSpec(item)}
                                    className="w-full text-left px-4 py-3 flex items-center justify-between text-xs font-bold bg-transparent"
                                  >
                                    <span className="truncate pr-2">{item}</span>
                                    {isSelected ? (
                                      <CheckCircle size={18} className="shrink-0 opacity-100 transition-opacity" />
                                    ) : (
                                      <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 shrink-0" />
                                    )}
                                  </button>

                                  {isSelected && !isPatente && (
                                    <div className="px-4 pb-4 pt-0 animate-in slide-in-from-top-1 fade-in duration-200">
                                      <div className="bg-white/50 dark:bg-black/20 p-2.5 rounded-lg border border-black/5 dark:border-white/5 backdrop-blur-[2px]">
                                        <label className="text-[10px] uppercase font-bold opacity-70 block mb-1.5 tracking-wider">
                                          Data Conseguimento
                                        </label>
                                        <div className="relative">
                                          <input
                                            type="date"
                                            className="w-full text-sm px-3 py-2 pl-9 rounded-md border-0 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 appearance-none"
                                            value={certData.completionDate || ''}
                                            onChange={(e) => handleCertificationChange(item, 'completionDate', e.target.value)}
                                          />
                                          <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                        {certData.expirationDate && (
                                          <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-black/5 dark:border-white/5">
                                            <span className="opacity-70">Scadenza:</span>
                                            <span className="font-bold">{new Date(certData.expirationDate).toLocaleDateString('it-IT')}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
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
        message={userToDelete ? `Stai per eliminare il profilo di ${userToDelete.name}. Questa azione è irreversibile. Sei sicuro di voler procedere?` : ''}
      />

      {/* Crop Modal */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-[200] p-4"
          onClick={closeImageModal}
        >
          <div
            className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4 text-slate-800">Ritaglia Immagine</h3>
            <div className="max-h-[60vh] overflow-y-auto">
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                onComplete={c => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                <img ref={imgRef} src={imageSrc} style={{ maxHeight: '70vh' }} alt="Upload" />
              </ReactCrop>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeImageModal}
                className="px-5 py-2 rounded-lg bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition-colors"
                disabled={uploading}
              >
                Annulla
              </button>
              <button
                onClick={uploadCroppedImage}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Caricamento...
                  </>
                ) : (
                  'Salva'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;