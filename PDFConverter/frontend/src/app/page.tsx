'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Layers, FileCode, FileText, Wrench, Shield, Zap, Cpu } from 'lucide-react';
import { ToolCard } from '@/components/ToolCard';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold text-brand-400 mb-6"
        >
          <Zap className="h-3.5 w-3.5" />
          <span>Client-Side First Processing + High Performance Engine</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white"
        >
          Manipulate, Convert & Repair <span className="bg-gradient-to-r from-brand-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">PDF Documents</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-lg text-slate-300 leading-relaxed"
        >
          A full-stack document processing platform. Execute lightweight merges and page organization directly inside your browser with <code className="text-brand-400">pdf-lib</code>, or convert and repair documents with server-side engines.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-wrap justify-center gap-6 text-xs font-semibold text-slate-400"
        >
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span>Zero Permanent Storage (Auto-delete in 2h)</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-blue-400" />
            <span>300MB Maximum File Cap</span>
          </div>
        </motion.div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ToolCard
          title="Merge & Organize PDF"
          description="Drag-and-drop multiple PDFs, visually re-order pages using canvas thumbnails, rotate pages, and merge purely client-side."
          href="/merge"
          icon={Layers}
          gradient="from-brand-600 to-blue-500"
          badge="Browser Engine"
        />

        <ToolCard
          title="PDF to Word"
          description="Extract layout, tables, graphics, and text from PDF files into fully editable Microsoft Word (.docx) documents using pdf2docx."
          href="/pdf-to-word"
          icon={FileCode}
          gradient="from-blue-600 to-indigo-500"
          badge="FastAPI Engine"
        />

        <ToolCard
          title="Word to PDF"
          description="Convert Microsoft Word documents (.docx/.doc) into crisp, standardized PDF format using headless LibreOffice."
          href="/word-to-pdf"
          icon={FileText}
          gradient="from-cyan-600 to-blue-600"
          badge="LibreOffice CLI"
        />

        <ToolCard
          title="PDF Repair Utility"
          description="Fix corrupted PDF XRef tables, broken stream headers, and invalid structures using Ghostscript & PyMuPDF engines."
          href="/repair"
          icon={Wrench}
          gradient="from-emerald-600 to-teal-500"
          badge="Ghostscript / fitz"
        />
      </div>
    </div>
  );
}
