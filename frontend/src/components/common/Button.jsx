import React from 'react';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  onClick,
  disabled = false,
  loading = false
}) {
  const baseStyle = "flex items-center justify-center font-medium rounded-lg text-sm px-4 py-2.5 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20",
    secondary: "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20",
    outline: "border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
  };

  return (
    <button
      type={type}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <svg className="animate-spin -ml-1 mr-2 h-4.5 w-4.5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Processing...</span>
        </div>
      ) : children}
    </button>
  );
}
