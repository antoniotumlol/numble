import React from 'react';
import { Button } from '@/components/ui/button';

export default function HelpDialog({ open, onOpenChange }) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full">
        <h2 className="text-xl font-bold text-white mb-4">How to Play</h2>
        <p className="text-slate-300 text-sm mb-4">
          Reach the target number by combining numbers using basic arithmetic (+, -, ×, ÷).
          <br /><br />
          Click a number to select it, then an operation, then another number to perform the calculation.
        </p>
        <Button className="w-full text-white" onClick={() => onOpenChange(false)}>Close</Button>
      </div>
    </div>
  );
}
