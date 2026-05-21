'use client';

import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
}

export default function Input({ icon, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2">{icon}</div>}
        <input
          {...props}
          className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-white/20 border ${
            error ? 'border-red-400' : 'border-white/30'
          } rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition ${className}`}
        />
      </div>
      {error && <p className="text-red-300 text-sm mt-1">{error}</p>}
    </div>
  );
}
