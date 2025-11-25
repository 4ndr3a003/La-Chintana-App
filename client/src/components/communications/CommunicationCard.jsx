import React from 'react';
import { Trash2, AlertCircle, Pencil } from 'lucide-react';
import { hasAdminAccess } from '../../utils/constants';
import Avatar from '../ui/Avatar';

const CommunicationCard = ({ message, userProfile, onDelete, onEdit, onClick }) => {
  const dateObj = new Date(message.date);
  const isAdmin = hasAdminAccess(userProfile);

  const getTheme = (topic) => {
    switch(topic) {
      case 'Urgente':
        return {
          headerBg: 'bg-red-100',
          headerText: 'text-red-900',
          borderColor: 'border-red-200',
          badge: 'bg-white/80 text-red-800 border-red-200',
        };
      case 'Servizio':
        return {
          headerBg: 'bg-amber-100',
          headerText: 'text-amber-900',
          borderColor: 'border-amber-200',
          badge: 'bg-white/80 text-amber-800 border-amber-200',
        };
      case 'Formazione':
        return {
          headerBg: 'bg-emerald-100',
          headerText: 'text-emerald-900',
          borderColor: 'border-emerald-200',
          badge: 'bg-white/80 text-emerald-800 border-emerald-200',
        };
      case 'Direttivo':
        return {
          headerBg: 'bg-purple-100',
          headerText: 'text-purple-900',
          borderColor: 'border-purple-200',
          badge: 'bg-white/80 text-purple-800 border-purple-200',
        };
      case 'Generale':
        return {
          headerBg: 'bg-slate-100',
          headerText: 'text-slate-900',
          borderColor: 'border-slate-200',
          badge: 'bg-white/80 text-slate-800 border-slate-200',
        };
      default: // Altro
        return {
          headerBg: 'bg-blue-100',
          headerText: 'text-blue-900',
          borderColor: 'border-blue-200',
          badge: 'bg-white/80 text-blue-800 border-blue-200',
        };
    }
  };

  const theme = getTheme(message.topic);

  return (
    <div 
      onClick={onClick}
      className={`bg-white ${theme.borderColor} rounded-xl shadow-sm border overflow-hidden flex flex-col hover:shadow-md transition-all duration-300 cursor-pointer group`}
    >
      {/* Header Colorato */}
      <div className={`${theme.headerBg} px-4 py-3 border-b ${theme.borderColor} flex justify-between items-start gap-3`}>
        <h3 className={`text-lg font-bold ${theme.headerText} leading-tight`}>{message.title}</h3>
        <div className="flex flex-col items-end gap-1 shrink-0">
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${theme.badge} whitespace-nowrap`}>
                {message.topic}
            </span>
            {message.importance === 'Alta' && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-red-100 text-red-700 border border-red-200">
                    <AlertCircle size={10} /> Importante
                </span>
            )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-grow">
        <p className="text-slate-600 text-sm mb-4 whitespace-pre-wrap line-clamp-3">{message.content}</p>
        
        <div className="mt-auto flex justify-between items-center pt-3 border-t border-slate-100">
            <div className="flex items-center gap-3">
                <Avatar 
                    src={message.authorPhotoURL} 
                    name={message.authorName} 
                    size="xs"
                    className="w-6 h-6"
                />
                <div className="text-[10px] text-slate-400 font-medium">
                    {dateObj.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
            
            {isAdmin && (
                <div className="flex gap-1">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(message);
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Modifica comunicazione"
                    >
                        <Pencil size={16} />
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(message.id);
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Elimina comunicazione"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default CommunicationCard;
