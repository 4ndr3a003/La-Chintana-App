import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Settings, UserCircle, LogOut, Building } from 'lucide-react';

const ProfileMenu = ({ isOpen, onClose, anchorRef, userProfile }) => {
    const navigate = useNavigate();
    const menuRef = useRef(null);

    useEffect(() => {
        if (isOpen && menuRef.current && anchorRef?.current) {
            const rect = anchorRef.current.getBoundingClientRect();
            const menuWidth = menuRef.current.offsetWidth;

            // Calculate Top
            menuRef.current.style.top = `${rect.bottom + 8}px`;

            // Calculate Left: Align right edge with anchor right edge
            // rect.right is the right edge of anchor. 
            // We want menu's right edge to be at rect.right.
            // So left = rect.right - menuWidth.
            let left = rect.right - menuWidth;

            // Clamp to viewport
            const padding = 16;
            left = Math.max(padding, Math.min(window.innerWidth - menuWidth - padding, left));

            menuRef.current.style.left = `${left}px`;
        }
    }, [isOpen, anchorRef]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (anchorRef?.current && anchorRef.current.contains(event.target)) {
                return;
            }
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose, anchorRef]);

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div
            ref={menuRef}
            className="fixed w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[99999]"
            style={{ top: 0, left: 0 }}
        >
            <div className="p-2 space-y-1">
                <button
                    onClick={() => {
                        navigate('/profile');
                        onClose();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-colors"
                >
                    <UserCircle size={18} />
                    Il mio Profilo
                </button>
                <button
                    onClick={() => {
                        navigate('/settings');
                        onClose();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-colors"
                >
                    <Settings size={18} />
                    Impostazioni
                </button>
                {userProfile?.email === 'admin@mail.com' && (
                    <button
                        onClick={() => {
                            navigate('/superadmin');
                            onClose();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-50 hover:text-amber-800 rounded-xl transition-colors border-t border-slate-100"
                    >
                        <Building size={18} />
                        Gestione Associazioni
                    </button>
                )}
            </div>
        </div>,
        document.body
    );
};

export default ProfileMenu;
