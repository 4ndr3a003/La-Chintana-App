import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import Avatar from '../ui/Avatar';

const CommunicationItem = ({ comm }) => {
  const dateObj = new Date(comm.date);

  const getTheme = (topic) => {
    switch (topic) {
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

  const theme = getTheme(comm.topic);

  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate('/comms')}
      className={`bg-white ${theme.borderColor} border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group overflow-hidden`}
    >
      {/* Header Colorato */}
      <div className={`${theme.headerBg} px-4 py-2 flex justify-between items-center gap-3`}>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${theme.badge} whitespace-nowrap`}>
            {comm.topic}
          </span>
          {comm.importance === 'Alta' && (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-red-100 text-red-700 border border-red-200">
              <AlertCircle size={10} /> Importante
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-500 font-medium">
          {dateObj.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="text-base font-bold text-slate-800 mb-1 leading-tight">{comm.title}</h3>
        <p className="text-slate-600 text-sm mb-3 line-clamp-2">{comm.content}</p>

        <div className="flex items-center gap-2">
          <Avatar
            src={comm.authorPhotoURL}
            name={comm.authorName}
            size="xs"
            className="w-5 h-5"
          />
          <span className="text-xs text-slate-400 font-medium">
            {comm.authorName}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommunicationItem;
