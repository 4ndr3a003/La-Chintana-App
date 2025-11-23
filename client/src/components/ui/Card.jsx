import React from 'react';

const Card = ({ children, className = '', noPadding = false, header, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden ${className}`}
  >
    {header && (
      <div className="bg-white px-5 py-4 border-b border-slate-100 font-bold text-slate-800 text-sm uppercase tracking-wide flex justify-between items-center">
        {header}
      </div>
    )}
    <div className={noPadding ? '' : 'p-5'}>
      {children}
    </div>
  </div>
);

export default Card;
