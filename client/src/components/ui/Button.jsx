import React from 'react';

const Button = ({ children, variant = 'primary', className = '', size = 'md', ...props }) => {
  const baseStyle = "rounded-xl font-semibold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
  
  const sizes = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-5 py-3 text-sm',
    lg: 'px-6 py-4 text-base'
  };

  const variants = {
    primary: "bg-[var(--color-pc-blue-700)] hover:bg-[var(--color-pc-blue-600)] text-white shadow-blue-200 shadow-md",
    secondary: "bg-yellow-400 hover:bg-yellow-500 text-blue-900 shadow-yellow-100",
    outline: "border-2 border-slate-200 text-slate-600 hover:border-[var(--color-pc-blue)] hover:text-[var(--color-pc-blue)] bg-white",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
    ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
    white: "bg-white text-blue-900 hover:bg-gray-50 shadow-sm"
  };

  return (
    <button className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
