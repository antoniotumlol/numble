import React from 'react';

export default function OperationButton({ operation, symbol, isSelected, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl text-2xl font-bold transition-all duration-200 
        ${disabled ? 'bg-slate-800 text-slate-600 cursor-not-allowed' :
          isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' :
          'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
    >
      {symbol}
    </button>
  );
}
