import { PDFDocument } from 'pdf-lib';

export interface PageOpsProgress {
  percentage: number;
}

export class PdfPageOpsError extends Error {
  constructor(public code: string, message?: string) {
    super(message || code);
    this.name = 'PdfPageOpsError';
  }
}

export async function deletePages(
  pdfBuffer: ArrayBuffer,
  pageIndicesToDelete: number[],
  onProgress?: (progress: PageOpsProgress) => void
): Promise<Blob> {
  try {
    onProgress?.({ percentage: 10 });

    const pdfDoc = await PDFDocument.load(pdfBuffer, {
      ignoreEncryption: true,
    });

    const totalPages = pdfDoc.getPageCount();
    const sortedIndices = [...pageIndicesToDelete].sort((a, b) => b - a);

    onProgress?.({ percentage: 30 });

    for (const index of sortedIndices) {
      if (index >= 0 && index < totalPages) {
        pdfDoc.removePage(index);
      }
    }

    onProgress?.({ percentage: 80 });

    const pdfBytes = await pdfDoc.save();

    onProgress?.({ percentage: 100 });

    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    throw new PdfPageOpsError('DELETE_PAGES_FAILED', 'Failed to delete pages');
  }
}

export async function extractPages(
  pdfBuffer: ArrayBuffer,
  pageIndicesToExtract: number[],
  onProgress?: (progress: PageOpsProgress) => void
): Promise<Blob> {
  try {
    onProgress?.({ percentage: 10 });

    const srcDoc = await PDFDocument.load(pdfBuffer, {
      ignoreEncryption: true,
    });

    const newDoc = await PDFDocument.create();

    onProgress?.({ percentage: 30 });

    const validIndices = pageIndicesToExtract
      .filter(i => i >= 0 && i < srcDoc.getPageCount())
      .sort((a, b) => a - b);

    const copiedPages = await newDoc.copyPages(srcDoc, validIndices);

    onProgress?.({ percentage: 70 });

    for (const page of copiedPages) {
      newDoc.addPage(page);
    }

    const pdfBytes = await newDoc.save();

    onProgress?.({ percentage: 100 });

    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    throw new PdfPageOpsError('EXTRACT_PAGES_FAILED', 'Failed to extract pages');
  }
}

export async function reorderPages(
  pdfBuffer: ArrayBuffer,
  newOrder: number[],
  onProgress?: (progress: PageOpsProgress) => void
): Promise<Blob> {
  try {
    onProgress?.({ percentage: 10 });

    const srcDoc = await PDFDocument.load(pdfBuffer, {
      ignoreEncryption: true,
    });

    const newDoc = await PDFDocument.create();

    onProgress?.({ percentage: 30 });

    const validOrder = newOrder.filter(i => i >= 0 && i < srcDoc.getPageCount());
    const copiedPages = await newDoc.copyPages(srcDoc, validOrder);

    onProgress?.({ percentage: 70 });

    for (const page of copiedPages) {
      newDoc.addPage(page);
    }

    const pdfBytes = await newDoc.save();

    onProgress?.({ percentage: 100 });

    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    throw new PdfPageOpsError('REORDER_PAGES_FAILED', 'Failed to reorder pages');
  }
}
