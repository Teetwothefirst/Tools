import { PDFDocument, degrees } from 'pdf-lib';
import { PageThumbnailInfo } from './pdfRenderer';

export async function mergeAndExportPdf(
  pages: PageThumbnailInfo[],
  outputFileName = 'merged_document.pdf'
): Promise<Uint8Array> {
  // Create a brand new PDF document
  const mergedPdf = await PDFDocument.create();

  // Cache loaded source documents to avoid re-parsing same buffer
  const sourceDocCache: Map<string, PDFDocument> = new Map();

  for (const pageInfo of pages) {
    let sourceDoc = sourceDocCache.get(pageInfo.fileId);
    if (!sourceDoc) {
      sourceDoc = await PDFDocument.load(pageInfo.arrayBuffer.slice(0));
      sourceDocCache.set(pageInfo.fileId, sourceDoc);
    }

    // Copy page into merged document
    const [copiedPage] = await mergedPdf.copyPages(sourceDoc, [pageInfo.pageIndex]);

    // Apply rotation if needed
    if (pageInfo.rotation !== 0) {
      const currentRotation = copiedPage.getRotation().angle;
      copiedPage.setRotation(degrees((currentRotation + pageInfo.rotation) % 360));
    }

    mergedPdf.addPage(copiedPage);
  }

  // Save and return bytes
  return await mergedPdf.save();
}

export function downloadPdfBytes(pdfBytes: Uint8Array, fileName = 'merged.pdf') {
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
