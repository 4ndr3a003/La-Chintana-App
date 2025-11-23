import React from 'react';
import { IonPage, IonContent, IonCard, IonCardContent, IonSegment, IonSegmentButton, IonLabel, IonItem, IonInput, IonButton, IonIcon, IonText, IonGrid, IonRow, IonCol } from '@ionic/react';
import { ROLES } from '../../utils/constants';
import { CheckCircle, Mail, Lock, ArrowRight, User } from 'lucide-react';
import logo from '../../assets/logo_chintanta.png';
import { useLoginRegister } from './LoginRegisterLogic';
import './LoginRegister.css';

const LoginRegisterView = ({ onLoginSuccess }) => {
  const {
    mode,
    formData,
    error,
    loading,
    setMode,
    setFormData,
    handleLogin,
    handleRegister,
    quickLogin
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
            <IonSegment value={mode} onIonChange={e => setMode(e.detail.value)}>
              <IonSegmentButton value="login">
                <IonLabel>Accedi</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="register">
                <IonLabel>Registrati</IonLabel>
              </IonSegmentButton>
            </IonSegment>

            <IonCardContent className="login-card-content">
              {error && (
                <div className="error-message">
                  <CheckCircle size={14} /> {error}
                </div>
              )}

              <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="login-form">
                {mode === 'register' && (
                  <IonItem fill="outline" className="form-item" lines="none">
                    <User slot="start" size={18} className="form-icon" />
                    <IonInput
                      label="Nome Completo"
                      labelPlacement="floating"
                      placeholder="Mario Rossi"
                      value={formData.name}
                      onIonInput={e => setFormData({ ...formData, name: e.detail.value })}
                    />
                  </IonItem>
                )}

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
                  {loading ? 'Elaborazione...' : (mode === 'login' ? 'Entra nel Portale' : 'Crea Account')}
                  <ArrowRight slot="end" size={16} />
                </IonButton>
              </form>

              <div className="demo-section">
                <p className="demo-title">Accesso Rapido (Demo)</p>
                <div className="demo-buttons">
                  <IonButton fill="outline" size="small" color="primary" onClick={() => quickLogin(ROLES.PRESIDENT)}>
                    Presidente
                  </IonButton>
                  <IonButton fill="outline" size="small" color="tertiary" onClick={() => quickLogin(ROLES.BOARD)}>
                    Direttivo
                  </IonButton>
                  <IonButton fill="outline" size="small" color="success" onClick={() => quickLogin(ROLES.VOLUNTEER)}>
                    Volontario
                  </IonButton>
                </div>
              </div>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginRegisterView;