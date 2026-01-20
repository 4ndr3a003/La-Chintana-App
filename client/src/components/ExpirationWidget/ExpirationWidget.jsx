import React, { useMemo } from 'react';
import { Clock, AlertTriangle, AlertCircle } from 'lucide-react';
import './ExpirationWidget.css';

const ExpirationWidget = ({ users }) => {
    const expiringItems = useMemo(() => {
        const today = new Date();
        const warningThreshold = 30; // days
        const items = [];

        users.forEach(user => {
            if (!user.certifications) return;

            Object.entries(user.certifications).forEach(([certName, dates]) => {
                if (!dates.expirationDate) return;

                const expDate = new Date(dates.expirationDate);
                const diffTime = expDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays <= warningThreshold) {
                    items.push({
                        userId: user.id,
                        userName: user.name,
                        certName,
                        expirationDate: expDate,
                        daysLeft: diffDays,
                        status: diffDays < 0 ? 'expired' : 'warning'
                    });
                }
            });
        });

        // Sort by expiration date (most urgent first)
        return items.sort((a, b) => a.expirationDate - b.expirationDate);
    }, [users]);

    if (expiringItems.length === 0) {
        return (
            <div className="expiration-widget">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="text-blue-600" size={20} />
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">Scadenze Imminenti</h3>
                </div>
                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-8">
                    <Clock size={40} className="mb-2 opacity-50" />
                    <p className="text-sm">Nessuna scadenza nei prossimi 30 giorni.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="expiration-widget">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Clock className="text-blue-600" size={20} />
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">Scadenze Imminenti</h3>
                </div>
                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                    {expiringItems.length}
                </span>
            </div>

            <div className="expiration-list no-scrollbar">
                {expiringItems.map((item, index) => (
                    <div key={`${item.userId}-${item.certName}-${index}`} className={`expiration-item ${item.status}`}>
                        <div className="flex items-start gap-3">
                            {item.status === 'expired' ? (
                                <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
                            ) : (
                                <AlertTriangle size={18} className="text-amber-500 mt-0.5 shrink-0" />
                            )}
                            <div className="expiration-info">
                                <h4>{item.certName}</h4>
                                <p>{item.userName}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="expiration-date block text-center">
                                {item.expirationDate.toLocaleDateString('it-IT')}
                            </span>
                            <span className="text-[10px] font-bold mt-1 block text-center text-slate-500">
                                {item.daysLeft < 0 ? `Scaduto da ${Math.abs(item.daysLeft)} gg` : `Scade tra ${item.daysLeft} gg`}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExpirationWidget;
