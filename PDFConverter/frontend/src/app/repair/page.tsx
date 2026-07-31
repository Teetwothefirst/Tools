'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DropZone } from '@/components/DropZone';
import { TaskProgressModal } from '@/components/TaskProgressModal';
import { uploadForConversion } from '@/lib/api';
import { Wrench, ArrowLeft } from 'lucide-react';

export default function RepairPdfPage() {
  const [taskId, setTaskId] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    try {
      const res = await uploadForConversion('repair/pdf', file);
      setTaskId(res.task_id);
    } catch (err: any) {
      alert(`Error starting repair: ${err.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="text-center mb-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 mb-4">
          <Wrench className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-white">PDF Repair Utility</h1>
        <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
          Rebuild damaged cross-reference (XRef) tables, recover corrupted stream objects, and restore broken PDF files.
        </p>
      </div>

      <DropZone
        onFilesSelected={handleFileSelected}
        accept={{ 'application/pdf': ['.pdf'] }}
        multiple={false}
        title="Upload Corrupted PDF File to Repair"
        subtitle="Max file size 300MB. Powered by Ghostscript & PyMuPDF engines."
      />

      <TaskProgressModal
        taskId={taskId}
        onClose={() => setTaskId(null)}
        title="Repairing Damaged PDF"
      />
    </div>
  );
}
