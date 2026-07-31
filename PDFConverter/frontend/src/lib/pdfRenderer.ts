import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker URL
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export interface PageThumbnailInfo {
  id: string;
  fileId: string;
  fileName: string;
  pageIndex: number; // 0-based index in original file
  displayPageNum: number;
  rotation: number;
  arrayBuffer: ArrayBuffer;
}

export async function renderPdfPageToCanvas(
  arrayBuffer: ArrayBuffer,
  pageIndex: number,
  canvas: HTMLCanvasElement,
  scale = 0.4
): Promise<void> {
  try {
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      return;
    }

    // Cancel any ongoing render task on this canvas before starting a new render
    if ((canvas as any)._currentRenderTask) {
      try {
        (canvas as any)._currentRenderTask.cancel();
      } catch (cancelErr) {
        // Ignore cancellation exceptions
      }
      (canvas as any)._currentRenderTask = null;
    }

    // Always clone arrayBuffer slice before passing to PDF.js worker
    const safeDataCopy = new Uint8Array(arrayBuffer.slice(0));
    const loadingTask = pdfjsLib.getDocument({ data: safeDataCopy });
    const pdfDoc = await loadingTask.promise;
    const page = await pdfDoc.getPage(pageIndex + 1);

    const viewport = page.getViewport({ scale });
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    const renderTask = page.render(renderContext);
    (canvas as any)._currentRenderTask = renderTask;

    await renderTask.promise;
    (canvas as any)._currentRenderTask = null;
  } catch (error: any) {
    if (error?.name === 'RenderingCancelledException') {
      // Normal cancellation when canvas re-renders rapidly
      return;
    }
    console.error(`Failed to render PDF page thumbnail ${pageIndex}:`, error);
  }
}

export async function extractPdfPagesMetadata(
  file: File
): Promise<PageThumbnailInfo[]> {
  const arrayBuffer = await file.arrayBuffer();
  
  // Clone buffer for metadata reading
  const initDataCopy = new Uint8Array(arrayBuffer.slice(0));
  const loadingTask = pdfjsLib.getDocument({ data: initDataCopy });
  const pdfDoc = await loadingTask.promise;
  
  const pages: PageThumbnailInfo[] = [];
  const fileId = `${file.name}-${Date.now()}`;

  for (let i = 0; i < pdfDoc.numPages; i++) {
    pages.push({
      id: `${fileId}-p${i}`,
      fileId: fileId,
      fileName: file.name,
      pageIndex: i,
      displayPageNum: i + 1,
      rotation: 0,
      arrayBuffer: arrayBuffer.slice(0), // fresh slice copy for each page card
    });
  }

  return pages;
}
