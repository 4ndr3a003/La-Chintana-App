import { useState } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { auth, db, appId } from '../../services/firebase';
import { ROLES, BOARD_ROLES } from '../../utils/constants';

export const useLoginRegister = (onLoginSuccess) => {
  const [mode, setMode] = useState('login'); 
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!auth.currentUser) await signInAnonymously(auth);

      const q = query(
        collection(db, 'artifacts', appId, 'public', 'data', 'profiles'), 
        where('email', '==', formData.email),
        where('password', '==', formData.password)
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        onLoginSuccess(userDoc.id);
      } else {
        setError("Credenziali non valide. Riprova.");
      }
    } catch (err) {
      console.error(err);
      setError("Errore login: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError("Compila tutti i campi.");
      setLoading(false);
      return;
    }

    try {
      if (!auth.currentUser) await signInAnonymously(auth);

      const q = query(
        collection(db, 'artifacts', appId, 'public', 'data', 'profiles'), 
        where('email', '==', formData.email)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        setError("Email già registrata.");
        setLoading(false);
        return;
      }

      const newUser = {
        name: formData.name,
        email: formData.email,
        password: formData.password, 
        role: ROLES.VOLUNTEER,
        boardRole: null,
        specializations: [],
        joinedAt: new Date().toISOString(),
        phone: "",
        cf: "",
        address: "",
        birthDate: "",
        bloodType: "",
        photoUrl: ""
      };

      const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'profiles'), newUser);
      onLoginSuccess(docRef.id);

    } catch (err) {
      console.error(err);
      setError("Errore registrazione: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (role) => {
    setLoading(true);
    setError('');
    try {
      if (!auth.currentUser) await signInAnonymously(auth);

      const email = `${role}@demo.it`;
      const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'profiles'), where('email', '==', email));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        onLoginSuccess(snap.docs[0].id);
      } else {
        const demoData = {
          name: role === ROLES.PRESIDENT ? "Mario Rossi (Pres.)" : "Luca Bianchi",
          email: email,
          password: "demo",
          role: role,
          boardRole: role === ROLES.BOARD ? BOARD_ROLES.VP : null,
          specializations: role === ROLES.VOLUNTEER ? ["Corso Base (A1)"] : [],
          joinedAt: new Date().toISOString()
        };
        const ref = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'profiles'), demoData);
        onLoginSuccess(ref.id);
      }
    } catch (err) { 
      console.error(err); 
      setError("Errore accesso rapido: " + err.message);
    } finally { setLoading(false); }
  };

  return {
    mode,
    formData,
    error,
    loading,
    setMode,
    setFormData,
    handleLogin,
    handleRegister,
    quickLogin
  };
};