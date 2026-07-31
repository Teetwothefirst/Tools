import React from 'react';
import Link from 'next/link';
import { FileText, Layers, FileCode, Wrench, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-blue-400 text-white shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xl font-bold text-white tracking-tight">PDF<span className="text-brand-500">Converter</span></span>
            <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Pro Platform</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <Link 
            href="/merge" 
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Layers className="h-4 w-4 text-brand-500" />
            <span>Merge & Organize</span>
          </Link>
          <Link 
            href="/pdf-to-word" 
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <FileCode className="h-4 w-4 text-blue-400" />
            <span>PDF to Word</span>
          </Link>
          <Link 
            href="/word-to-pdf" 
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <FileText className="h-4 w-4 text-cyan-400" />
            <span>Word to PDF</span>
          </Link>
          <Link 
            href="/repair" 
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Wrench className="h-4 w-4 text-emerald-400" />
            <span>PDF Repair</span>
          </Link>
        </nav>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-800/80 border border-slate-700/50 px-3 py-1.5 rounded-full">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Zero Retention Ephemeral Storage</span>
        </div>
      </div>
    </header>
  );
};
