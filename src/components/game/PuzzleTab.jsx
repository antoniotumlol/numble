import React from 'react';
import { Star } from 'lucide-react';

export default function PuzzleTab({ index, isActive, stars, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg flex flex-col items-center transition-all ${
        isActive ? 'bg-slate-700' : 'bg-slate-800/50 hover:bg-slate-800'
      }`}
    >
      <span className="text-[10px] font-bold text-slate-400">#{index + 1}</span>
      <div className="flex gap-0.5 mt-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${i <= stars ? 'bg-amber-400' : 'bg-slate-600'}`}
          />
        ))}
      </div>
    </button>
  );
}
