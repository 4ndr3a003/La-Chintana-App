import { useState, useRef } from 'react';

export const useSwipeToClose = (onClose, threshold = 100) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const modalRef = useRef(null);

  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const delta = currentY - startY;
    
    if (delta > 0 && modalRef.current) {
      modalRef.current.style.transform = `translateY(${delta}px)`;
      modalRef.current.style.transition = 'none';
    }
  };

  const handleTouchEnd = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    const currentY = e.changedTouches[0].clientY;
    const delta = currentY - startY;

    if (delta > threshold) {
      if (modalRef.current) {
         modalRef.current.style.transition = 'transform 0.2s ease-out';
         modalRef.current.style.transform = 'translateY(100%)';
      }
      setTimeout(() => {
          onClose();
          // Reset style after close
          setTimeout(() => {
              if (modalRef.current) {
                modalRef.current.style.transform = '';
                modalRef.current.style.transition = '';
              }
          }, 100);
      }, 200);
    } else {
      if (modalRef.current) {
        modalRef.current.style.transition = 'transform 0.3s ease-out';
        modalRef.current.style.transform = '';
      }
    }
  };

  return {
    modalRef,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  };
};
