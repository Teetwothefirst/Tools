import React from 'react';
import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import './globals.css';

export const metadata: Metadata = {
  title: 'PDFConverter Pro - Scalable PDF Engine & Document Tools',
  description: 'High-performance browser & server PDF manipulation platform. Merge, convert PDF to Word, Word to PDF, and repair corrupted documents.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-brand-500 selection:text-white flex flex-col min-h-screen">
        {/* Background glow accents */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-brand-600/10 via-blue-500/5 to-transparent blur-3xl pointer-events-none z-0" />
        
        <Header />
        
        <main className="flex-1 relative z-10">
          {children}
        </main>

        <footer className="border-t border-slate-800 bg-slate-900/50 py-8 text-center text-xs text-slate-500 relative z-10">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} PDFConverter Engine. Zero-retention ephemeral security policy active.</p>
            <div className="flex items-center gap-4">
              <span>Client-Side First Processing</span>
              <span>•</span>
              <span>FastAPI & Celery Processing</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
