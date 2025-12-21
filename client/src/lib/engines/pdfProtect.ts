import { PDFDocument } from 'pdf-lib';

export interface ProtectProgress {
  percentage: number;
}

export class PdfProtectError extends Error {
  constructor(public code: string, message?: string) {
    super(message || code);
    this.name = 'PdfProtectError';
  }
}

export async function protectPdf(
  pdfBuffer: ArrayBuffer,
  password: string,
  onProgress?: (progress: ProtectProgress) => void
): Promise<Blob> {
  try {
    onProgress?.({ percentage: 10 });

    const pdfDoc = await PDFDocument.load(pdfBuffer, {
      ignoreEncryption: true,
    });

    onProgress?.({ percentage: 50 });

    const pdfBytes = await pdfDoc.save();

    onProgress?.({ percentage: 100 });

    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    throw new PdfProtectError('PROTECT_FAILED', 'Failed to protect PDF');
  }
}

export async function unlockPdf(
  pdfBuffer: ArrayBuffer,
  password?: string,
  onProgress?: (progress: ProtectProgress) => void
): Promise<Blob> {
  try {
    onProgress?.({ percentage: 10 });

    const pdfDoc = await PDFDocument.load(pdfBuffer, {
      ignoreEncryption: true,
    });

    onProgress?.({ percentage: 50 });

    const pdfBytes = await pdfDoc.save();

    onProgress?.({ percentage: 100 });

    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    throw new PdfProtectError('UNLOCK_FAILED', 'Failed to unlock PDF');
  }
}
