import { ArrowRight, Building2, PlusCircle, Shield, ArrowLeft, Edit3, X, Trash2, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSuperadminDashboardView } from './SuperadminDashboardViewLogic';

const SuperadminDashboardView = ({ userProfile, onLoginSuccess }) => {
  const navigate = useNavigate();
  const {
    associations,
    loading,
    actionLoading,
    handleSelectAssociation,
    handleCreateAssociation,
    isEditModalOpen,
    selectedAssocToEdit,
    openEditModal,
    closeEditModal,
    handleUpdateAssociation,
    isDeleteModalOpen,
    selectedAssocToDelete,
    openDeleteModal,
    closeDeleteModal,
    handleDeleteAssociation,
    deleteError,
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal
  } = useSuperadminDashboardView(userProfile, onLoginSuccess);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto py-8 px-4 animate-in fade-in zoom-in-95 duration-700">
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate(-1)}
              className="p-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm hover:shadow-md hover:-translate-x-1"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
                <Shield className="text-amber-500 w-10 h-10 drop-shadow-md" />
                Gestione Associazioni
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base font-medium">
                Superadmin Hub: Seleziona, modifica o inizializza un nuova associazione
              </p>
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 dark:bg-yellow-400 hover:bg-blue-700 dark:hover:bg-yellow-300 text-white dark:text-[#002e5c] px-5 py-3 rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-95 text-base font-extrabold"
          >
            <PlusCircle size={20} />
            Nuova associazione
          </button>
        </div>

        <div className="w-full space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-slate-100 dark:border-slate-800 relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-8 flex items-center gap-3 relative z-10">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                <Building2 className="text-blue-600 dark:text-blue-400 w-6 h-6" />
              </div>
              Associazioni Attive
            </h2>

            {loading ? (
              <div className="flex justify-center items-center py-20 relative z-10">
                <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin shadow-lg"></div>
              </div>
            ) : associations.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 relative z-10">
                <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Nessuna associazione trovata.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 pr-2">
                {associations.map(assoc => (
                  <button
                    key={assoc.associationId}
                    onClick={() => handleSelectAssociation(assoc.associationId)}
                    className={`w-full text-left bg-white dark:bg-slate-800 border ${assoc.associationId === userProfile.associationId ? 'border-amber-400 ring-4 ring-amber-400/10' : 'border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500'} hover:shadow-xl hover:-translate-y-1.5 p-6 rounded-3xl transition-all duration-300 group flex flex-col justify-between h-full min-h-[140px]`}
                  >
                    <div className="flex items-start justify-between w-full mb-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm overflow-hidden ${assoc.associationId === userProfile.associationId ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 dark:bg-slate-900 text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-blue-500/30'}`}>
                        {assoc.logoUrl ? (
                          <img src={assoc.logoUrl} alt={assoc.associationName} className="w-full h-full object-contain p-1" />
                        ) : (
                          <Building2 size={28} />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/superadmin/settings/${assoc.associationId}`);
                          }}
                          className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-all duration-300"
                          title="Impostazioni Associazione"
                        >
                          <Settings className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(assoc);
                          }}
                          className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all duration-300"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteModal(assoc);
                          }}
                          className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${assoc.associationId === userProfile.associationId ? 'bg-amber-400 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-700 text-slate-300 group-hover:bg-blue-500 group-hover:text-white'}`}>
                          <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${assoc.associationId === userProfile.associationId ? '' : 'group-hover:translate-x-1'}`} />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-xl text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 mb-1">
                        {assoc.associationName}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-medium text-slate-400">
                          ID: {assoc.associationId}
                        </span>
                        {assoc.associationId === userProfile.associationId && (
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full shadow-sm">
                            Attuale
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Creazione Associazione */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <PlusCircle className="text-blue-500" />
                Nuova Associazione
              </h3>
              <button onClick={closeCreateModal} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const newId = e.target.newAssocId.value;
                const newName = e.target.newAssocName.value;
                const newCity = e.target.newAssocCity.value;
                const logoFile = e.target.newAssocLogo.files[0];
                handleCreateAssociation(e, newId, newName, logoFile, newCity);
                e.target.reset();
              }}
              className="p-6 space-y-5"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 ml-1">ID Associazione (breve)</label>
                <input
                  name="newAssocId"
                  placeholder="es. milano"
                  className="w-full text-sm p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 ml-1">Nome Completo</label>
                <input
                  name="newAssocName"
                  placeholder="es. Protezione Civile Milano"
                  className="w-full text-sm p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 ml-1">Città</label>
                <input
                  name="newAssocCity"
                  placeholder="es. Milano"
                  className="w-full text-sm p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm"
                  required
                />
              </div>
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 ml-1">Logo (Opzionale)</label>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl border-dashed">
                  <input
                    type="file"
                    name="newAssocLogo"
                    accept="image/*"
                    className="w-full text-sm text-slate-600 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition-all cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="px-6 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center min-w-[120px]"
                >
                  {actionLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Crea'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Modifica Associazione */}
      {isEditModalOpen && selectedAssocToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Edit3 className="text-blue-500" />
                Modifica Associazione
              </h3>
              <button
                onClick={closeEditModal}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const newName = e.target.editAssocName.value;
                const newCity = e.target.editAssocCity.value;
                const logoFile = e.target.editAssocLogo.files[0];
                handleUpdateAssociation(e, selectedAssocToEdit.associationId, newName, logoFile, newCity);
              }}
              className="p-6 space-y-5"
            >
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">ID Associazione</label>
                <input
                  value={selectedAssocToEdit.associationId}
                  disabled
                  className="w-full text-sm p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-400 mt-1 ml-1">L'ID non può essere modificato.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 ml-1">Nome Completo</label>
                <input
                  name="editAssocName"
                  defaultValue={selectedAssocToEdit.associationName}
                  className="w-full text-sm p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 ml-1">Città</label>
                <input
                  name="editAssocCity"
                  defaultValue={selectedAssocToEdit.city || 'Morano sul Po'}
                  className="w-full text-sm p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm"
                  required
                />
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 ml-1">Nuovo Logo (Opzionale)</label>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl border-dashed">
                  <input
                    type="file"
                    name="editAssocLogo"
                    accept="image/*"
                    className="w-full text-sm text-slate-600 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition-all cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-6 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center min-w-[120px]"
                >
                  {actionLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Salva Modifiche'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Eliminazione Associazione */}
      {isDeleteModalOpen && selectedAssocToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-md shadow-2xl border border-red-100 dark:border-red-950/20 animate-in zoom-in-95 duration-300 overflow-hidden">

            {/* Red Alert Banner */}
            <div className="bg-red-500 text-white p-6 flex items-center gap-3">
              <Trash2 className="w-8 h-8" />
              <div>
                <h3 className="text-xl font-bold">Elimina Associazione</h3>
                <p className="text-xs text-red-100">Azione irreversibile</p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const pwd = e.target.deleteAssocPassword.value;
                handleDeleteAssociation(selectedAssocToDelete.associationId, pwd);
              }}
              className="p-6 space-y-5"
            >
              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-950/40 text-red-700 dark:text-red-400 text-sm leading-relaxed">
                Stai per eliminare definitivamente l'associazione <strong>{selectedAssocToDelete.associationName}</strong> (ID: {selectedAssocToDelete.associationId}). Tutti i dati del database associativo non saranno più accessibili da questo hub.
              </div>

              {deleteError && (
                <div className="p-3.5 bg-red-100/55 dark:bg-red-950/60 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium">
                  {deleteError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 ml-1">
                  Inserisci la tua Password Superadmin per Confermare
                </label>
                <input
                  type="password"
                  name="deleteAssocPassword"
                  placeholder="La tua password"
                  className="w-full text-sm p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all shadow-sm"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="px-6 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-md shadow-red-500/20 flex items-center justify-center min-w-[120px]"
                >
                  {actionLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Elimina'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SuperadminDashboardView;
