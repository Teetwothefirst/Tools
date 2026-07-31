'use client';

import React, { useState } from 'react';
import { DropZone } from '@/components/DropZone';
import { PdfViewerGrid } from '@/components/PdfViewerGrid';
import { extractPdfPagesMetadata, PageThumbnailInfo } from '@/lib/pdfRenderer';
import { mergeAndExportPdf, downloadPdfBytes } from '@/lib/pdfMerger';
import { Layers, Download, Plus, RotateCw, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function MergePage() {
  const [pages, setPages] = useState<PageThumbnailInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleFilesSelected = async (files: File[]) => {
    setIsLoading(true);
    try {
      let newPages: PageThumbnailInfo[] = [];
      for (const file of files) {
        const filePages = await extractPdfPagesMetadata(file);
        newPages = [...newPages, ...filePages];
      }
      setPages((prev) => [...prev, ...newPages]);
    } catch (err) {
      console.error("Failed to load PDF pages:", err);
      alert("Failed to render PDF page thumbnails. Please ensure the file is a valid PDF.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRotatePage = (index: number) => {
    setPages((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], rotation: (copy[index].rotation + 90) % 360 };
      return copy;
    });
  };

  const handleDeletePage = (index: number) => {
    setPages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMovePage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= pages.length) return;
    setPages((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);
      return copy;
    });
  };

  const handleExportMergedPdf = async () => {
    if (pages.length === 0) return;
    setIsExporting(true);
    try {
      const pdfBytes = await mergeAndExportPdf(pages, 'merged_document.pdf');
      downloadPdfBytes(pdfBytes, 'merged_document.pdf');
    } catch (err) {
      console.error("Failed to merge PDF:", err);
      alert("Error occurred while generating merged PDF document.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
              <Layers className="h-8 w-8 text-brand-500" />
              <span>Merge & Organize PDF</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Visual drag-and-drop page organizer. Re-order, rotate, or delete pages locally in your browser.
            </p>
          </div>

          {pages.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPages([])}
                className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-850 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Clear All
              </button>
              
              <button
                onClick={handleExportMergedPdf}
                disabled={isExporting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-blue-500 text-white text-xs font-bold shadow-lg shadow-brand-500/25 hover:from-brand-500 hover:to-blue-400 disabled:opacity-50 transition-all"
              >
                <Download className="h-4 w-4" />
                <span>{isExporting ? "Merging PDF..." : `Export Merged PDF (${pages.length} Pages)`}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {pages.length === 0 ? (
        <div className="max-w-2xl mx-auto my-12">
          <DropZone
            onFilesSelected={handleFilesSelected}
            title="Upload PDFs to Merge & Re-order"
            subtitle="Drag and drop multiple PDF files to organize pages visually."
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <span className="text-xs font-medium text-slate-400">
              Showing {pages.length} pages ready for merge. Use arrows to re-order, rotate icon to rotate, or trash icon to delete.
            </span>

            <label className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-brand-400 transition-colors">
              <Plus className="h-4 w-4" />
              <span>Add More PDFs</span>
              <input
                type="file"
                multiple
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    handleFilesSelected(Array.from(e.target.files));
                  }
                }}
              />
            </label>
          </div>

          <PdfViewerGrid
            pages={pages}
            onRotatePage={handleRotatePage}
            onDeletePage={handleDeletePage}
            onMovePage={handleMovePage}
          />
        </div>
      )}
    </div>
  );
}
