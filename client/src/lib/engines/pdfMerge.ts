import { PDFDocument } from 'pdf-lib';

export interface MergeProgress {
  current: number;
  total: number;
  percentage: number;
}

export type ProgressCallback = (progress: MergeProgress) => void;

export async function mergePdfFiles(
  pdfBuffers: ArrayBuffer[],
  onProgress?: ProgressCallback
): Promise<Blob> {
  if (pdfBuffers.length === 0) {
    throw new Error('No PDF files provided');
  }

  if (pdfBuffers.length === 1) {
    return new Blob([pdfBuffers[0]], { type: 'application/pdf' });
  }

  const mergedPdf = await PDFDocument.create();
  const total = pdfBuffers.length;

  for (let i = 0; i < pdfBuffers.length; i++) {
    const pdfBuffer = pdfBuffers[i];
    
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      
      pages.forEach((page) => {
        mergedPdf.addPage(page);
      });
    } catch (err) {
      throw new Error(`Failed to process PDF ${i + 1}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        percentage: Math.round(((i + 1) / total) * 100),
      });
    }
  }

  const mergedPdfBytes = await mergedPdf.save();
  return new Blob([mergedPdfBytes], { type: 'application/pdf' });
}
