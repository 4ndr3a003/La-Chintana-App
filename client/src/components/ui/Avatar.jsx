import React from 'react';

const Avatar = ({ src, name, size = 'md', className = '' }) => {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-9 h-9 text-xs',
    md: 'w-11 h-11 text-xs',
    lg: 'w-20 h-20 text-base',
    xl: 'w-28 h-28 text-xl'
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const [imageError, setImageError] = React.useState(false);

  if (!src || imageError) {
    return (
      <div
        className={`rounded-full flex items-center justify-center font-bold bg-slate-200 text-slate-600 border border-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 ${sizes[size]} ${className}`}
        title={name}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className={`rounded-full object-cover border border-slate-100 bg-slate-50 ${sizes[size]} ${className}`}
      onError={() => setImageError(true)}
    />
  );
};

export default Avatar;
