import { PDFDocument, degrees } from 'pdf-lib';

export interface RotateProgress {
  percentage: number;
}

export type RotationAngle = 90 | 180 | 270;

export class PdfRotateError extends Error {
  constructor(public code: string, message?: string) {
    super(message || code);
    this.name = 'PdfRotateError';
  }
}

export async function rotatePdf(
  pdfBuffer: ArrayBuffer,
  angle: RotationAngle,
  pageIndices?: number[],
  onProgress?: (progress: RotateProgress) => void
): Promise<Blob> {
  try {
    onProgress?.({ percentage: 10 });

    const pdfDoc = await PDFDocument.load(pdfBuffer, {
      ignoreEncryption: true,
    });

    const pages = pdfDoc.getPages();
    const totalPages = pages.length;
    const targetPages = pageIndices || pages.map((_, i) => i);

    onProgress?.({ percentage: 30 });

    for (let i = 0; i < targetPages.length; i++) {
      const pageIndex = targetPages[i];
      if (pageIndex >= 0 && pageIndex < totalPages) {
        const page = pages[pageIndex];
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees(currentRotation + angle));
      }
      
      onProgress?.({ 
        percentage: 30 + Math.round((i / targetPages.length) * 50) 
      });
    }

    onProgress?.({ percentage: 85 });

    const rotatedBytes = await pdfDoc.save();

    onProgress?.({ percentage: 100 });

    return new Blob([rotatedBytes], { type: 'application/pdf' });
  } catch (error) {
    throw new PdfRotateError('ROTATION_FAILED', 'Failed to rotate PDF');
  }
}
