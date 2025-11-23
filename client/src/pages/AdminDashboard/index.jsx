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
               className="user-card-inner group"
             >
                <Avatar src={user.photoUrl} name={user.name} size="md" />
                <div className="user-card-content">
                  <h4 className="user-name">{user.name}</h4>
                  <div className="user-details">
                    {user.phone && (
                      <div className="user-detail-item">
                        <Phone size={12} /> {user.phone}
                      </div>
                    )}
                    <div className="user-detail-item">
                      <Award size={12} /> {(user.specializations || []).length} Abilitazioni
                    </div>
                  </div>
                </div>
                <div className="user-actions">
                  <Badge text={ROLE_LABELS[user.role]} color={user.role === ROLES.PRESIDENT ? 'blue' : user.role === ROLES.BOARD ? 'purple' : 'green'} />
                  <button 
                    onClick={(e) => { e.stopPropagation(); openEdit(user); }}
                    className="edit-button"
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
                <button onClick={() => setIsViewing(false)} className="modal-close-btn"><X size={20} /></button>
             </div>
             <div className="modal-body">
                <div className="modal-profile-header">
                   <Avatar src={selectedUser.photoUrl} name={selectedUser.name} size="xl" className="mb-3 shadow-md" />
                   <h2 className="modal-profile-name">{selectedUser.name}</h2>
                   <Badge text={ROLE_LABELS[selectedUser.role]} color="blue" className="mt-1" />
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
             </div>
          </div>
        </div>
      )}

      {(isEditing || isCreating) && (
        <div className="modal-overlay animate-in fade-in">
          <div className="modal-content max-w-2xl">
             <div className="modal-header">
                <h3 className="font-bold text-slate-800">{isCreating ? 'Nuovo Volontario' : 'Modifica Profilo'}</h3>
                <button onClick={closeAll} className="modal-close-btn"><X size={20} /></button>
             </div>
             
             <div className="modal-body">
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
                        {isCreating && (
                          <div className="md:col-span-2">
                            <label className="info-label">Password Iniziale</label>
                            <input type="text" required className="form-input" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
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
                          <label className="info-label">Ruolo Organizzativo</label>
                          <select 
                            className="form-select"
                            value={formData.role}
                            onChange={e => setFormData({...formData, role: e.target.value})}
                          >
                            {Object.values(ROLES).map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                          </select>
                       </div>
                       {formData.role === ROLES.BOARD && (
                         <div>
                            <label className="info-label">Incarico Direttivo</label>
                            <select 
                              className="form-select"
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
                                <label key={item} className="spec-checkbox-label">
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
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
