import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function TargetDisplay({ target, closest, isComplete }) {
  return (
    <div className="text-center">
      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Target</h2>
      <div className="text-6xl font-black text-white mb-2">{target}</div>
      <div className={`text-xl font-bold ${isComplete ? 'text-green-500' : 'text-slate-400'}`}>
        {isComplete ? (
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-6 h-6" />
            Solved!
          </div>
        ) : closest !== null ? (
          `Closest: ${closest}`
        ) : (
          <span className="opacity-0">.</span>
        )}
      </div>
    </div>
  );
}
