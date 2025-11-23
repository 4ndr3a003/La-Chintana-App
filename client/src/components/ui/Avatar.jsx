import React from 'react';

const Avatar = ({ src, name, size = 'md', className = '' }) => {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-9 h-9 text-xs',
    md: 'w-11 h-11 text-xs',
    lg: 'w-20 h-20 text-base',
    xl: 'w-28 h-28 text-xl'
  };
  
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=f1f5f9&color=475569&bold=true`;

  return (
    <img 
      src={src || fallbackUrl} 
      alt={name} 
      className={`rounded-full object-cover border border-slate-100 bg-slate-50 ${sizes[size]} ${className}`}
      onError={(e) => { e.target.src = fallbackUrl; }}
    />
  );
};

export default Avatar;
