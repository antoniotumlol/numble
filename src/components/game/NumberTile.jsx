import React from 'react';

export default function NumberTile({ number, isSelected, isUsed, isResult, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={isUsed}
      className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl text-xl sm:text-2xl font-bold transition-all duration-200 
        ${isUsed ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 
          isSelected ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 
          isResult ? 'bg-purple-900/50 text-purple-200 border-2 border-purple-700' : 
          'bg-slate-700 text-white hover:bg-slate-600'}`}
    >
      {number}
    </button>
  );
}
