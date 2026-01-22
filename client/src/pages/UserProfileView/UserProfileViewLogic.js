import { useState, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
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

  // Logic Cambio Password
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordFeedback, setPasswordFeedback] = useState({ type: '', message: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handlePasswordChangeInput = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordFeedback({ type: '', message: '' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'Le nuove password non coincidono.' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordFeedback({ type: 'error', message: 'La password deve essere di almeno 6 caratteri.' });
      return;
    }

    setPasswordLoading(true);
    const user = auth.currentUser;

    if (!user) {
      setPasswordFeedback({ type: 'error', message: 'Utente non autenticato.' });
      setPasswordLoading(false);
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, passwordForm.currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordForm.newPassword);

      setPasswordFeedback({ type: 'success', message: 'Password aggiornata con successo!' });
      // Close modal after a delay or immediately? User might want to see success message.
      // Let's keep it open with success message or close and show toast.
      // For now, simple behavior: clear form, delay close, or just show success message in modal.
      // The Plan said: "Handle success/error states".
      // I'll leave the modal open so they can see the "Success" message, maybe they close it manually.
      // Or I can wipe the form.
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setIsPasswordModalOpen(false), 2000);

    } catch (error) {
      console.error("Error changing password:", error);
      let msg = "Errore durante l'aggiornamento della password.";
      if (error.code === 'auth/wrong-password') {
        msg = "La password attuale non è corretta.";
      } else if (error.code === 'auth/requires-recent-login') {
        msg = "Per sicurezza, esegui nuovamente il login prima di cambiare la password.";
      }
      setPasswordFeedback({ type: 'error', message: msg });
    } finally {
      setPasswordLoading(false);
    }
  };

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
    uploadCroppedImage,
    // Password Logic exports
    isPasswordModalOpen,
    setIsPasswordModalOpen,
    passwordForm,
    handlePasswordChangeInput,
    handlePasswordSubmit,
    passwordFeedback,
    passwordLoading
  };
};