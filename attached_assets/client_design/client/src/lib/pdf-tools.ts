// PDF Tools - Client-side using pdf-lib
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';

export interface PdfToolResult {
  blob?: Blob;
  dataUrl: string;
  pageCount: number;
  size: number;
  filename: string;
  requiresServer?: boolean;
  message?: string;
}

function getServerRequiredMessage(toolId: string): string {
  const messages: Record<string, string> = {
    'compress-pdf': 'PDF compression requires advanced algorithms available on our server.',
    'word-to-pdf': 'Converting Word documents to PDF requires Microsoft Office integration.',
    'excel-to-pdf': 'Converting Excel spreadsheets to PDF requires server processing.',
    'ppt-to-pdf': 'Converting PowerPoint presentations to PDF requires server processing.',
    'csv-to-pdf': 'CSV to PDF conversion is being prepared.',
    'html-to-pdf': 'HTML to PDF conversion requires browser rendering engine.',
    'xml-to-pdf': 'XML to PDF conversion is being prepared.',
    'pdf-to-word': 'Converting PDF to Word requires advanced OCR and formatting.',
    'pdf-to-excel': 'Converting PDF to Excel requires data extraction algorithms.',
    'pdf-to-ppt': 'Converting PDF to PowerPoint requires layout analysis.',
    'pdf-to-jpg': 'PDF to image conversion requires rendering engine.',
    'pdf-to-png': 'PDF to image conversion requires rendering engine.',
    'pdf-to-text': 'PDF text extraction with OCR is being prepared.',
    'pdf-to-html': 'PDF to HTML conversion requires layout preservation.',
    'pdf-to-csv': 'PDF to CSV requires table detection algorithms.',
    'pdf-to-xml': 'PDF to XML conversion is being prepared.',
    'protect-pdf': 'PDF password protection requires encryption libraries.',
    'unlock-pdf': 'PDF unlocking requires server-side processing.',
    'esign-pdf': 'Electronic signature requires secure signing infrastructure.',
    'remove-watermark-pdf': 'Watermark removal requires image processing on server.',
    'crop-pdf': 'PDF cropping is being prepared for client-side processing.'
  };
  return messages[toolId] || 'This feature requires server-side processing. Coming soon!';
}

// Load PDF from file
async function loadPdf(file: File): Promise<PDFDocument> {
  const arrayBuffer = await file.arrayBuffer();
  return PDFDocument.load(arrayBuffer);
}

// Compress PDF via server API (uses Ghostscript)
async function compressPdfViaServer(file: File, quality: string = 'ebook'): Promise<PdfToolResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('quality', quality);

  const response = await fetch('/api/process/pdf-compress', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Compression failed' }));
    throw new Error(error.error || 'PDF compression failed');
  }

  const blob = await response.blob();
  return {
    blob,
    dataUrl: URL.createObjectURL(blob),
    pageCount: 0, // Unknown after compression
    size: blob.size,
    filename: 'compressed.pdf'
  };
}

// Merge multiple PDFs
export async function mergePdfs(files: File[]): Promise<PdfToolResult> {
  const mergedPdf = await PDFDocument.create();
  
  for (const file of files) {
    const pdf = await loadPdf(file);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach(page => mergedPdf.addPage(page));
  }

  const pdfBytes = await mergedPdf.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  
  return {
    blob,
    dataUrl: URL.createObjectURL(blob),
    pageCount: mergedPdf.getPageCount(),
    size: blob.size,
    filename: 'merged.pdf'
  };
}

// Split PDF - extract specific pages
export async function splitPdf(file: File, pageNumbers: number[]): Promise<PdfToolResult> {
  const sourcePdf = await loadPdf(file);
  const newPdf = await PDFDocument.create();
  
  const indices = pageNumbers.map(p => p - 1).filter(i => i >= 0 && i < sourcePdf.getPageCount());
  const pages = await newPdf.copyPages(sourcePdf, indices);
  pages.forEach(page => newPdf.addPage(page));

  const pdfBytes = await newPdf.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  
  return {
    blob,
    dataUrl: URL.createObjectURL(blob),
    pageCount: newPdf.getPageCount(),
    size: blob.size,
    filename: 'extracted.pdf'
  };
}

// Remove pages from PDF
export async function removePages(file: File, pagesToRemove: number[]): Promise<PdfToolResult> {
  const sourcePdf = await loadPdf(file);
  const totalPages = sourcePdf.getPageCount();
  const keepIndices = [];
  
  for (let i = 0; i < totalPages; i++) {
    if (!pagesToRemove.includes(i + 1)) {
      keepIndices.push(i);
    }
  }

  const newPdf = await PDFDocument.create();
  const pages = await newPdf.copyPages(sourcePdf, keepIndices);
  pages.forEach(page => newPdf.addPage(page));

  const pdfBytes = await newPdf.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  
  return {
    blob,
    dataUrl: URL.createObjectURL(blob),
    pageCount: newPdf.getPageCount(),
    size: blob.size,
    filename: 'modified.pdf'
  };
}

