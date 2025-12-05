import React, { useEffect, useState } from 'react';
import { IonIcon } from '@ionic/react';
import {
    alertCircleOutline,
    checkmarkCircleOutline,
    informationCircleOutline,
    warningOutline,
    closeOutline
} from 'ionicons/icons';

const NotificationToast = ({ isOpen, onClose, type = 'info', title, message, duration = 4000 }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            if (duration > 0) {
                const timer = setTimeout(() => {
                    handleClose();
                }, duration);
                return () => clearTimeout(timer);
            }
        }
    }, [isOpen, duration]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 300); // Wait for exit animation
    };

    if (!isOpen) return null;

    // Configuration for different types
    const config = {
        info: {
            icon: informationCircleOutline,
            bgColor: 'bg-white',
            borderColor: 'border-l-blue-500', // Using Tailwind color names that map to our variables ideally, or hardcoded for now if variables aren't directly mapped in tailwind config yet. Assuming standard tailwind palette or our variables.css variables are applied via globals.
            // Let's use inline styles solely for the dynamic border color to be safe with our custom variables
            iconColor: 'var(--color-pc-blue)',
            borderStyle: '4px solid var(--color-pc-blue)'
        },
        success: {
            icon: checkmarkCircleOutline,
            bgColor: 'bg-white',
            iconColor: 'var(--color-pc-green)',
            borderStyle: '4px solid var(--color-pc-green)'
        },
        warning: {
            icon: warningOutline,
            bgColor: 'bg-white',
            iconColor: 'var(--color-pc-orange)',
            borderStyle: '4px solid var(--color-pc-orange)'
        },
        error: {
            icon: alertCircleOutline,
            bgColor: 'bg-white',
            iconColor: 'var(--color-pc-red)',
            borderStyle: '4px solid var(--color-pc-red)'
        }
    };

    const currentConfig = config[type] || config.info;

    return (
        <div
            className={`fixed top-4 right-0 left-0 md:left-auto md:right-4 z-[9999] px-4 md:px-0 flex justify-center md:justify-end transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}
        >
            <div
                className="w-full md:w-96 bg-white shadow-lg rounded-lg overflow-hidden flex flex-row items-stretch pointer-events-auto"
                style={{ borderLeft: currentConfig.borderStyle }}
            >
                {/* Icon Section */}
                <div className="flex-none w-12 flex items-center justify-center bg-transparent">
                    <IonIcon
                        icon={currentConfig.icon}
                        style={{ color: currentConfig.iconColor, fontSize: '24px' }}
                    />
                </div>

                {/* Content Section */}
                <div className="flex-grow py-3 pr-2">
                    {title && (
                        <h4 className="font-bold text-sm text-slate-800 mb-1">
                            {title}
                        </h4>
                    )}
                    <p className="text-sm text-slate-600 leading-snug">
                        {message}
                    </p>
                </div>

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="flex-none w-10 flex items-start justify-center pt-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <IonIcon icon={closeOutline} size="small" />
                </button>
            </div>
        </div>
    );
};

export default NotificationToast;
