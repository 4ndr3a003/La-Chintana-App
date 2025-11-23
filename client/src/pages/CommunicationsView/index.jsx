import React from 'react';
import { MessageSquare, ChevronDown, Trash2, PlusCircle, X } from 'lucide-react';
import { hasAdminAccess } from '../../utils/constants';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useCommunicationsView } from './CommunicationsViewLogic';

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
    <div className="space-y-6 relative min-h-[80vh]">
      <div className="flex flex-col gap-4 px-1">
         <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare className="text-blue-600" size={20} /> Comunicazioni
            </h3>
         </div>
         
         <div className="flex gap-2 overflow-x-auto pb-2">
            <div className="relative min-w-[140px]">
                <select 
                    className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-4 py-2.5 pr-8 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer shadow-sm"
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
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>
            <div className="relative min-w-[140px]">
                <select 
                    className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-4 py-2.5 pr-8 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer shadow-sm"
                    value={filterImportance}
                    onChange={(e) => setFilterImportance(e.target.value)}
                >
                    <option value="Tutte">Tutte le priorità</option>
                    <option value="Alta">Alta</option>
                    <option value="Normale">Normale</option>
                    <option value="Bassa">Bassa</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>
         </div>
      </div>

      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
            <Card className="text-center py-16 border-dashed">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                <MessageSquare size={32} />
              </div>
              <p className="text-slate-400 text-sm font-medium">Nessuna comunicazione trovata.</p>
            </Card>
        ) : (
            filteredMessages.map(msg => (
              <Card key={msg.id} className={`border-l-4 ${msg.importance === 'Alta' ? 'border-l-red-500' : msg.importance === 'Bassa' ? 'border-l-emerald-500' : 'border-l-blue-500'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <Badge text={msg.topic} color="gray" className="text-[10px]" />
                        {msg.importance === 'Alta' && <Badge text="Importante" color="red" className="text-[10px]" />}
                    </div>
                    <h4 className="font-bold text-slate-800 text-lg">{msg.title}</h4>
                  </div>
                  {hasAdminAccess(userProfile) && (
                    <button onClick={() => handleDeleteComm(msg.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <p className="text-slate-600 text-sm mb-3 whitespace-pre-wrap">{msg.content}</p>
                <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                    <div className="text-xs text-slate-400 font-medium">
                    {new Date(msg.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-xs text-slate-400 font-medium italic">
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
          className="fixed bottom-32 right-6 md:bottom-10 md:right-10 bg-blue-600 text-white p-4 rounded-full shadow-xl shadow-blue-300 hover:bg-blue-700 hover:scale-110 transition-all z-40"
        >
          <PlusCircle size={28} />
        </button>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Nuova Comunicazione</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1 rounded-full hover:bg-slate-200 text-slate-500"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleCreateComm} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Titolo</label>
                  <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={newComm.title} onChange={e => setNewComm({...newComm, title: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Argomento</label>
                        <div className="relative">
                            <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none focus:ring-2 focus:ring-blue-500" value={newComm.topic} onChange={e => setNewComm({...newComm, topic: e.target.value})}>
                                <option>Generale</option>
                                <option>Servizio</option>
                                <option>Formazione</option>
                                <option>Urgente</option>
                                <option>Direttivo</option>
                                <option>Altro</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Importanza</label>
                        <div className="relative">
                            <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none focus:ring-2 focus:ring-blue-500" value={newComm.importance} onChange={e => setNewComm({...newComm, importance: e.target.value})}>
                                <option>Normale</option>
                                <option>Alta</option>
                                <option>Bassa</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Contenuto</label>
                  <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" rows="5" value={newComm.content} onChange={e => setNewComm({...newComm, content: e.target.value})} required></textarea>
                </div>
                <div className="pt-2">
                  <Button type="submit" className="w-full justify-center">Pubblica</Button>
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