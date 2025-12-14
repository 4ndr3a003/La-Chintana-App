import React from 'react';

const Card = ({ children, className = '', noPadding = false, header, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white dark:bg-[var(--color-slate-100)] rounded-xl shadow-sm border border-slate-100 dark:border-slate-200 overflow-hidden ${className}`}
  >
    {header && (
      <div className="bg-white dark:bg-[var(--color-slate-100)] px-5 py-4 border-b border-slate-100 dark:border-slate-200 font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wide flex justify-between items-center">
        {header}
      </div>
    )}
    <div className={noPadding ? '' : 'p-5'}>
      {children}
    </div>
  </div>
);

export default Card;
