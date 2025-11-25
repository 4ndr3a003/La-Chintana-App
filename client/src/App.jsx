import React, { useState, useEffect } from 'react';
import { IonApp } from '@ionic/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { getToken, onMessage } from 'firebase/messaging';
import { auth, db, appId, messaging } from './services/firebase';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

// Components
import Header from './components/layout/Header';
import MobileNav from './components/layout/MobileNav';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [activeProfileId, setActiveProfileId] = useState(localStorage.getItem('pc_profile_id'));
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

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

  // Push Notifications Initialization
  useEffect(() => {
    if (!userProfile) return;

    const initPushNotifications = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          // 1. Register listeners FIRST
          await PushNotifications.addListener('registration', async token => {
            console.log('Push registration success, token: ' + token.value);
            try {
              const profileRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', userProfile.id);
              await updateDoc(profileRef, {
                fcmTokens: arrayUnion(token.value)
              });
            } catch (err) {
              console.error('Error saving FCM token:', err);
            }
          });

          await PushNotifications.addListener('registrationError', err => {
            console.error('Push registration error: ', err.error);
            // alert('Push registration error: ' + JSON.stringify(err)); // Debug only
          });

          await PushNotifications.addListener('pushNotificationReceived', notification => {
            console.log('Push received: ', notification);
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
      } else {
        // Web Implementation
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            console.log('Notification permission granted.');
            
            const vapidKey = "BDHXmbMSKgKB13bobTKEwjpdpvAfRunVaAu3vAvkvtmSo1hjwYsWd1-TKm_zZjHg7k9-DwfrCX7G1F5f0A72bvk"; 
            
            if (vapidKey === "BDHXmbMSKgKB13bobTKEwjpdpvAfRunVaAu3vAvkvtmSo1hjwYsWd1-TKm_zZjHg7k9-DwfrCX7G1F5f0A72bvk") {
                console.warn("VAPID Key mancante.");
            } else {
                // Registra esplicitamente il Service Worker per stabilità
                let registration;
                if ('serviceWorker' in navigator) {
                    try {
                        registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
                        console.log('Service Worker registration successful with scope: ', registration.scope);
                    } catch (err) {
                        console.error('Service Worker registration failed: ', err);
                    }
                }

                // Passa la registrazione a getToken
                const currentToken = await getToken(messaging, { 
                    vapidKey, 
                    serviceWorkerRegistration: registration 
                });

                if (currentToken) {
                  console.log('Web Push Token:', currentToken);
                  const profileRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', userProfile.id);
                  await updateDoc(profileRef, {
                    fcmTokens: arrayUnion(currentToken)
                  });
                } else {
                  console.log('No registration token available.');
                }
            }

            onMessage(messaging, (payload) => {
              console.log('Message received. ', payload);
              new Notification(payload.notification.title, {
                body: payload.notification.body,
                icon: '/logo_chintana.png'
              });
            });

          } else {
            console.log('Unable to get permission to notify.');
          }
        } catch (err) {
          console.error('An error occurred while retrieving token. ', err);
        }
      }
    };

    initPushNotifications();

    return () => {
      if (Capacitor.isNativePlatform()) {
        PushNotifications.removeAllListeners();
      }
    };
  }, [userProfile]);

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
      <div className="flex flex-col h-full w-full bg-slate-50">
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
            />
            {/* Spacer for bottom nav on mobile */}
            {userProfile && location.pathname !== '/login' && (
               <div className="h-24 xl:hidden"></div>
            )}
          </div>
        </div>

        {/* MOBILE BOTTOM NAV */}
        {userProfile && location.pathname !== '/login' && (
          <div className="fixed bottom-0 left-0 right-0 z-20 xl:hidden pointer-events-none">
            <MobileNav userProfile={userProfile} />
          </div>
        )}
      </div>
    </IonApp>
  );
}
