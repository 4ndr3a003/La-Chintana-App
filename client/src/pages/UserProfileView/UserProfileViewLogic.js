import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { SPECIALIZATIONS_DATA } from '../../utils/constants';

export const useUserProfileView = (userProfile) => {
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      // Upload to local server
      const response = await fetch('http://localhost:3000/api/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      const url = data.url;

      // Update Firestore with the new URL
      const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', userProfile.id);
      await updateDoc(userRef, { photoUrl: url });
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Errore caricamento foto");
    } finally {
      setUploading(false);
    }
  };

  // Raggruppa le specializzazioni dell'utente
  const groupedSpecs = Object.entries(SPECIALIZATIONS_DATA).reduce((acc, [category, data]) => {
    const userSpecsByCategory = data.items.filter(item => userProfile.specializations?.includes(item));
    if (userSpecsByCategory.length > 0) {
      acc[category] = { ...data, items: userSpecsByCategory };
    }
    return acc;
  }, {});

  // Trova le specializzazioni "Altro"
  const allKnownSpecs = Object.values(SPECIALIZATIONS_DATA).flatMap(d => d.items);
  const otherSpecs = userProfile.specializations?.filter(s => !allKnownSpecs.includes(s)) || [];

  return {
    uploading,
    handlePhotoUpload,
    groupedSpecs,
    otherSpecs
  };
};