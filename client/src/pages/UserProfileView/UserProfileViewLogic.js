import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage, appId } from '../../services/firebase';
import { SPECIALIZATIONS_DATA } from '../../utils/constants';

export const useUserProfileView = (userProfile) => {
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      console.log("Starting upload to Firebase Storage...");
      const storageRef = ref(storage, `avatars/${userProfile.id}_${Date.now()}`);

      console.log("Uploading bytes...");
      await uploadBytes(storageRef, file);
      console.log("Upload complete. Getting download URL...");

      const url = await getDownloadURL(storageRef);
      console.log("Download URL obtained:", url);

      const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', userProfile.id);
      await updateDoc(userRef, { photoUrl: url });
      console.log("Firestore updated.");

    } catch (error) {
      console.error("Error uploading photo:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      if (error.customData) {
        console.error("Custom data:", error.customData);
      }
      alert(`Errore caricamento foto: ${error.message}`);
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

  // Calcolo automatico dello stato operativo
  const calculateStatus = () => {
    if (!userProfile.birthDate) return 'Non Operativo'; 
    
    const birthDate = new Date(userProfile.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    const has12HoursCourse = userProfile.specializations?.includes('Corso 12 ore');

    if (age > 75 || !has12HoursCourse) {
        return 'Non Operativo';
    }
    return 'Operativo';
  };

  const status = calculateStatus();

  return {
    uploading,
    handlePhotoUpload,
    groupedSpecs,
    otherSpecs,
    status
  };
};