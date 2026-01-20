import React from 'react';
import { Trash2, AlertCircle, Pencil, Briefcase, BookOpen, Users, Megaphone, Info } from 'lucide-react';
import { hasAdminAccess } from '../../utils/constants';
import Avatar from '../ui/Avatar';

const CommunicationCard = ({ message, userProfile, onDelete, onEdit, onClick }) => {
  const dateObj = new Date(message.date);
  const isAdmin = hasAdminAccess(userProfile?.uid);

  const getTheme = (topic, importance) => {
    let theme = {};
    switch (topic) {
      case 'Urgente':
        theme = {
          headerBg: 'bg-red-100',
          headerText: 'text-red-900',
          borderColor: 'border-red-200',
          badge: 'bg-white/80 text-red-800 border-red-200',
          icon: <AlertCircle size={18} className="text-red-400" />
        };
        break;
      case 'Servizio':
        theme = {
          headerBg: 'bg-amber-100',
          headerText: 'text-amber-900',
          borderColor: 'border-amber-200',
          badge: 'bg-white/80 text-amber-800 border-amber-200',
          icon: <Briefcase size={18} className="text-amber-400" />
        };
        break;
      case 'Formazione':
        theme = {
          headerBg: 'bg-emerald-100',
          headerText: 'text-emerald-900',
          borderColor: 'border-emerald-200',
          badge: 'bg-white/80 text-emerald-800 border-emerald-200',
          icon: <BookOpen size={18} className="text-emerald-400" />
        };
        break;
      case 'Direttivo':
        theme = {
          headerBg: 'bg-purple-100',
          headerText: 'text-purple-900',
          borderColor: 'border-purple-200',
          badge: 'bg-white/80 text-purple-800 border-purple-200',
          icon: <Users size={18} className="text-purple-400" />
        };
        break;
      case 'Generale':
        theme = {
          headerBg: 'bg-slate-100',
          headerText: 'text-slate-900',
          borderColor: 'border-slate-200',
          badge: 'bg-white/80 text-slate-800 border-slate-200',
          icon: <Megaphone size={18} className="text-slate-400" />
        };
        break;
      default: // Altro
        theme = {
          headerBg: 'bg-blue-100',
          headerText: 'text-blue-900',
          borderColor: 'border-blue-200',
          badge: 'bg-white/80 text-blue-800 border-blue-200',
          icon: <Info size={18} className="text-blue-400" />
        };
    }
    if (importance === 'Alta') {
      return {
        ...theme,
        card: 'border-2 shadow-lg shadow-red-500/20',
        headerBg: 'bg-red-500',
        headerText: 'text-white',
        badge: 'bg-white/90 text-red-800 border-red-200 font-bold',
        icon: <AlertCircle size={18} className="text-white" />
      };
    }
    return theme;
  };

  const theme = getTheme(message.topic, message.importance);

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-3xl overflow-hidden flex flex-col hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)] transition-all duration-300 cursor-pointer group ${theme.borderColor} ${theme.card || 'border'}`}
    >
      {/* Header Colorato */}
      <div className={`${theme.headerBg} px-4 py-3 border-b ${theme.borderColor} flex justify-between items-start gap-3`}>
        <div className="flex items-center gap-3">
          {theme.icon}
          <h3 className={`text-lg font-bold ${theme.headerText} leading-tight`}>{message.title}</h3>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${theme.badge} whitespace-nowrap`}>
            {message.topic}
          </span>
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
