'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { DropZone } from '@/components/DropZone';
import { TaskProgressModal } from '@/components/TaskProgressModal';
import { uploadForImageToText } from '@/lib/api';
import {
  ImageIcon,
  ArrowLeft,
  Settings2,
  Table2,
  ClipboardList,
  FileText,
  Sparkles,
  ScanSearch,
} from 'lucide-react';

const LANGUAGES = [
  { value: 'eng', label: 'English' },
  { value: 'fra', label: 'French' },
  { value: 'spa', label: 'Spanish' },
  { value: 'deu', label: 'German' },
  { value: 'por', label: 'Portuguese' },
  { value: 'ita', label: 'Italian' },
  { value: 'ara', label: 'Arabic' },
  { value: 'chi_sim', label: 'Chinese (Simplified)' },
  { value: 'jpn', label: 'Japanese' },
  { value: 'eng+fra', label: 'English + French' },
  { value: 'eng+spa', label: 'English + Spanish' },
  { value: 'eng+deu', label: 'English + German' },
];

const DPI_OPTIONS = [
  { value: 200, label: '200 DPI — Fast' },
  { value: 300, label: '300 DPI — Balanced (Recommended)' },
  { value: 400, label: '400 DPI — High Accuracy' },
  { value: 600, label: '600 DPI — Maximum (Slow)' },
];

const FEATURES = [
  {
    icon: ScanSearch,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    title: 'Sharp OCR Engine',
    desc: 'CLAHE contrast + bilateral filter + adaptive threshold for max accuracy',
  },
  {
    icon: Table2,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    title: 'Table Detection',
    desc: 'Automatically detects and reconstructs tables as proper Word tables',
  },
  {
    icon: ClipboardList,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    title: 'Attendance Forms',
    desc: 'Identifies attendance & registration forms with highlighted output',
  },
  {
    icon: FileText,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    title: 'Word + PDF Input',
    desc: 'Accepts PNG, JPG, TIFF, BMP, WEBP images and multi-page PDFs',
  },
];

export default function ImageToTextPage() {
  const [taskId, setTaskId] = useState<string | null>(null);
  const [language, setLanguage] = useState('eng');
  const [dpi, setDpi] = useState(300);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    setError(null);
    setIsUploading(true);
    try {
      const res = await uploadForImageToText(files[0], { language, dpi });
      setTaskId(res.task_id);
    } catch (err: any) {
      setError(err.message || 'Failed to start extraction. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-400 mb-4 shadow-lg shadow-violet-500/10"
        >
          <ImageIcon className="h-8 w-8" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-3xl font-bold text-white tracking-tight"
        >
          Image &amp; PDF → Word Document
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-slate-400 text-sm mt-2 max-w-lg mx-auto"
        >
          Extract text, tables, and attendance forms from images or PDFs with surgical
          precision — powered by{' '}
          <code className="text-violet-400 font-mono">Tesseract OCR</code> and{' '}
          <code className="text-violet-400 font-mono">OpenCV</code> image preprocessing.
          Output is a fully formatted{' '}
          <code className="text-violet-400 font-mono">.docx</code> Word document.
        </motion.p>
      </div>

      {/* Feature highlights */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="flex flex-col items-start gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm"
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${f.bg}`}>
              <f.icon className={`h-4 w-4 ${f.color}`} />
            </div>
            <p className="text-xs font-semibold text-white">{f.title}</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </motion.div>

      {/* Settings */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5 backdrop-blur-sm shadow-xl"
      >
        <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Settings2 className="w-4 h-4 text-violet-400" />
          Extraction Settings
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Language */}
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-2">
              OCR Recognition Language
            </label>
            <select
              id="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-violet-500 transition-colors"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* DPI — only relevant for PDF inputs */}
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-2">
              PDF Render DPI{' '}
              <span className="text-slate-600 font-normal">(for PDF input only)</span>
            </label>
            <select
              id="dpi-select"
              value={dpi}
              onChange={(e) => setDpi(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-violet-500 transition-colors"
            >
              {DPI_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Info chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { icon: Sparkles, text: 'Adaptive image sharpening' },
            { icon: Table2, text: 'Auto table reconstruction' },
            { icon: ClipboardList, text: 'Attendance form detection' },
          ].map((chip) => (
            <span
              key={chip.text}
              className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold text-violet-400"
            >
              <chip.icon className="h-3 w-3" />
              {chip.text}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drop zone */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <DropZone
          onFilesSelected={handleFilesSelected}
          accept={{
            'image/png': ['.png'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/bmp': ['.bmp'],
            'image/tiff': ['.tiff', '.tif'],
            'image/webp': ['.webp'],
            'image/gif': ['.gif'],
            'application/pdf': ['.pdf'],
          }}
          multiple={false}
          title={
            isUploading
              ? 'Uploading & queuing extraction…'
              : 'Upload an Image or PDF'
          }
          subtitle="Supported: PNG, JPG, BMP, TIFF, WEBP, GIF, PDF · Max 300 MB · Output: .docx Word Document"
        />
      </motion.div>

      {/* Task modal */}
      <TaskProgressModal
        taskId={taskId}
        onClose={() => setTaskId(null)}
        title="Extracting Text & Tables → Word Document"
      />
    </div>
  );
}
