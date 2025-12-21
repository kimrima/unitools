import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface PdfToImageProgress {
  percentage: number;
  currentPage?: number;
  totalPages?: number;
}

export type ImageFormat = 'jpeg' | 'png';

export interface PdfToImageOptions {
  format: ImageFormat;
  quality?: number;
  scale?: number;
}

export class PdfToImageError extends Error {
  constructor(
    public code: string,
    message?: string
  ) {
    super(message || code);
    this.name = 'PdfToImageError';
  }
}

export async function pdfToImages(
  pdfBuffer: ArrayBuffer,
  options: PdfToImageOptions,
  onProgress?: (progress: PdfToImageProgress) => void
): Promise<Blob[]> {
  const { format, quality = 0.92, scale = 2 } = options;

  try {
    const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
    const totalPages = pdf.numPages;
    const images: Blob[] = [];

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      onProgress?.({
        percentage: Math.round(((pageNum - 1) / totalPages) * 90),
        currentPage: pageNum,
        totalPages,
      });

      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) {
        throw new PdfToImageError('CANVAS_ERROR', 'Failed to get canvas context');
      }

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: context,
        viewport,
        canvas,
      };
      await page.render(renderContext).promise;

      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new PdfToImageError('CONVERSION_ERROR', 'Failed to convert page to image'));
          },
          mimeType,
          format === 'jpeg' ? quality : undefined
        );
      });

      images.push(blob);
    }

    onProgress?.({ percentage: 100, currentPage: totalPages, totalPages });

    return images;
  } catch (error) {
    if (error instanceof PdfToImageError) throw error;
    throw new PdfToImageError('CONVERSION_FAILED', 'Failed to convert PDF to images');
  }
}

export async function pdfToZip(
  pdfBuffer: ArrayBuffer,
  options: PdfToImageOptions,
  baseName: string,
  onProgress?: (progress: PdfToImageProgress) => void
): Promise<Blob> {
  const JSZip = (await import('jszip')).default;
  const images = await pdfToImages(pdfBuffer, options, onProgress);
  
  const zip = new JSZip();
  const ext = options.format === 'png' ? 'png' : 'jpg';
  
  images.forEach((blob, index) => {
    zip.file(`${baseName}_page_${index + 1}.${ext}`, blob);
  });

  return await zip.generateAsync({ type: 'blob' });
}
