import React, { useEffect, useRef } from 'react';
import { PageThumbnailInfo, renderPdfPageToCanvas } from '@/lib/pdfRenderer';
import { RotateCw, Trash2, ArrowLeft, ArrowRight, FileText } from 'lucide-react';

interface PdfThumbnailCardProps {
  page: PageThumbnailInfo;
  index: number;
  totalCount: number;
  onRotate: (index: number) => void;
  onDelete: (index: number) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
}

const PdfThumbnailCard: React.FC<PdfThumbnailCardProps> = ({
  page,
  index,
  totalCount,
  onRotate,
  onDelete,
  onMove,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let activeCanvas = canvasRef.current;
    if (activeCanvas) {
      renderPdfPageToCanvas(page.arrayBuffer, page.pageIndex, activeCanvas);
    }
    return () => {
      if (activeCanvas && (activeCanvas as any)._currentRenderTask) {
        try {
          (activeCanvas as any)._currentRenderTask.cancel();
        } catch (e) {}
      }
    };
  }, [page]);

  return (
    <div className="group relative flex flex-col items-center rounded-2xl border border-slate-800 bg-slate-900/80 p-3 shadow-lg hover:border-brand-500/50 transition-all">
      {/* Canvas Thumbnail */}
      <div 
        className="relative flex items-center justify-center overflow-hidden rounded-lg bg-slate-950 p-2 shadow-inner w-full min-h-[180px]"
        style={{ transform: `rotate(${page.rotation}deg)` }}
      >
        <canvas ref={canvasRef} className="max-h-[220px] w-auto max-w-full object-contain rounded shadow" />
      </div>

      {/* Page Info */}
      <div className="mt-3 flex items-center justify-between w-full text-xs text-slate-400 px-1">
        <span className="font-semibold text-slate-300">Page {index + 1}</span>
        <span className="truncate max-w-[100px] text-[10px] text-slate-500" title={page.fileName}>
          {page.fileName}
        </span>
      </div>

      {/* Action Toolbar */}
      <div className="mt-3 flex items-center justify-between w-full border-t border-slate-800/80 pt-2 gap-1">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onMove(index, index - 1)}
            disabled={index === 0}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"
            title="Move Left"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onMove(index, index + 1)}
            disabled={index === totalCount - 1}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"
            title="Move Right"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onRotate(index)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-400 hover:bg-slate-800"
            title="Rotate 90° Clockwise"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(index)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
            title="Delete Page"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface PdfViewerGridProps {
  pages: PageThumbnailInfo[];
  onRotatePage: (index: number) => void;
  onDeletePage: (index: number) => void;
  onMovePage: (fromIndex: number, toIndex: number) => void;
}

export const PdfViewerGrid: React.FC<PdfViewerGridProps> = ({
  pages,
  onRotatePage,
  onDeletePage,
  onMovePage,
}) => {
  if (pages.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {pages.map((page, idx) => (
        <PdfThumbnailCard
          key={`${page.id}-${idx}`}
          page={page}
          index={idx}
          totalCount={pages.length}
          onRotate={onRotatePage}
          onDelete={onDeletePage}
          onMove={onMovePage}
        />
      ))}
    </div>
  );
};
