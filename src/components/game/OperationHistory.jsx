import React from 'react';

const operationSymbols = {
  add: '+',
  subtract: '-',
  multiply: '×',
  divide: '÷'
};

export default function OperationHistory({ history }) {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-800/50 rounded-lg px-4 py-2 max-w-full overflow-x-auto">
      <div className="text-xs text-slate-400 mb-1 font-semibold">Operations:</div>
      <div className="flex flex-wrap gap-2 text-sm">
        {history.map((item, index) => (
          <div key={index} className="text-slate-300 whitespace-nowrap">
            <span className="font-mono">
              {item.firstValue} {operationSymbols[item.operation]} {item.secondValue} = {item.result}
            </span>
            {index < history.length - 1 && (
              <span className="text-slate-600 ml-2">→</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
