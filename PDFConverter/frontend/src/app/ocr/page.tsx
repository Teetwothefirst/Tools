'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DropZone } from '@/components/DropZone';
import { TaskProgressModal } from '@/components/TaskProgressModal';
import { uploadForOcr } from '@/lib/api';
import { ScanText, ArrowLeft, Settings2 } from 'lucide-react';

export default function OcrPage() {
  const [taskId, setTaskId] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>('eng');
  const [deskew, setDeskew] = useState<boolean>(true);
  const [clean, setClean] = useState<boolean>(true);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    try {
      const res = await uploadForOcr(file, { language, deskew, clean });
      setTaskId(res.task_id);
    } catch (err: any) {
      alert(`Error starting OCR process: ${err.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 mb-4 shadow-lg shadow-emerald-500/10">
          <ScanText className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">OCR Scanned PDF Processing Engine</h1>
        <p className="text-slate-400 text-sm mt-2 max-w-lg mx-auto">
          Convert non-editable, image-based, or scanned PDF documents into fully searchable, text-selectable PDF documents using Tesseract OCR & <code className="text-emerald-400 font-mono">ocrmypdf</code>.
        </p>
      </div>

      {/* OCR Settings Control Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 backdrop-blur-sm shadow-xl">
        <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Settings2 className="w-4 h-4 text-emerald-400" /> OCR Pipeline Settings
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-1">
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-2">OCR Recognition Languages</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="eng">English (eng)</option>
              <option value="spa">Spanish (spa)</option>
              <option value="fra">French (fra)</option>
              <option value="deu">German (deu)</option>
              <option value="eng+spa">English + Spanish (eng+spa)</option>
              <option value="eng+fra">English + French (eng+fra)</option>
              <option value="eng+deu">English + German (eng+deu)</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-4 sm:pt-6">
            <input
              type="checkbox"
              id="deskew-toggle"
              checked={deskew}
              onChange={(e) => setDeskew(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
            />
            <label htmlFor="deskew-toggle" className="text-xs text-slate-300 font-medium cursor-pointer">
              Deskew Pages <span className="block text-[11px] text-slate-500">Auto-straighten crooked scans</span>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-4 sm:pt-6">
            <input
              type="checkbox"
              id="clean-toggle"
              checked={clean}
              onChange={(e) => setClean(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
            />
            <label htmlFor="clean-toggle" className="text-xs text-slate-300 font-medium cursor-pointer">
              Clean Background <span className="block text-[11px] text-slate-500">Remove speckles & noise</span>
            </label>
          </div>
        </div>
      </div>

      <DropZone
        onFilesSelected={handleFileSelected}
        accept={{ 'application/pdf': ['.pdf'] }}
        multiple={false}
        title="Upload a Scanned or Image-Based PDF File"
        subtitle="Max file size 300MB. Processed asynchronously via Celery worker."
      />

      <TaskProgressModal
        taskId={taskId}
        onClose={() => setTaskId(null)}
        title="Running OCR Engine (ocrmypdf)"
      />
    </div>
  );
}
