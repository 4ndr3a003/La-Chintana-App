import React, { useState, useEffect } from 'react';
import { IonApp, IonButton, IonIcon } from '@ionic/react';
import { notificationsOutline } from 'ionicons/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getToken, onMessage, deleteToken } from 'firebase/messaging';
import { auth, db, appId, messaging } from './services/firebase';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

// Components
import Header from './components/layout/Header';
import MobileNav from './components/layout/MobileNav';
import AppRoutes from './routes/AppRoutes';
import NotificationToast from './components/ui/NotificationToast';

export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [activeProfileId, setActiveProfileId] = useState(localStorage.getItem('pc_profile_id'));
  const [loading, setLoading] = useState(true);

  // Custom Toast State
  const [toastInfo, setToastInfo] = useState({
    isOpen: false,
    message: '',
    title: '',
    type: 'info', // info, success, warning, error
    onClick: null
  });

  const [showNotifButton, setShowNotifButton] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const showToast = (message, title = '', type = 'info', onClick = null) => {
    setToastInfo({
      isOpen: true,
      message,
      title,
      type,
      onClick
    });
  };

  const hideToast = () => {
    setToastInfo(prev => ({ ...prev, isOpen: false }));
  };

  // Dark Mode Logic
  const [darkMode, setDarkMode] = useState(() => {
    if (localStorage.getItem('theme') === 'dark') {
      return true;
    }
    // Default to light mode (false) if no preference is saved, ignoring system preference
    return false;
  });

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Uppercase Mode Logic
  const [uppercaseMode, setUppercaseMode] = useState(() => {
    return localStorage.getItem('uppercaseMode') === 'true';
  });

  const toggleUppercaseMode = () => {
    setUppercaseMode(prev => !prev);
  };

  useEffect(() => {
    if (uppercaseMode) {
      document.documentElement.classList.add('uppercase-mode');
      localStorage.setItem('uppercaseMode', 'true');
    } else {
      document.documentElement.classList.remove('uppercase-mode');
      localStorage.setItem('uppercaseMode', 'false');
    }
  }, [uppercaseMode]);

  // Auth Initialization
  useEffect(() => {
    const initAuth = async () => {
      const token = window.__initial_auth_token;
      if (token) {
        try {
          await signInWithCustomToken(auth, token);
        } catch (error) {
          console.error("Error signing in with custom token:", error);
          await signInAnonymously(auth);
        }
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setAuthUser(currentUser);
      // We don't need to check activeProfileId here for loading state
      // because the profile sync effect will handle it or we handle it below
      if (!localStorage.getItem('pc_profile_id')) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Profile Sync
  useEffect(() => {
    if (!authUser || !activeProfileId) {
      return;
    }

    const profileRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', activeProfileId);

    const unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserProfile({ id: docSnap.id, ...docSnap.data() });
        // If on login page and profile loaded, go to dashboard
        if (location.pathname === '/login') {
          navigate('/');
        }
      } else {
        localStorage.removeItem('pc_profile_id');
        setActiveProfileId(null);
        setUserProfile(null);
        navigate('/login');
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching profile:", error);
      setLoading(false);
    });

    return () => unsubscribeProfile();
  }, [authUser, activeProfileId, navigate, location.pathname]);

  const [fcmToken, setFcmToken] = useState(null);

  // Native Push Notifications Initialization - Runs ONCE
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      if ('Notification' in window) {
        if (Notification.permission === 'default' || Notification.permission === 'denied') {
          setShowNotifButton(true);
        } else if (Notification.permission === 'granted') {
          setupWebPush(false);
        }
      } else {
        console.warn('Nofication API not supported in this browser.');
      }
      return;
    }

    const initNativeNotifications = async () => {
      try {
        // 1. Register listeners FIRST
        await PushNotifications.addListener('registration', token => {
          console.log('Push registration success, token: ' + token.value);
          setFcmToken(token.value);
        });

        await PushNotifications.addListener('registrationError', err => {
          console.error('Push registration error: ', err.error);
        });

        await PushNotifications.addListener('pushNotificationReceived', notification => {
          console.log('Push received: ', notification);
          // Native apps handle foreground notifications automatically or via plugins, 
          // but if we want to show our custom toast in foreground on native too:
          showToast(notification.body, notification.title, 'info');
        });

        await PushNotifications.addListener('pushNotificationActionPerformed', notification => {
          console.log('Push action performed: ', notification);
        });

        // 2. Request permissions
        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
          console.log('User denied permissions!');
          return;
        }

        // 3. Register with FCM
        await PushNotifications.register();

        // 4. Create Notification Channel (Required for Android O+)
        await PushNotifications.createChannel({
          id: 'default',
          name: 'Notifiche Generali',
          description: 'Notifiche generali dell\'app',
          importance: 5,
          visibility: 1,
          vibration: true,
        });

      } catch (e) {
        console.error('Error initializing push notifications', e);
      }
    };

    initNativeNotifications();

    return () => {
      if (Capacitor.isNativePlatform()) {
        PushNotifications.removeAllListeners();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync Native FCM Token to Firestore
  useEffect(() => {
    if (!authUser || !userProfile || !fcmToken) return;

    // Avoid unnecessary writes if token is already present
    if (userProfile.fcmTokens && userProfile.fcmTokens.includes(fcmToken)) {
      return;
    }

    const saveToken = async () => {
      try {
        const profileRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', userProfile.id);
        await updateDoc(profileRef, {
          fcmTokens: arrayUnion(fcmToken)
        });
        console.log('FCM Token saved to profile');
      } catch (err) {
        console.error('Error saving FCM token:', err);
      }
    };

    saveToken();
  }, [authUser, userProfile, fcmToken]);

  // Foreground Message Listener (Web only)
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;

    if (Capacitor.isNativePlatform() || !messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      if (document.visibilityState === 'visible') {
        console.log('Message received. ', payload);

        // Determine navigation action
        let onClickAction = null;
        if (payload.data && payload.data.url) {
          onClickAction = () => navigate(payload.data.url);
        }

        // Show custom in-app notification instead of native browser notification
        showToast(
          payload.notification.body,
          payload.notification.title,
          'info', // You could map this from payload data if you send a 'type' field
          onClickAction
        );

        // REMOVED: Native Notification generation to avoid double/ugly notifications
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const setupWebPush = async (isInteractive = false) => {
    try {
      if (isInteractive) {
        showToast('Recupero token notifiche...', '', 'info');
      }

      if (!messaging) {
        console.warn('Messaging non supportato.');
        if (isInteractive) showToast('Notifiche non supportate da questo browser.', 'Attenzione', 'warning');
        return;
      }

      const vapidKey = "BDHXmbMSKgKB13bobTKEwjpdpvAfRunVaAu3vAvkvtmSo1hjwYsWd1-TKm_zZjHg7k9-DwfrCX7G1F5f0A72bvk";

      if (!vapidKey || vapidKey === "REPLACE_WITH_YOUR_VAPID_KEY") {
        console.warn("VAPID Key mancante o non valida.");
        showToast('Errore configurazione VAPID Key', 'Errore', 'error');
        return;
      }

      let registration;
      if ('serviceWorker' in navigator) {
        try {
          registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          console.log('Service Worker registration successful with scope: ', registration.scope);
          // FORCE UPDATE CHECK:
          registration.update();
        } catch (err) {
          console.error('Service Worker registration failed: ', err);
          showToast('Errore Service Worker: ' + err.message, 'Errore', 'error');
          return;
        }
      } else {
        console.warn('Service Worker non supportato in questo browser.');
        showToast('Notifiche non supportate da questo browser.', 'Attenzione', 'warning');
        return;
      }

      const currentToken = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: registration
      });

      if (currentToken) {
        console.log('Web Push Token:', currentToken);
        if (isInteractive) {
          showToast('Notifiche attivate correttamente!', 'Successo', 'success');
        }
        setFcmToken(currentToken);
      } else {
        console.log('No registration token available.');
        if (isInteractive) {
          showToast('Impossibile ottenere il token notifiche. Verifica i permessi.', 'Avviso', 'warning');
        }
      }

    } catch (err) {
      console.error('An error occurred while retrieving token. ', err);
      // More specific error messages
      let msg = `Errore notifiche: ${err.message}`;
      if (err.code === 'messaging/permission-blocked') {
        msg = 'Permesso notifiche bloccato. Abilitalo nelle impostazioni del browser.';
      } else if (err.code === 'messaging/unsupported-browser') {
        msg = 'Browser non supportato per le notifiche.';
      } else if (err.message.includes('Missing required')) {
        msg = 'Configurazione notifiche incompleta (manifest o VAPID).';
      }
      showToast(msg, 'Errore', 'error');
    }
  };

  const enableWebNotifications = async () => {
    try {
      showToast('Richiesta permessi notifiche...', '', 'info');
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        console.log('Notification permission granted.');
        setShowNotifButton(false);
        await setupWebPush(true); // Attivazione interattiva
      } else {
        console.log('Unable to get permission to notify.');
        showToast('Permesso notifiche negato.', 'Attenzione', 'warning');
      }
    } catch (err) {
      console.error('An error occurred while requesting permissions. ', err);
      showToast(`Errore notifiche: ${err.message}`, 'Errore', 'error');
    }
  };

  const disableWebNotifications = async () => {
    try {
      if (fcmToken) {
        // 1. Remove from Firestore
        if (userProfile && userProfile.id) {
          const profileRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', userProfile.id);
          await updateDoc(profileRef, {
            fcmTokens: arrayRemove(fcmToken)
          });
        }

        // 2. Delete from Messaging
        if (messaging) {
          await deleteToken(messaging);
        }
        setFcmToken(null);
        showToast('Notifiche disattivate.', 'Successo', 'success');
      }
    } catch (error) {
      console.error("Error disabling notifications:", error);
      showToast('Errore disattivazione notifiche', 'Errore', 'error');
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('pc_profile_id');
    setActiveProfileId(null);
    setUserProfile(null);
    navigate('/login');
  };

  const handleLoginSuccess = (profileId) => {
    localStorage.setItem('pc_profile_id', profileId);
    setActiveProfileId(profileId);
    setLoading(true);
    navigate('/');
  };

  if (loading) return (
    <div className="flex flex-col h-screen items-center justify-center bg-slate-50 text-blue-600 gap-4">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-blue-600"></div>
    </div>
  );

  return (
    <IonApp>
      <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-900 dark:text-slate-100 transition-colors duration-300">
        {/* HEADER */}
        {userProfile && location.pathname !== '/login' && (
          <div className="flex-none z-20">
            <Header
              userProfile={userProfile}
            />
          </div>
        )}

        {/* MAIN CONTENT - SCROLLABLE */}
        <div className="flex-grow overflow-y-auto z-10 relative">
          <div className={`${location.pathname !== '/login' ? 'max-w-6xl mx-auto p-4 md:p-6 lg:p-10' : ''}`}>
            <AppRoutes
              userProfile={userProfile}
              onLoginSuccess={handleLoginSuccess}
              onLogout={handleLogout}
              enableNotifications={enableWebNotifications}
              disableNotifications={disableWebNotifications}
              isNotificationsEnabled={!!fcmToken}
              toggleDarkMode={toggleDarkMode}
              darkMode={darkMode}
              uppercaseMode={uppercaseMode}
              toggleUppercaseMode={toggleUppercaseMode}
            />
            {/* Spacer for bottom nav on mobile */}
            {userProfile && location.pathname !== '/login' && (
              <div className="h-24 xl:hidden"></div>
            )}
          </div>
        </div>

        {/* Notification Permission Button (Floating) */}
        {showNotifButton && !loading && userProfile && (
          <div className="fixed bottom-24 right-4 z-50">
            <IonButton
              shape="round"
              color="warning"
              onClick={enableWebNotifications}
              className="shadow-lg"
            >
              <IonIcon slot="start" icon={notificationsOutline} />
              Attiva Notifiche
            </IonButton>
          </div>
        )}

        {/* MOBILE BOTTOM NAV */}
        {userProfile && location.pathname !== '/login' && (
          <div className="fixed bottom-0 left-0 right-0 z-20 xl:hidden pointer-events-none">
            <MobileNav userProfile={userProfile} />
          </div>
        )}

        {/* Custom Notification Toast */}
        <NotificationToast
          isOpen={toastInfo.isOpen}
          onClose={hideToast}
          message={toastInfo.message}
          title={toastInfo.title}
          type={toastInfo.type}
          duration={5000}
          onClick={toastInfo.onClick}
        />
      </div>
    </IonApp>
  );
}
