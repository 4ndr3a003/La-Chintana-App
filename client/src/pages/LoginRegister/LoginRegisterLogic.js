import { useState } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { collectionGroup, query, where, getDocs, doc, getDoc, collection, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage, appId } from '../../services/firebase';

export const useLoginRegister = (onLoginSuccess) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [multipleProfiles, setMultipleProfiles] = useState(null);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [superadminAssociations, setSuperadminAssociations] = useState([]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!auth.currentUser) await signInAnonymously(auth);

      const q = query(
        collectionGroup(db, 'profiles'), 
        where('email', '==', formData.email),
        where('password', '==', formData.password)
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        await auth.currentUser.getIdToken(true);
        
        if (formData.email.toLowerCase() === 'admin@mail.com') {
            setIsSuperadmin(true);
            const associationsRef = collection(db, 'artifacts', appId, 'public', 'data', 'associations');
            const assocSnapshot = await getDocs(associationsRef);
            const allAssocs = [];
            assocSnapshot.forEach(docSnap => {
                allAssocs.push({
                    associationId: docSnap.id,
                    associationName: docSnap.data().name || docSnap.id,
                    logoUrl: docSnap.data().logoUrl || null
                });
            });
            setSuperadminAssociations(allAssocs);
        }
        else if (snapshot.docs.length === 1) {
          const userDoc = snapshot.docs[0];
          // Determine associationId from document path:
          // artifacts/{appId}/public/data/associations/{associationId}/profiles/{profileId}
          const assocId = userDoc.ref.parent.parent.id;
          onLoginSuccess(userDoc.id, assocId);
        } else {
          // Multiple profiles found (user is in multiple associations)
          const profiles = [];
          for (const docSnap of snapshot.docs) {
            const assocId = docSnap.ref.parent.parent.id;
            // Fetch association details to get the name
            const assocDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'associations', assocId);
            const assocDocSnap = await getDoc(assocDocRef);
            const assocData = assocDocSnap.exists() ? assocDocSnap.data() : { name: assocId };

            profiles.push({
              profileId: docSnap.id,
              associationId: assocId,
              associationName: assocData.name,
              logoUrl: assocData.logoUrl || null,
              ...docSnap.data()
            });
          }
          setMultipleProfiles(profiles);
        }
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

  const handleSuperadminSelectAssociation = async (assocId) => {
    setLoading(true);
    setError('');
    try {
      const profilesRef = collection(db, 'artifacts', appId, 'public', 'data', 'associations', assocId, 'profiles');
      const q = query(profilesRef, where('email', '==', formData.email));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        onLoginSuccess(snap.docs[0].id, assocId);
      } else {
        const newProfileRef = doc(profilesRef);
        await setDoc(newProfileRef, {
          email: formData.email,
          password: formData.password,
          role: 'presidente',
          name: 'Super',
          surname: 'Admin',
          isSuperadmin: true
        });
        onLoginSuccess(newProfileRef.id, assocId);
      }
    } catch (err) {
      console.error(err);
      setError("Errore accesso associazione: " + err.message);
      setLoading(false);
    }
  };

  const handleCreateAssociation = async (e, newAssocId, newAssocName, logoFile) => {
    e.preventDefault();
    if (!newAssocId || !newAssocName) return;
    
    setLoading(true);
    setError('');
    try {
      const assocRef = doc(db, 'artifacts', appId, 'public', 'data', 'associations', newAssocId);
      const snap = await getDoc(assocRef);
      if (snap.exists()) {
        setError("Un'associazione con questo ID esiste già.");
        setLoading(false);
        return;
      }

      let logoUrl = null;
      if (logoFile) {
        const logoRef = ref(storage, `associations_logos/${newAssocId}_${Date.now()}`);
        await uploadBytes(logoRef, logoFile);
        logoUrl = await getDownloadURL(logoRef);
      }

      await setDoc(assocRef, {
        id: newAssocId,
        name: newAssocName,
        logoUrl: logoUrl,
        createdAt: serverTimestamp()
      });

      const associationsRef = collection(db, 'artifacts', appId, 'public', 'data', 'associations');
      const assocSnapshot = await getDocs(associationsRef);
      const allAssocs = [];
      assocSnapshot.forEach(docSnap => {
          allAssocs.push({
              associationId: docSnap.id,
              associationName: docSnap.data().name || docSnap.id,
              logoUrl: docSnap.data().logoUrl || null
          });
      });
      setSuperadminAssociations(allAssocs);
      
    } catch (err) {
      console.error(err);
      setError("Errore creazione associazione: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    error,
    loading,
    multipleProfiles,
    isSuperadmin,
    superadminAssociations,
    setFormData,
    handleLogin,
    handleSuperadminSelectAssociation,
    handleCreateAssociation
  };
};