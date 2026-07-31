'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DropZone } from '@/components/DropZone';
import { TaskProgressModal } from '@/components/TaskProgressModal';
import { uploadForConversion } from '@/lib/api';
import { FileText, ArrowLeft } from 'lucide-react';

export default function WordToPdfPage() {
  const [taskId, setTaskId] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    try {
      const res = await uploadForConversion('convert/word-to-pdf', file);
      setTaskId(res.task_id);
    } catch (err: any) {
      alert(`Error starting conversion: ${err.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="text-center mb-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 mb-4">
          <FileText className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-white">Word to PDF Converter</h1>
        <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
          Convert Microsoft Word (.docx or .doc) documents into standardized PDF format using headless LibreOffice.
        </p>
      </div>

      <DropZone
        onFilesSelected={handleFileSelected}
        accept={{
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
          'application/msword': ['.doc']
        }}
        multiple={false}
        title="Upload a Word document (.docx or .doc)"
        subtitle="Max file size 300MB. Converted securely on server."
      />

      <TaskProgressModal
        taskId={taskId}
        onClose={() => setTaskId(null)}
        title="Converting Word to PDF"
      />
    </div>
  );
}
