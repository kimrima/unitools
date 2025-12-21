import { PDFDocument } from 'pdf-lib';

export interface SplitProgress {
  current: number;
  total: number;
  percentage: number;
}

export type ProgressCallback = (progress: SplitProgress) => void;

export type PdfSplitErrorCode = 
  | 'NO_FILE_PROVIDED'
  | 'INVALID_PDF'
  | 'INVALID_PAGE_RANGE';

export class PdfSplitError extends Error {
  code: PdfSplitErrorCode;

  constructor(code: PdfSplitErrorCode) {
    super(code);
    this.code = code;
    this.name = 'PdfSplitError';
  }
}

export interface SplitResult {
  blob: Blob;
  pageNumbers: number[];
  filename: string;
}

export async function splitPdfByPages(
  pdfBuffer: ArrayBuffer,
  onProgress?: ProgressCallback
): Promise<SplitResult[]> {
  if (!pdfBuffer || pdfBuffer.byteLength === 0) {
    throw new PdfSplitError('NO_FILE_PROVIDED');
  }

  let sourcePdf: PDFDocument;
  try {
    sourcePdf = await PDFDocument.load(pdfBuffer);
  } catch {
    throw new PdfSplitError('INVALID_PDF');
  }

  const pageCount = sourcePdf.getPageCount();
  const results: SplitResult[] = [];

  for (let i = 0; i < pageCount; i++) {
    const newPdf = await PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(sourcePdf, [i]);
    newPdf.addPage(copiedPage);

    const pdfBytes = await newPdf.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });

    results.push({
      blob,
      pageNumbers: [i + 1],
      filename: `page_${i + 1}.pdf`,
    });

    if (onProgress) {
      onProgress({
        current: i + 1,
        total: pageCount,
        percentage: Math.round(((i + 1) / pageCount) * 100),
      });
    }
  }

  return results;
}

export async function splitPdfByRange(
  pdfBuffer: ArrayBuffer,
  ranges: { start: number; end: number }[],
  onProgress?: ProgressCallback
): Promise<SplitResult[]> {
  if (!pdfBuffer || pdfBuffer.byteLength === 0) {
    throw new PdfSplitError('NO_FILE_PROVIDED');
  }

  let sourcePdf: PDFDocument;
  try {
    sourcePdf = await PDFDocument.load(pdfBuffer);
  } catch {
    throw new PdfSplitError('INVALID_PDF');
  }

  const pageCount = sourcePdf.getPageCount();
  const results: SplitResult[] = [];
  const total = ranges.length;

  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i];
    
    if (range.start < 1 || range.end > pageCount || range.start > range.end) {
      throw new PdfSplitError('INVALID_PAGE_RANGE');
    }

    const newPdf = await PDFDocument.create();
    const pageIndices: number[] = [];
    
    for (let p = range.start - 1; p < range.end; p++) {
      pageIndices.push(p);
    }

    const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
    copiedPages.forEach((page) => newPdf.addPage(page));

    const pdfBytes = await newPdf.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });

    const pageNumbers = pageIndices.map(p => p + 1);
    results.push({
      blob,
      pageNumbers,
      filename: `pages_${range.start}-${range.end}.pdf`,
    });

    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        percentage: Math.round(((i + 1) / total) * 100),
      });
    }
  }

  return results;
}

export async function getPdfPageCount(pdfBuffer: ArrayBuffer): Promise<number> {
  try {
    const pdf = await PDFDocument.load(pdfBuffer);
    return pdf.getPageCount();
  } catch {
    throw new PdfSplitError('INVALID_PDF');
  }
}
