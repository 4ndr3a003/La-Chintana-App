import React from 'react';
import { Camera, LogOut } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import { useUserProfileView } from './UserProfileViewLogic';
import './UserProfileView.css';

const UserProfileView = ({ userProfile, onLogout }) => {
  const {
    uploading,
    handlePhotoUpload,
    groupedSpecs,
    otherSpecs,
    status
  } = useUserProfileView(userProfile);

  // Helper to format dates
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  return (
    <div className="min-h-screen bg-[var(--color-slate-50)] p-4 md:p-8 font-sans">
      <h1 className="text-3xl font-extrabold text-[var(--color-slate-900)] mb-8">Profilo Volontario</h1>

      {/* Top Card: Profile Header */}
      <div className="bg-white rounded-3xl shadow-sm p-6 mb-6 flex flex-col md:flex-row items-center md:items-start gap-6 border border-[var(--color-slate-100)]">
        {/* Avatar Section */}
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--color-slate-50)] shadow-sm">
             <Avatar src={userProfile.photoUrl} name={userProfile.name} size="xl" className="w-full h-full object-cover" />
          </div>
          <label className="absolute bottom-0 right-0 bg-[var(--color-slate-800)] text-white p-2 rounded-full cursor-pointer hover:bg-[var(--color-slate-700)] transition-colors shadow-md">
            <Camera size={16} />
            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} />
          </label>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 text-center md:text-left mt-2">
           <h2 className="text-2xl font-bold text-[var(--color-slate-900)] mb-1">{userProfile.name}</h2>
           <p className="text-[var(--color-slate-500)] font-medium mb-1">Codice Identificativo Emercomnet: <span className="font-bold text-[var(--color-slate-700)]">{userProfile.emercomnetId || '-'}</span></p>
           <p className={`font-bold ${status === 'Non Operativo' ? 'text-[var(--color-pc-red)]' : 'text-[var(--color-pc-green)]'}`}>
             Stato: {status}
           </p>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Dati Personali */}
        <div className="bg-white rounded-3xl shadow-sm p-8 border border-[var(--color-slate-100)] relative">
           <div className="flex justify-between items-center mb-8">
             <h3 className="text-xl font-bold text-[var(--color-slate-900)]">Dati Personali</h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-4">
              <div>
                 <p className="text-sm text-[var(--color-slate-400)] mb-1">Data di Nascita</p>
                 <p className="font-semibold text-[var(--color-slate-800)] text-lg">{formatDate(userProfile.birthDate)}</p>
              </div>
              <div>
                 <p className="text-sm text-[var(--color-slate-400)] mb-1">Codice Fiscale</p>
                 <p className="font-semibold text-[var(--color-slate-800)] text-lg uppercase">{userProfile.cf || '-'}</p>
              </div>
              <div>
                 <p className="text-sm text-[var(--color-slate-400)] mb-1">Luogo di Nascita</p>
                 <p className="font-semibold text-[var(--color-slate-800)] text-lg">{userProfile.birthPlace || '-'}</p>
              </div>
              <div>
                 <p className="text-sm text-[var(--color-slate-400)] mb-1">Residenza</p>
                 <p className="font-semibold text-[var(--color-slate-800)] text-lg">{userProfile.city || '-'}</p>
              </div>
           </div>
        </div>

        {/* Informazioni di Contatto */}
        <div className="bg-white rounded-3xl shadow-sm p-8 border border-[var(--color-slate-100)] relative">
           <div className="flex justify-between items-center mb-8">
             <h3 className="text-xl font-bold text-[var(--color-slate-900)]">Informazioni di Contatto</h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-4">
              <div className="md:col-span-2">
                 <p className="text-sm text-[var(--color-slate-400)] mb-1">Email</p>
                 <p className="font-semibold text-[var(--color-slate-800)] text-lg break-all">{userProfile.email}</p>
              </div>
              <div>
                 <p className="text-sm text-[var(--color-slate-400)] mb-1">Telefono</p>
                 <p className="font-semibold text-[var(--color-slate-800)] text-lg">{userProfile.phone || '-'}</p>
              </div>
           </div>
        </div>
      </div>

      {/* Bottom Card: Specializzazioni e Patenti */}
      <div className="bg-white rounded-3xl shadow-sm p-8 border border-[var(--color-slate-100)] relative mb-6">
         <div className="flex justify-between items-center mb-8">
           <h3 className="text-xl font-bold text-[var(--color-slate-900)]">Specializzazioni e Patenti</h3>
         </div>
         
         <div className="space-y-6">
            {Object.entries(groupedSpecs).length > 0 || otherSpecs.length > 0 ? (
              <>
                {Object.entries(groupedSpecs).map(([category, data]) => (
                  <div key={category} className="border-b border-[var(--color-slate-50)] last:border-0 pb-4 last:pb-0">
                    <h5 className="text-sm font-bold text-[var(--color-slate-500)] uppercase mb-3 flex items-center gap-2">
                      {data.icon} {category}
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {data.items.map(item => (
                        <span key={item} className={`px-3 py-1.5 rounded-lg text-sm font-bold border ${data.color}`}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                {otherSpecs.length > 0 && (
                  <div className="border-b border-[var(--color-slate-50)] last:border-0 pb-4 last:pb-0">
                    <h5 className="text-sm font-bold text-[var(--color-slate-500)] uppercase mb-3">Altro</h5>
                    <div className="flex flex-wrap gap-2">
                      {otherSpecs.map(item => (
                        <span key={item} className="px-3 py-1.5 rounded-lg text-sm font-bold border bg-slate-50 text-slate-700 border-slate-100">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-[var(--color-slate-400)] italic">
                Nessuna specializzazione o patente registrata.
              </div>
            )}
         </div>
      </div>

      <button onClick={onLogout} className="w-full py-4 rounded-3xl bg-[var(--color-pc-red-100)] text-[var(--color-pc-red-700)] font-bold flex items-center justify-center gap-2 hover:bg-[var(--color-pc-red-200)] transition-all shadow-sm">
        <LogOut size={20} /> Esci dal Profilo
      </button>
    </div>
  );
};

export default UserProfileView;