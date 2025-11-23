import React from 'react';
import { Users, Phone, Award, Edit2, PlusCircle, X, Shield, User } from 'lucide-react';
import { ROLES, ROLE_LABELS, BOARD_ROLES, SPECIALIZATIONS_DATA } from '../../utils/constants';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useAdminDashboard } from './AdminDashboardLogic';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const {
    users,
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
    setIsViewing
  } = useAdminDashboard();

  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-header">
         <h3 className="dashboard-title">
            <Users className="text-purple-600" size={20} /> Gestione Organico
         </h3>
         <span className="user-count-badge">{users.length} Volontari</span>
      </div>

      <div className="users-grid">
        {users.map(user => (
          <Card key={user.id} noPadding>
             <div 
               onClick={() => openView(user)}
               className="flex flex-row items-start p-4 gap-4 cursor-pointer hover:bg-slate-50 transition-colors relative group"
             >
                <Avatar src={user.photoUrl} name={user.name} size="md" />
                <div className="flex-grow text-left">
                  <h4 className="font-bold text-slate-800">{user.name}</h4>
                  <div className="flex flex-col gap-1 mt-1">
                    {user.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Phone size={12} /> {user.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Award size={12} /> {(user.specializations || []).length} Abilitazioni
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge text={ROLE_LABELS[user.role]} color={user.role === ROLES.PRESIDENT ? 'blue' : user.role === ROLES.BOARD ? 'purple' : 'green'} />
                  <button 
                    onClick={(e) => { e.stopPropagation(); openEdit(user); }}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Modifica Dati"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
             </div>
          </Card>
        ))}
      </div>

      <button 
        onClick={openCreate}
        className="fab-button"
      >
        <PlusCircle size={28} />
      </button>

      {/* VIEW MODAL */}
      {isViewing && selectedUser && (
        <div className="modal-overlay animate-in fade-in">
          <div className="modal-content max-w-lg">
             <div className="modal-header">
                <h3 className="font-bold text-slate-800">Scheda Volontario</h3>
                <button onClick={() => setIsViewing(false)} className="p-1 rounded-full hover:bg-slate-200 text-slate-500"><X size={20} /></button>
             </div>
             <div className="modal-body">
                <div className="flex flex-col items-center mb-6">
                   <Avatar src={selectedUser.photoUrl} name={selectedUser.name} size="xl" className="mb-3 shadow-md" />
                   <h2 className="text-xl font-black text-slate-800">{selectedUser.name}</h2>
                   <Badge text={ROLE_LABELS[selectedUser.role]} color="blue" className="mt-1" />
                   {selectedUser.boardRole && <Badge text={selectedUser.boardRole} color="purple" className="mt-1" />}
                </div>
                
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Email</p>
                            <p className="font-medium text-slate-700 text-sm break-all">{selectedUser.email}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Telefono</p>
                            <p className="font-medium text-slate-700 text-sm">{selectedUser.phone || '-'}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Codice Fiscale</p>
                            <p className="font-medium text-slate-700 text-sm uppercase">{selectedUser.cf || '-'}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Data di Nascita</p>
                            <p className="font-medium text-slate-700 text-sm">{selectedUser.birthDate ? new Date(selectedUser.birthDate).toLocaleDateString('it-IT') : '-'}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl col-span-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Residenza</p>
                            <p className="font-medium text-slate-700 text-sm">{selectedUser.city || '-'}</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                           <Shield size={14} /> Abilitazioni ({selectedUser.specializations?.length || 0})
                        </h4>
                        <div className="space-y-3">
                            {Object.entries(SPECIALIZATIONS_DATA).map(([category, data]) => {
                                const userSpecs = data.items.filter(i => selectedUser.specializations?.includes(i));
                                if (userSpecs.length === 0) return null;
                                return (
                                    <div key={category} className="bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                                        <h5 className={`text-[10px] font-bold uppercase mb-2 flex items-center gap-2 ${data.color.split(' ')[1]}`}>
                                            {data.icon} {category}
                                        </h5>
                                        <div className="flex flex-wrap gap-2">
                                            {userSpecs.map(item => (
                                                <span key={item} className={`px-2.5 py-1 rounded-lg text-xs font-bold border shadow-sm ${data.color}`}>
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                            {selectedUser.specializations?.filter(s => !Object.values(SPECIALIZATIONS_DATA).flatMap(d => d.items).includes(s)).length > 0 && (
                                <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                                    <h5 className="text-[10px] font-bold uppercase mb-2 text-slate-400">Altro</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedUser.specializations.filter(s => !Object.values(SPECIALIZATIONS_DATA).flatMap(d => d.items).includes(s)).map(s => (
                                            <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white border border-slate-200 text-slate-600 shadow-sm">
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
                
                <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
                    <Button onClick={() => { setIsViewing(false); openEdit(selectedUser); }} variant="outline" size="sm">
                        <Edit2 size={16} /> Modifica Dati
                    </Button>
                </div>
             </div>
          </div>
        </div>
      )}

      {(isEditing || isCreating) && (
        <div className="modal-overlay animate-in fade-in">
          <div className="modal-content max-w-2xl">
             <div className="modal-header">
                <h3 className="font-bold text-slate-800">{isCreating ? 'Nuovo Volontario' : 'Modifica Profilo'}</h3>
                <button onClick={closeAll} className="p-1 rounded-full hover:bg-slate-200 text-slate-500"><X size={20} /></button>
             </div>
             
             <div className="modal-body">
                <form onSubmit={handleSave} className="space-y-8">
                   
                   {/* DATI PERSONALI */}
                   <section>
                     <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                       <User size={16} className="text-blue-500"/> Dati Personali
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nome</label>
                          <input type="text" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cognome</label>
                          <input type="text" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data di Nascita</label>
                          <input type="date" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Luogo di Nascita</label>
                          <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={formData.birthPlace} onChange={e => setFormData({...formData, birthPlace: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Codice Fiscale</label>
                          <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm uppercase" value={formData.cf} onChange={e => setFormData({...formData, cf: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Città di Residenza</label>
                          <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Telefono</label>
                          <input type="tel" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email</label>
                          <input type="email" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                        {isCreating && (
                          <div className="md:col-span-2">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Password Iniziale</label>
                            <input type="text" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                          </div>
                        )}
                     </div>
                   </section>

                   {/* RUOLO & ABILITAZIONI */}
                   <section>
                     <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                       <Shield size={16} className="text-purple-500"/> Ruolo & Abilitazioni
                     </h4>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                       <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ruolo Organizzativo</label>
                          <select 
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                            value={formData.role}
                            onChange={e => setFormData({...formData, role: e.target.value})}
                          >
                            {Object.values(ROLES).map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                          </select>
                       </div>
                       {formData.role === ROLES.BOARD && (
                         <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Incarico Direttivo</label>
                            <select 
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                              value={formData.boardRole || ''}
                              onChange={e => setFormData({...formData, boardRole: e.target.value})}
                            >
                              <option value="">Seleziona...</option>
                              {Object.values(BOARD_ROLES).map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                         </div>
                       )}
                     </div>

                     <div className="space-y-4">
                        {Object.entries(SPECIALIZATIONS_DATA).map(([category, data]) => (
                          <div key={category} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <h5 className="font-bold text-slate-700 text-xs uppercase mb-3 flex items-center gap-2">
                              {data.icon} {category}
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {data.items.map(item => (
                                <label key={item} className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded-lg transition-colors">
                                  <input 
                                    type="checkbox" 
                                    checked={formData.specializations?.includes(item)}
                                    onChange={() => toggleSpec(item)}
                                    className="rounded text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-xs font-medium text-slate-700">{item}</span>
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
                               className="flex-grow p-2 bg-white border border-slate-200 rounded-lg text-xs"
                               value={customSpec}
                               onChange={e => setCustomSpec(e.target.value)}
                             />
                             <button type="button" onClick={addCustomSpec} className="bg-slate-200 hover:bg-slate-300 text-slate-600 px-3 rounded-lg font-bold text-xs">
                               +
                             </button>
                           </div>
                           <div className="flex flex-wrap gap-2 mt-3">
                             {formData.specializations?.filter(s => !Object.values(SPECIALIZATIONS_DATA).flatMap(d => d.items).includes(s)).map(s => (
                               <span key={s} className="bg-white border border-slate-200 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                                 {s}
                                 <button type="button" onClick={() => toggleSpec(s)} className="text-slate-400 hover:text-red-500"><X size={12}/></button>
                               </span>
                             ))}
                           </div>
                        </div>
                     </div>
                   </section>

                   <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                      <Button type="button" variant="ghost" onClick={closeAll}>Annulla</Button>
                      <Button type="submit">Salva Modifiche</Button>
                   </div>
                </form>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
