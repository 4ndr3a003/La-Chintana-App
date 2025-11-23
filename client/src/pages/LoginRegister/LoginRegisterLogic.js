import { useState } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db, appId } from '../../services/firebase';

export const useLoginRegister = (onLoginSuccess) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
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

  return {
    formData,
    error,
    loading,
    setFormData,
    handleLogin
  };
};