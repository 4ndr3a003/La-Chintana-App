import React from 'react';
import { MessageSquare, ChevronDown, Trash2, PlusCircle, MessageSquarePlus, X, Search, SlidersHorizontal, User, AlertCircle, AlertTriangle } from 'lucide-react';
import { hasAdminAccess, canManageContent, EVENT_VISIBILITY } from '../../utils/constants';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import CommunicationCard from '../../components/communications/CommunicationCard';
import CustomSelect from '../../components/ui/CustomSelect';
import { useCommunicationsView } from './CommunicationsViewLogic';
import './CommunicationsView.css';

const getTheme = (topic) => {
  switch (topic) {
    case 'Urgente':
      return {
        bg: 'bg-red-50',
        contentBg: 'bg-red-50/30',
        border: 'border-red-200',
        text: 'text-red-800',
        badge: 'bg-white text-red-800 border-red-200',
        dotColor: 'bg-red-500'
      };
    case 'Servizio':
      return {
        bg: 'bg-amber-50',
        contentBg: 'bg-amber-50/30',
        border: 'border-amber-200',
        text: 'text-amber-800',
        badge: 'bg-white text-amber-700 border-amber-200',
        dotColor: 'bg-amber-500'
      };
    case 'Formazione':
      return {
        bg: 'bg-emerald-50',
        contentBg: 'bg-emerald-50/30',
        border: 'border-emerald-200',
        text: 'text-emerald-800',
        badge: 'bg-white text-emerald-700 border-emerald-200',
        dotColor: 'bg-emerald-500'
      };
    case 'Direttivo':
      return {
        bg: 'bg-purple-50',
        contentBg: 'bg-purple-50/30',
        border: 'border-purple-200',
        text: 'text-purple-800',
        badge: 'bg-white text-purple-700 border-purple-200',
        dotColor: 'bg-purple-500'
      };
    case 'Cinofili':
      return {
        bg: 'bg-orange-50',
        contentBg: 'bg-orange-50/30',
        border: 'border-orange-200',
        text: 'text-orange-800',
        badge: 'bg-white text-orange-700 border-orange-200',
        dotColor: 'bg-orange-500'
      };
    case 'Generale':
      return {
        bg: 'bg-slate-50',
        contentBg: 'bg-slate-50/30',
        border: 'border-slate-200',
        text: 'text-slate-800',
        badge: 'bg-white text-slate-700 border-slate-200',
        dotColor: 'bg-slate-500'
      };
    default: // Altro
      return {
        bg: 'bg-blue-50',
        contentBg: 'bg-blue-50/30',
        border: 'border-blue-200',
        text: 'text-blue-800',
        badge: 'bg-white text-blue-700 border-blue-200',
        dotColor: 'bg-blue-500'
      };
  }
};

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
    handleDeleteComm,
    searchTerm,
    setSearchTerm,
    selectedMessage,
    setSelectedMessage,
    isFiltersOpen,
    toggleFilters,
    activeDropdown,
    toggleDropdown,
    setActiveDropdown,
    isDeleteModalOpen,
    confirmDeleteComm,
    cancelDeleteComm,
    openCreateModal,
    openEditModal,
    isEditing,
    isSubmitting
  } = useCommunicationsView(userProfile);

  const topicOptions = ['Generale', 'Servizio', 'Formazione', 'Urgente', 'Altro'].map(topic => ({
    value: topic,
    label: topic,
    color: getTheme(topic).dotColor
  }));

  const importanceOptions = [
    { value: 'Normale', label: 'Normale', color: 'bg-blue-500' },
    { value: 'Alta', label: 'Alta', color: 'bg-red-500' },
    { value: 'Bassa', label: 'Bassa', color: 'bg-emerald-500' }
  ];

  const visibilityOptions = Object.values(EVENT_VISIBILITY).map(v => ({
    value: v,
    label: v
  }));

  return (
    <div className="comm-container">
      <div className="comm-header mb-6">
        <div className="comm-title-row mb-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h3 className="comm-title text-xl font-bold text-slate-800 flex items-center gap-2">
              <MessageSquare className="text-blue-600" size={28} /> Comunicazioni
            </h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">{filteredMessages.length}</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          {/* Search Bar Row */}
          <div className="flex flex-row gap-3 mb-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Cerca comunicazione..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Desktop Filters */}
            <div className="hidden md:flex gap-2">
              {/* Topic Filter */}
              <div className="relative filter-dropdown-container">
                <button
                  onClick={() => toggleDropdown('topic')}
                  className="flex items-center justify-between w-48 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm h-full"
                >
                  <span className="truncate">{filterTopic === 'Tutti' ? 'Tutti gli argomenti' : filterTopic}</span>
                  <ChevronDown className={`text-slate-400 transition-transform duration-200 ${activeDropdown === 'topic' ? 'rotate-180' : ''}`} size={16} />
                </button>

                {activeDropdown === 'topic' && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-1">
                      <button
                        onClick={() => { setFilterTopic('Tutti'); setActiveDropdown(null); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filterTopic === 'Tutti' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        Tutti gli argomenti
                      </button>
                      <div className="h-px bg-slate-100 my-1"></div>
                      {['Generale', 'Servizio', 'Formazione', 'Urgente', 'Direttivo', 'Cinofili', 'Altro'].map((topic) => {
                        const theme = getTheme(topic);
                        return (
                          <button
                            key={topic}
                            onClick={() => { setFilterTopic(topic); setActiveDropdown(null); }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filterTopic === topic ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${theme.dotColor}`}></span>
                            <span className={filterTopic === topic ? 'text-slate-900' : 'text-slate-600'}>{topic}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Importance Filter */}
              <div className="relative filter-dropdown-container">
                <button
                  onClick={() => toggleDropdown('importance')}
                  className="flex items-center justify-between w-40 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm h-full"
                >
                  <span className="truncate">{filterImportance === 'Tutte' ? 'Tutte le priorità' : filterImportance}</span>
                  <ChevronDown className={`text-slate-400 transition-transform duration-200 ${activeDropdown === 'importance' ? 'rotate-180' : ''}`} size={16} />
                </button>

                {activeDropdown === 'importance' && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-1">
                      <button
                        onClick={() => { setFilterImportance('Tutte'); setActiveDropdown(null); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filterImportance === 'Tutte' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        Tutte le priorità
                      </button>
                      <div className="h-px bg-slate-100 my-1"></div>
                      {[
                        { val: 'Alta', color: 'bg-red-500' },
                        { val: 'Normale', color: 'bg-blue-500' },
                        { val: 'Bassa', color: 'bg-emerald-500' }
                      ].map((item) => (
                        <button
                          key={item.val}
                          onClick={() => { setFilterImportance(item.val); setActiveDropdown(null); }}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filterImportance === item.val ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${item.color}`}></span>
                          <span className={filterImportance === item.val ? 'text-slate-900' : 'text-slate-600'}>{item.val}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {canManageContent(userProfile) && (
              <button
                onClick={openCreateModal}
                className="hidden lg:flex items-center gap-2 bg-blue-600 dark:bg-[#facc15] hover:bg-blue-700 text-white dark:!text-[#0f172a] px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md active:scale-95 shrink-0 ml-auto"
              >
                <MessageSquarePlus size={18} />
                Nuova
              </button>
            )}
          </div>

          {/* Mobile Filters Toggle */}
          <div className="relative md:hidden">
            <button
              onClick={toggleFilters}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 bg-white"
            >
              <span className="font-bold text-slate-700">Filtri</span>
              <SlidersHorizontal className="text-slate-500" size={20} />
            </button>

            {isFiltersOpen && (
              <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-xl mt-2 shadow-lg z-10 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex flex-col gap-3">
                  <p className="font-bold text-sm text-slate-500 px-1">Argomento</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => { setFilterTopic('Tutti'); toggleFilters(); }}
                      className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all border whitespace-nowrap ${filterTopic === 'Tutti' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                      Tutti
                    </button>
                    {['Generale', 'Servizio', 'Formazione', 'Urgente', 'Direttivo', 'Cinofili', 'Altro'].map((topic) => {
                      const isSelected = filterTopic === topic;
                      const theme = getTheme(topic);

                      let buttonClass = '';
                      if (isSelected) {
                        buttonClass = `${theme.dotColor} text-white border-transparent shadow-md`;
                      } else {
                        buttonClass = `${theme.bg} ${theme.text} ${theme.border}`;
                      }

                      return (
                        <button
                          key={topic}
                          onClick={() => { setFilterTopic(topic); toggleFilters(); }}
                          className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all border whitespace-nowrap ${buttonClass} hover:brightness-95`}
                        >
                          {topic}
                        </button>
                      );
                    })}
                  </div>
                  <div className="w-full h-px bg-slate-200 my-2"></div>
                  <p className="font-bold text-sm text-slate-500 px-1">Priorità</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => { setFilterImportance('Tutte'); toggleFilters(); }}
                      className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all border whitespace-nowrap ${filterImportance === 'Tutte' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                      Tutte
                    </button>
                    {['Alta', 'Normale', 'Bassa'].map((imp) => {
                      const isSelected = filterImportance === imp;
                      return (
                        <button
                          key={imp}
                          onClick={() => { setFilterImportance(imp); toggleFilters(); }}
                          className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all border whitespace-nowrap ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                        >
                          {imp}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="comm-list space-y-4">
        {filteredMessages.length === 0 ? (
          <Card className="empty-state">
            <div className="empty-icon-wrapper">
              <MessageSquare size={32} />
            </div>
            <p className="empty-text">Nessuna comunicazione trovata.</p>
          </Card>
        ) : (
          filteredMessages.map(msg => (
            <CommunicationCard
              key={msg.id}
              message={msg}
              userProfile={userProfile}
              onDelete={canManageContent(userProfile) ? handleDeleteComm : undefined}
              onEdit={canManageContent(userProfile) ? openEditModal : undefined}
              onClick={() => setSelectedMessage(msg)}
            />
          ))
        )}
      </div>

      {canManageContent(userProfile) && (
        <button
          onClick={openCreateModal}
          className="fixed right-6 bottom-24 lg:hidden w-14 h-14 bg-blue-600 dark:bg-[#facc15] text-white dark:!text-[#0f172a] rounded-full shadow-lg flex items-center justify-center z-40 transition-transform active:scale-95"
        >
          <MessageSquarePlus size={28} />
        </button>
      )}

      {/* View Details Modal */}
      {selectedMessage && (
        <div className="modal-overlay animate-in fade-in" onClick={() => setSelectedMessage(null)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Dettagli Comunicazione</h3>
              <button onClick={() => setSelectedMessage(null)} className="modal-close-btn"><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold text-slate-800">{selectedMessage.title}</h2>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded-md border ${getTheme(selectedMessage.topic).badge}`}>
                      {selectedMessage.topic}
                    </span>
                    {selectedMessage.importance === 'Alta' && (
                      <span className="flex items-center gap-1 text-xs font-bold uppercase px-2 py-1 rounded-md bg-red-100 text-red-700 border border-red-200">
                        <AlertCircle size={12} /> Importante
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500 border-b border-slate-100 pb-4">
                  <User size={16} />
                  <span>Scritto da <strong>{selectedMessage.authorName}</strong></span>
                  <span className="mx-1">•</span>
                  <span>{new Date(selectedMessage.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-100">
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{selectedMessage.content}</p>
                </div>

                {canManageContent(userProfile) && (
                  <div className="flex justify-end pt-2">
                    <Button
                      variant="danger"
                      onClick={() => {
                        handleDeleteComm(selectedMessage.id);
                        setSelectedMessage(null);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Trash2 size={16} /> Elimina
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay animate-in fade-in" onClick={cancelDeleteComm}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="text-amber-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Elimina Comunicazione</h3>
              <p className="text-slate-500 mb-6">
                Sei sicuro di voler eliminare questa comunicazione? Questa azione non può essere annullata.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={cancelDeleteComm}
                  className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={confirmDeleteComm}
                  className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Elimina
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <div className="modal-overlay animate-in fade-in" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{isEditing ? 'Modifica Comunicazione' : 'Nuova Comunicazione'}</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="modal-close-btn"><X size={20} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateComm} className="form-space">
                <div>
                  <label className="form-label">Titolo</label>
                  <input type="text" className="form-input" value={newComm.title} onChange={e => setNewComm({ ...newComm, title: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Argomento</label>
                    <CustomSelect
                      options={topicOptions}
                      value={newComm.topic}
                      onChange={val => setNewComm({ ...newComm, topic: val })}
                      placeholder="Seleziona argomento"
                    />
                  </div>
                  <div>
                    <label className="form-label">Importanza</label>
                    <CustomSelect
                      options={importanceOptions}
                      value={newComm.importance}
                      onChange={val => setNewComm({ ...newComm, importance: val })}
                      placeholder="Seleziona importanza"
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Visibilità</label>
                  <CustomSelect
                    options={visibilityOptions}
                    value={newComm.visibility}
                    onChange={val => setNewComm({ ...newComm, visibility: val })}
                    placeholder="Seleziona visibilità"
                  />
                </div>
                <div>
                  <label className="form-label">Scadenza (opzionale)</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newComm.expirationDate}
                    onChange={e => setNewComm({ ...newComm, expirationDate: e.target.value })}
                  />
                  <p className="text-xs text-slate-400 mt-1">Se impostata, la comunicazione non sarà più visibile dopo questa data.</p>
                </div>
                <div>
                  <label className="form-label">Contenuto</label>
                  <textarea className="form-textarea" rows="5" value={newComm.content} onChange={e => setNewComm({ ...newComm, content: e.target.value })} required></textarea>
                </div>
                <div className="form-submit-wrapper">
                  <Button type="submit" className="form-submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Pubblicazione...' : 'Pubblica'}
                  </Button>
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