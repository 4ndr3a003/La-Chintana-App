import React from 'react';
import { AlertTriangle } from 'lucide-react';

const DeleteConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Elimina",
    message = "Sei sicuro di voler procedere? Questa azione non può essere annullata.",
    isDeleting = false
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
            style={{ zIndex: 110 }}
            onClick={onClose}
        >
            {/* Backdrop click handler managed by parent div */}
            <div
                className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="text-amber-600" size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
                    <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                        {message}
                    </p>
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                            disabled={isDeleting}
                        >
                            Annulla
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Eliminazione...' : 'Elimina'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
