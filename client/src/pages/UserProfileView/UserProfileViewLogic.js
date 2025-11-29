import { useState, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage, appId, auth } from '../../services/firebase';
import { SPECIALIZATIONS_DATA } from '../../utils/constants';

export const useUserProfileView = (userProfile) => {
  const [uploading, setUploading] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', width: 50, aspect: 1 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const imgRef = useRef(null);


  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageSrc(reader.result.toString() || ''));
      reader.readAsDataURL(file);
      setIsModalOpen(true);
    }
  };

  const uploadCroppedImage = async () => {
    if (!completedCrop || !imgRef.current) {
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("User not authenticated for photo upload.");
      alert("Devi essere autenticato per caricare una foto.");
      return;
    }

    setUploading(true);
    setIsModalOpen(false);

    try {
      const canvas = document.createElement('canvas');
      const image = imgRef.current;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error('Canvas is empty');
          setUploading(false);
          return;
        }

        try {
          const storageRef = ref(storage, `avatars/${currentUser.uid}/${currentUser.uid}_${Date.now()}`);
          await uploadBytes(storageRef, blob);
          const url = await getDownloadURL(storageRef);

          const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', userProfile.id);
          await updateDoc(userRef, { photoUrl: url });
        } catch (error) {
          console.error("Error during blob upload/doc update:", error);
          alert(`Errore caricamento foto: ${error.message}`);
        } finally {
          setUploading(false);
          setImageSrc(null);
        }
      }, 'image/jpeg');

    } catch (error) {
      console.error("Error creating cropped image:", error);
      alert(`Errore durante il ritaglio dell'immagine: ${error.message}`);
      setUploading(false);
      setIsModalOpen(false);
      setImageSrc(null);
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
    // Recuperiamo lo stato direttamente dal DB
    // Se nel DB è "Non Operativo", lo mostriamo come tale.
    // Se nel DB è "Operativo", verifichiamo comunque le regole per sicurezza (opzionale, ma richiesto dall'utente)
    // L'utente ha detto: "fai in modo che anche nella sezione del prfilo il dato venga recuperato dal db"
    // E anche: "voglio che cambi in 'Non operativo' quando non e presente il corso delle 12 ore o quando si ha piu di 75 anni"
    
    // Quindi:
    // 1. Se il DB dice "Non Operativo", è "Non Operativo".
    // 2. Se il DB dice "Operativo", controlliamo se dovrebbe essere "Non Operativo" secondo le regole.
    
    const dbStatus = userProfile.status || 'Operativo';
    
    if (dbStatus.toLowerCase() === 'non operativo') {
        return 'Non Operativo';
    }

    // Regole di validazione extra (se nel DB è Operativo ma non dovrebbe esserlo)
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
    status,
    imageSrc,
    crop,
    setCrop,
    completedCrop,
    setCompletedCrop,
    isModalOpen,
    setIsModalOpen,
    imgRef,
    uploadCroppedImage
  };
};