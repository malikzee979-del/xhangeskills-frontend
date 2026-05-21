'use client';

import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outlined' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'font-semibold rounded-lg transition duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-400 to-purple-500 text-white hover:from-blue-500 hover:to-purple-600',
    secondary: 'bg-gradient-to-r from-indigo-400 to-cyan-500 text-white hover:from-indigo-500 hover:to-cyan-600',
    outlined: 'bg-white/20 border border-white/30 text-white hover:bg-white/30',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3',
    lg: 'px-6 py-4 text-lg',
  };

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading && <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>}
      {children}
    </button>
  );
}
