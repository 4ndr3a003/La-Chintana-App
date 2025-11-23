import React from 'react';
import { IonPage, IonContent, IonCard, IonCardContent, IonItem, IonInput, IonButton } from '@ionic/react';
import { CheckCircle, Mail, Lock, ArrowRight } from 'lucide-react';
import logo from '../../assets/logo_chintanta.png';
import { useLoginRegister } from './LoginRegisterLogic';
import './LoginRegister.css';

const LoginRegisterView = ({ onLoginSuccess }) => {
  const {
    formData,
    error,
    loading,
    setFormData,
    handleLogin
  } = useLoginRegister(onLoginSuccess);

  return (
    <IonPage>
      <IonContent fullscreen className="ion-padding">
        <div className="login-container">
          <div className="login-header">
            <img src={logo} alt="Logo" className="login-logo" />
            <h1 className="login-title">LA CHINTANA</h1>
            <p className="login-subtitle">Portale Operativo Volontari</p>
          </div>

          <IonCard className="login-card">
            <IonCardContent className="login-card-content">
              {error && (
                <div className="error-message">
                  <CheckCircle size={14} /> {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="login-form">
                <IonItem fill="outline" className="form-item" lines="none">
                  <Mail slot="start" size={18} className="form-icon" />
                  <IonInput
                    type="email"
                    label="Email"
                    labelPlacement="floating"
                    placeholder="esempio@email.it"
                    value={formData.email}
                    onIonInput={e => setFormData({ ...formData, email: e.detail.value })}
                  />
                </IonItem>

                <IonItem fill="outline" className="form-item" lines="none">
                  <Lock slot="start" size={18} className="form-icon" />
                  <IonInput
                    type="password"
                    label="Password"
                    labelPlacement="floating"
                    placeholder="••••••••"
                    value={formData.password}
                    onIonInput={e => setFormData({ ...formData, password: e.detail.value })}
                  />
                </IonItem>

                <IonButton type="submit" expand="block" className="submit-btn" disabled={loading}>
                  {loading ? 'Elaborazione...' : 'Entra nel Portale'}
                  <ArrowRight slot="end" size={16} />
                </IonButton>
              </form>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginRegisterView;