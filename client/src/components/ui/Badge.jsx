import React from 'react';

const Badge = ({ text, color = 'blue', className = '' }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    gray: 'bg-slate-100 text-slate-600 border-slate-200',
    red: 'bg-red-50 text-red-700 border-red-100'
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${colors[color] || colors.gray} ${className}`}>
      {text}
    </span>
  );
};

export default Badge;
