import React from 'react';

export default function Card({ children, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-[#111625] border border-gray-800 rounded-xl p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/40 hover:shadow-indigo-500/5 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
