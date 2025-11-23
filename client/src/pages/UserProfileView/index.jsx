import React from 'react';
import { Camera, Mail, Phone, User, MapPin, FileText, Home, Shield, LogOut } from 'lucide-react';
import { ROLE_LABELS } from '../../utils/constants';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import { useUserProfileView } from './UserProfileViewLogic';
import './UserProfileView.css';

const UserProfileView = ({ userProfile, onLogout }) => {
  const {
    uploading,
    handlePhotoUpload,
    groupedSpecs,
    otherSpecs
  } = useUserProfileView(userProfile);

  return (
    <div className="profile-container">
      <div className="profile-header-card">
        <div className="profile-header-bg"></div>
        <div className="profile-avatar-wrapper group">
          <div className="profile-avatar-container">
             <Avatar src={userProfile.photoUrl} name={userProfile.name} size="xl" className="profile-avatar-img" />
             <label className="upload-btn">
               <Camera size={16} />
               <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} />
             </label>
             {uploading && <div className="upload-spinner-overlay"><div className="upload-spinner"></div></div>}
          </div>
          <h2 className="profile-name">{userProfile.name}</h2>
          <p className="profile-role">{ROLE_LABELS[userProfile.role]}</p>
          {userProfile.boardRole && <Badge text={userProfile.boardRole} color="purple" className="mt-2" />}
        </div>
      </div>

      <div className="profile-grid">
        <Card header="Dati Personali" className="h-full">
          <div className="info-list">
            <div className="info-item">
              <Mail className="info-icon" size={20} />
              <div>
                <p className="info-label">Email</p>
                <p className="info-value-break">{userProfile.email}</p>
              </div>
            </div>
            <div className="info-item">
               <Phone className="info-icon" size={20} />
               <div>
                 <p className="info-label">Telefono</p>
                 <p className="info-value">{userProfile.phone || '-'}</p>
               </div>
            </div>

            <div className="info-item">
               <User className="info-icon" size={20} />
               <div>
                 <p className="info-label">Data di Nascita</p>
                 <p className="info-value">{userProfile.birthDate ? new Date(userProfile.birthDate).toLocaleDateString('it-IT') : '-'}</p>
               </div>
            </div>

            <div className="info-item">
               <MapPin className="info-icon" size={20} />
               <div>
                 <p className="info-label">Luogo di Nascita</p>
                 <p className="info-value">{userProfile.birthPlace || '-'}</p>
               </div>
            </div>

            <div className="info-item">
               <FileText className="info-icon" size={20} />
               <div>
                 <p className="info-label">Codice Fiscale</p>
                 <p className="info-value-upper">{userProfile.cf || '-'}</p>
               </div>
            </div>

            <div className="info-item">
               <Home className="info-icon" size={20} />
               <div>
                 <p className="info-label">Residenza</p>
                 <p className="info-value">{userProfile.city || '-'}</p>
               </div>
            </div>
          </div>
        </Card>

        <Card header="Specializzazioni" className="h-full">
          {(!userProfile.specializations || userProfile.specializations.length === 0) ? (
            <div className="specs-empty">
               <Shield size={32} className="specs-empty-icon" />
               <p className="specs-empty-text">Nessuna specializzazione registrata.</p>
            </div>
          ) : (
            <div className="specs-list">
              {Object.entries(groupedSpecs).map(([category, data]) => (
                <div key={category} className="spec-category-card">
                  <h5 className={`spec-category-title ${data.color}`}>
                    {data.icon} {category}
                  </h5>
                  <div className="spec-items-wrapper">
                    {data.items.map(item => (
                      <span key={item} className={`spec-item ${data.color}`}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              
              {otherSpecs.length > 0 && (
                <div>
                  <h5 className="other-specs-title">Altro</h5>
                  <div className="other-specs-wrapper">
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

      <button onClick={onLogout} className="logout-btn">
        <LogOut size={20} /> Esci dal Profilo
      </button>
    </div>
  );
};

export default UserProfileView;