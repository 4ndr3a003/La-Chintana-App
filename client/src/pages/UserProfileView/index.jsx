import React from 'react';
import { Camera, Mail, Phone, User, MapPin, FileText, Home, Shield, LogOut } from 'lucide-react';
import { ROLE_LABELS } from '../../utils/constants';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import { useUserProfileView } from './UserProfileViewLogic';

const UserProfileView = ({ userProfile, onLogout }) => {
  const {
    uploading,
    handlePhotoUpload,
    groupedSpecs,
    otherSpecs
  } = useUserProfileView(userProfile);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-50 to-transparent"></div>
        <div className="relative z-10 -mt-4 group">
          <div className="relative inline-block">
             <Avatar src={userProfile.photoUrl} name={userProfile.name} size="xl" className="ring-4 ring-white shadow-lg mb-4 mx-auto" />
             <label className="absolute bottom-4 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-all hover:scale-110">
               <Camera size={16} />
               <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} />
             </label>
             {uploading && <div className="absolute inset-0 bg-white/50 rounded-full flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div></div>}
          </div>
          <h2 className="text-2xl font-black text-slate-800">{userProfile.name}</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">{ROLE_LABELS[userProfile.role]}</p>
          {userProfile.boardRole && <Badge text={userProfile.boardRole} color="purple" className="mt-2" />}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card header="Dati Personali" className="h-full">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <Mail className="text-slate-400" size={20} />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                <p className="font-medium text-slate-700 break-all">{userProfile.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
               <Phone className="text-slate-400" size={20} />
               <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase">Telefono</p>
                 <p className="font-medium text-slate-700">{userProfile.phone || '-'}</p>
               </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
               <User className="text-slate-400" size={20} />
               <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase">Data di Nascita</p>
                 <p className="font-medium text-slate-700">{userProfile.birthDate ? new Date(userProfile.birthDate).toLocaleDateString('it-IT') : '-'}</p>
               </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
               <MapPin className="text-slate-400" size={20} />
               <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase">Luogo di Nascita</p>
                 <p className="font-medium text-slate-700">{userProfile.birthPlace || '-'}</p>
               </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
               <FileText className="text-slate-400" size={20} />
               <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase">Codice Fiscale</p>
                 <p className="font-medium text-slate-700 uppercase">{userProfile.cf || '-'}</p>
               </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
               <Home className="text-slate-400" size={20} />
               <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase">Residenza</p>
                 <p className="font-medium text-slate-700">{userProfile.city || '-'}</p>
               </div>
            </div>
          </div>
        </Card>

        <Card header="Specializzazioni" className="h-full">
          {(!userProfile.specializations || userProfile.specializations.length === 0) ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
               <Shield size={32} className="mb-2 opacity-20" />
               <p className="text-sm italic">Nessuna specializzazione registrata.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(groupedSpecs).map(([category, data]) => (
                <div key={category} className="bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                  <h5 className={`text-xs font-bold uppercase mb-3 flex items-center gap-2 p-2 rounded-lg border ${data.color}`}>
                    {data.icon} {category}
                  </h5>
                  <div className="flex flex-wrap gap-2 px-1">
                    {data.items.map(item => (
                      <span key={item} className={`px-2.5 py-1 rounded-lg text-xs font-bold border shadow-sm ${data.color}`}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              
              {otherSpecs.length > 0 && (
                <div>
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Altro</h5>
                  <div className="flex flex-wrap gap-2">
                    {otherSpecs.map(item => (
                      <Badge key={item} text={item} color="gray" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      <button onClick={onLogout} className="w-full py-4 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
        <LogOut size={20} /> Esci dal Profilo
      </button>
    </div>
  );
};

export default UserProfileView;