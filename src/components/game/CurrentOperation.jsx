import React from 'react';
import { motion } from 'framer-motion';

export default function CurrentOperation({ firstNumber, operation, isActive }) {
  const opSymbols = { add: '+', subtract: '−', multiply: '×', divide: '÷' };
  
  if (!isActive) return <div className="text-slate-600 text-lg">Select a number...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-2xl font-bold text-white flex items-center gap-2"
    >
      <span className="text-amber-400">{firstNumber}</span>
      {operation && (
        <>
          <span className="text-slate-500">{opSymbols[operation]}</span>
          <span className="text-slate-400">?</span>
        </>
      )}
    </motion.div>
  );
}