// Remove odd/even pages
export async function removeOddEvenPages(file: File, removeOdd: boolean): Promise<PdfToolResult> {
  const sourcePdf = await loadPdf(file);
  const totalPages = sourcePdf.getPageCount();
  const keepIndices = [];
  
  for (let i = 0; i < totalPages; i++) {
    const pageNum = i + 1;
    const isOdd = pageNum % 2 === 1;
    if ((removeOdd && !isOdd) || (!removeOdd && isOdd)) {
      keepIndices.push(i);
    }
  }

  const newPdf = await PDFDocument.create();
  const pages = await newPdf.copyPages(sourcePdf, keepIndices);
  pages.forEach(page => newPdf.addPage(page));

  const pdfBytes = await newPdf.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  
  return {
    blob,
    dataUrl: URL.createObjectURL(blob),
    pageCount: newPdf.getPageCount(),
    size: blob.size,
    filename: removeOdd ? 'even-pages.pdf' : 'odd-pages.pdf'
  };
}

// Remove first/last page
export async function removeFirstLastPage(file: File, removeFirst: boolean): Promise<PdfToolResult> {
  const sourcePdf = await loadPdf(file);
  const totalPages = sourcePdf.getPageCount();
  
  if (totalPages <= 1) {
    throw new Error('Cannot remove page from single-page PDF');
  }

  const keepIndices = [];
  for (let i = 0; i < totalPages; i++) {
    if (removeFirst && i === 0) continue;
    if (!removeFirst && i === totalPages - 1) continue;
    keepIndices.push(i);
  }

  const newPdf = await PDFDocument.create();
  const pages = await newPdf.copyPages(sourcePdf, keepIndices);
  pages.forEach(page => newPdf.addPage(page));

  const pdfBytes = await newPdf.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  
  return {
    blob,
    dataUrl: URL.createObjectURL(blob),
    pageCount: newPdf.getPageCount(),
    size: blob.size,
    filename: removeFirst ? 'without-first.pdf' : 'without-last.pdf'
  };
}

// Rotate PDF pages
export async function rotatePdf(file: File, angle: number): Promise<PdfToolResult> {
  const pdf = await loadPdf(file);
  const pages = pdf.getPages();
  
  pages.forEach(page => {
    page.setRotation(degrees(page.getRotation().angle + angle));
  });

  const pdfBytes = await pdf.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  
  return {
    blob,
    dataUrl: URL.createObjectURL(blob),
    pageCount: pdf.getPageCount(),
    size: blob.size,
    filename: 'rotated.pdf'
  };
}

// Add watermark to PDF
export async function addWatermark(file: File, text: string): Promise<PdfToolResult> {
  const pdf = await loadPdf(file);
  const pages = pdf.getPages();
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);

  pages.forEach(page => {
    const { width, height } = page.getSize();
    const fontSize = Math.min(width, height) / 8;
    
    page.drawText(text, {
      x: width / 2 - (text.length * fontSize * 0.3),
      y: height / 2,
      size: fontSize,
      font,
      color: rgb(0.7, 0.7, 0.7),
      opacity: 0.3,
      rotate: degrees(-45)
    });
  });

  const pdfBytes = await pdf.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  
  return {
    blob,
    dataUrl: URL.createObjectURL(blob),
    pageCount: pdf.getPageCount(),
    size: blob.size,
    filename: 'watermarked.pdf'
  };
}

// Add page numbers
export async function addPageNumbers(file: File, position: 'bottom' | 'top' = 'bottom'): Promise<PdfToolResult> {
  const pdf = await loadPdf(file);
  const pages = pdf.getPages();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const total = pages.length;

  pages.forEach((page, i) => {
    const { width, height } = page.getSize();
    const text = `${i + 1} / ${total}`;
    
    page.drawText(text, {
      x: width / 2 - 20,
      y: position === 'bottom' ? 30 : height - 30,
      size: 12,
      font,
      color: rgb(0, 0, 0)
    });
  });

  const pdfBytes = await pdf.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  
  return {
    blob,
    dataUrl: URL.createObjectURL(blob),
    pageCount: pdf.getPageCount(),
    size: blob.size,
    filename: 'numbered.pdf'
  };
}

// Image to PDF
export async function imageToPdf(file: File): Promise<PdfToolResult> {
  const pdf = await PDFDocument.create();
  
  const imageBytes = await file.arrayBuffer();
  let image;
  
  if (file.type === 'image/png') {
    image = await pdf.embedPng(imageBytes);
  } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
    image = await pdf.embedJpg(imageBytes);
  } else {
    // Convert other formats using canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        resolve();
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
    
    const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const base64 = jpgDataUrl.split(',')[1];
    const jpgBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    image = await pdf.embedJpg(jpgBytes);
  }

  const page = pdf.addPage([image.width, image.height]);
  page.drawImage(image, {
    x: 0,
    y: 0,
    width: image.width,
    height: image.height
  });

  const pdfBytes = await pdf.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  
  return {
    blob,
    dataUrl: URL.createObjectURL(blob),
    pageCount: 1,
    size: blob.size,
    filename: 'image.pdf'
  };
}

