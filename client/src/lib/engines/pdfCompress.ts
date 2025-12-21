import { PDFDocument } from 'pdf-lib';

export interface CompressProgress {
  percentage: number;
  currentFile?: number;
  totalFiles?: number;
}

export class PdfCompressError extends Error {
  constructor(
    public code: string,
    message?: string,
    public fileIndex?: number
  ) {
    super(message || code);
    this.name = 'PdfCompressError';
  }
}

export async function compressPdf(
  pdfBuffer: ArrayBuffer,
  onProgress?: (progress: CompressProgress) => void
): Promise<Blob> {
  try {
    onProgress?.({ percentage: 10 });

    const pdfDoc = await PDFDocument.load(pdfBuffer, { 
      ignoreEncryption: true 
    });

    onProgress?.({ percentage: 40 });

    const compressedBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });

    onProgress?.({ percentage: 90 });

    const blob = new Blob([compressedBytes], { type: 'application/pdf' });

    onProgress?.({ percentage: 100 });

    return blob;
  } catch (error) {
    throw new PdfCompressError('COMPRESSION_FAILED', 'Failed to compress PDF');
  }
}
