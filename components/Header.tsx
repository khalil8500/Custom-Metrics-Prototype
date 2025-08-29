import React from 'react';
import { Icon } from './Icon';

export const Header: React.FC = () => {
  return (
    <header className="text-center p-6 border-b border-slate-700/50">
      <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl flex items-center justify-center gap-3">
        <Icon icon="sparkles" className="w-10 h-10 text-indigo-400" />
        Transcript Metric Detector
      </h1>
      <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
        Define your custom metrics, paste a transcript, and let AI provide a detailed analysis instantly.
      </p>
    </header>
  );
};