// Text to PDF
export async function textToPdf(text: string): Promise<PdfToolResult> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  const margin = 50;
  const lineHeight = fontSize * 1.5;
  
  const lines = text.split('\n');
  let currentPage = pdf.addPage();
  let { height } = currentPage.getSize();
  let y = height - margin;

  for (const line of lines) {
    if (y < margin + lineHeight) {
      currentPage = pdf.addPage();
      const size = currentPage.getSize();
      height = size.height;
      y = height - margin;
    }
    
    currentPage.drawText(line.slice(0, 100), {
      x: margin,
      y,
      size: fontSize,
      font,
      color: rgb(0, 0, 0)
    });
    y -= lineHeight;
  }

  const pdfBytes = await pdf.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  
  return {
    blob,
    dataUrl: URL.createObjectURL(blob),
    pageCount: pdf.getPageCount(),
    size: blob.size,
    filename: 'text.pdf'
  };
}

// Check if PDF tool is supported client-side
export function isPdfToolSupported(toolId: string): boolean {
  const supported = [
    'merge-pdf', 'split-pdf', 'extract-pdf-pages', 'remove-pdf-pages',
    'remove-pdf-pages-odd', 'remove-pdf-pages-even', 'remove-pdf-first', 'remove-pdf-last',
    'rotate-pdf', 'add-watermark-pdf', 'add-page-numbers',
    'jpg-to-pdf', 'png-to-pdf', 'webp-to-pdf', 'text-to-pdf'
  ];
  return supported.includes(toolId);
}

// Process PDF tool by ID
export async function processPdfTool(toolId: string, file: File | null, files: File[], options: any = {}): Promise<PdfToolResult> {
  switch (toolId) {
    case 'merge-pdf':
      if (files.length < 2) throw new Error('Need at least 2 files to merge');
      return mergePdfs(files);
    
    case 'split-pdf':
    case 'extract-pdf-pages':
      if (!file) throw new Error('No file provided');
      return splitPdf(file, options.pages || [1]);
    
    case 'remove-pdf-pages':
      if (!file) throw new Error('No file provided');
      return removePages(file, options.pages || []);
    
    case 'remove-pdf-pages-odd':
      if (!file) throw new Error('No file provided');
      return removeOddEvenPages(file, true);
    
    case 'remove-pdf-pages-even':
      if (!file) throw new Error('No file provided');
      return removeOddEvenPages(file, false);
    
    case 'remove-pdf-first':
      if (!file) throw new Error('No file provided');
      return removeFirstLastPage(file, true);
    
    case 'remove-pdf-last':
      if (!file) throw new Error('No file provided');
      return removeFirstLastPage(file, false);
    
    case 'rotate-pdf':
      if (!file) throw new Error('No file provided');
      return rotatePdf(file, options.angle || 90);
    
    case 'add-watermark-pdf':
      if (!file) throw new Error('No file provided');
      return addWatermark(file, options.text || 'WATERMARK');
    
    case 'add-page-numbers':
      if (!file) throw new Error('No file provided');
      return addPageNumbers(file, options.position || 'bottom');
    
    case 'jpg-to-pdf':
    case 'png-to-pdf':
    case 'webp-to-pdf':
      if (!file) throw new Error('No file provided');
      return imageToPdf(file);
    
    case 'text-to-pdf':
      return textToPdf(options.text || '');
    
    // PDF Compression via server API
    case 'compress-pdf':
      if (!file) throw new Error('No file provided');
      return compressPdfViaServer(file, options.quality || 'ebook');
    
    // Server-required tools (paid/complex) - return special result with message
    case 'word-to-pdf':
    case 'excel-to-pdf':
    case 'ppt-to-pdf':
    case 'csv-to-pdf':
    case 'html-to-pdf':
    case 'xml-to-pdf':
    case 'pdf-to-word':
    case 'pdf-to-excel':
    case 'pdf-to-ppt':
    case 'pdf-to-jpg':
    case 'pdf-to-png':
    case 'pdf-to-text':
    case 'pdf-to-html':
    case 'pdf-to-csv':
    case 'pdf-to-xml':
    case 'protect-pdf':
    case 'unlock-pdf':
    case 'esign-pdf':
    case 'remove-watermark-pdf':
    case 'crop-pdf':
      return {
        dataUrl: '',
        filename: 'server-required.pdf',
        pageCount: 0,
        size: 0,
        requiresServer: true,
        message: getServerRequiredMessage(toolId)
      };
    
    default:
      throw new Error(`Unknown PDF tool: ${toolId}`);
  }
}

// Download PDF result
export function downloadPdf(result: PdfToolResult) {
  const a = document.createElement('a');
  a.href = result.dataUrl;
  a.download = result.filename;
  a.click();
}
