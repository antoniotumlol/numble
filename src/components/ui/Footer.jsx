import React from 'react';

export default function Footer() {
  const version = import.meta.env.VITE_VERSION || 'dev';
  const buildDate = import.meta.env.VITE_BUILD_DATE || new Date().toISOString().split('T')[0];

  return (
    <footer className="mt-auto py-3 text-center">
      <div className="text-xs text-slate-500">
        <span className="font-mono">v{version}</span>
        <span className="mx-2">•</span>
        <span>{buildDate}</span>
      </div>
    </footer>
  );
}
