import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, appId } from './services/firebase';

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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col selection:bg-blue-100 pb-24 md:pb-0">
      
      {/* HEADER */}
      {userProfile && location.pathname !== '/login' && (
        <Header 
          userProfile={userProfile} 
        />
      )}

      <main className="flex-grow container mx-auto px-4 py-6 w-full max-w-full">
        <div className="animate-in fade-in zoom-in-95 duration-300">
            <AppRoutes 
                userProfile={userProfile} 
                onLoginSuccess={handleLoginSuccess} 
                onLogout={handleLogout} 
            />
        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      {userProfile && location.pathname !== '/login' && (
        <MobileNav />
      )}
    </div>
  );
}
