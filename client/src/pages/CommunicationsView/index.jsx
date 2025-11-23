import React from 'react';
import { MessageSquare, ChevronDown, Trash2, PlusCircle, X } from 'lucide-react';
import { hasAdminAccess } from '../../utils/constants';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useCommunicationsView } from './CommunicationsViewLogic';
import './CommunicationsView.css';

const CommunicationsView = ({ userProfile }) => {
  const {
    isCreateModalOpen,
    filterTopic,
    filterImportance,
    newComm,
    filteredMessages,
    setFilterTopic,
    setFilterImportance,
    setNewComm,
    setIsCreateModalOpen,
    handleCreateComm,
    handleDeleteComm
  } = useCommunicationsView(userProfile);

  return (
    <div className="comm-container">
      <div className="comm-header">
         <div className="comm-title-row">
            <h3 className="comm-title">
                <MessageSquare className="text-blue-600" size={20} /> Comunicazioni
            </h3>
         </div>
         
         <div className="filter-row">
            <div className="filter-select-wrapper">
                <select 
                    className="filter-select"
                    value={filterTopic}
                    onChange={(e) => setFilterTopic(e.target.value)}
                >
                    <option value="Tutti">Tutti gli argomenti</option>
                    <option>Generale</option>
                    <option>Servizio</option>
                    <option>Formazione</option>
                    <option>Urgente</option>
                    <option>Direttivo</option>
                    <option>Altro</option>
                </select>
                <ChevronDown className="filter-icon" size={14} />
            </div>
            <div className="filter-select-wrapper">
                <select 
                    className="filter-select"
                    value={filterImportance}
                    onChange={(e) => setFilterImportance(e.target.value)}
                >
                    <option value="Tutte">Tutte le priorità</option>
                    <option value="Alta">Alta</option>
                    <option value="Normale">Normale</option>
                    <option value="Bassa">Bassa</option>
                </select>
                <ChevronDown className="filter-icon" size={14} />
            </div>
         </div>
      </div>

      <div className="comm-list">
        {filteredMessages.length === 0 ? (
            <Card className="empty-state">
              <div className="empty-icon-wrapper">
                <MessageSquare size={32} />
              </div>
              <p className="empty-text">Nessuna comunicazione trovata.</p>
            </Card>
        ) : (
            filteredMessages.map(msg => (
              <Card key={msg.id} className={`border-l-4 ${msg.importance === 'Alta' ? 'border-l-red-500' : msg.importance === 'Bassa' ? 'border-l-emerald-500' : 'border-l-blue-500'}`}>
                <div className="comm-card-header">
                  <div className="comm-card-content">
                    <div className="comm-card-badges">
                        <Badge text={msg.topic} color="gray" className="text-[10px]" />
                        {msg.importance === 'Alta' && <Badge text="Importante" color="red" className="text-[10px]" />}
                    </div>
                    <h4 className="comm-card-title">{msg.title}</h4>
                  </div>
                  {hasAdminAccess(userProfile) && (
                    <button onClick={() => handleDeleteComm(msg.id)} className="delete-btn">
                        <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <p className="comm-card-body">{msg.content}</p>
                <div className="comm-card-footer">
                    <div className="comm-date">
                    {new Date(msg.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="comm-author">
                        Scritto da: {msg.authorName}
                    </div>
                </div>
              </Card>
            ))
        )}
      </div>

      {hasAdminAccess(userProfile) && (
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="fab-btn"
        >
          <PlusCircle size={28} />
        </button>
      )}

      {isCreateModalOpen && (
        <div className="modal-overlay animate-in fade-in">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">Nuova Comunicazione</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="modal-close-btn"><X size={20} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateComm} className="form-space">
                <div>
                  <label className="form-label">Titolo</label>
                  <input type="text" className="form-input" value={newComm.title} onChange={e => setNewComm({...newComm, title: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="form-label">Argomento</label>
                        <div className="form-select-wrapper">
                            <select className="form-select" value={newComm.topic} onChange={e => setNewComm({...newComm, topic: e.target.value})}>
                                <option>Generale</option>
                                <option>Servizio</option>
                                <option>Formazione</option>
                                <option>Urgente</option>
                                <option>Direttivo</option>
                                <option>Altro</option>
                            </select>
                            <ChevronDown className="filter-icon" size={16} />
                        </div>
                    </div>
                    <div>
                        <label className="form-label">Importanza</label>
                        <div className="form-select-wrapper">
                            <select className="form-select" value={newComm.importance} onChange={e => setNewComm({...newComm, importance: e.target.value})}>
                                <option>Normale</option>
                                <option>Alta</option>
                                <option>Bassa</option>
                            </select>
                            <ChevronDown className="filter-icon" size={16} />
                        </div>
                    </div>
                </div>
                <div>
                  <label className="form-label">Contenuto</label>
                  <textarea className="form-textarea" rows="5" value={newComm.content} onChange={e => setNewComm({...newComm, content: e.target.value})} required></textarea>
                </div>
                <div className="form-submit-wrapper">
                  <Button type="submit" className="form-submit-btn">Pubblica</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationsView;