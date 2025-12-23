import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

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

async function waitForImageDecoding(page: pdfjsLib.PDFPageProxy): Promise<void> {
  // Get operator list to find all image references
  const opList = await page.getOperatorList();
  
  const imagePromises: Promise<void>[] = [];
  
  // OPS.paintImageXObject = 85
  // OPS.paintImageMaskXObject = 83  
  // OPS.paintImageXObjectRepeat = 88
  for (let i = 0; i < opList.fnArray.length; i++) {
    const fn = opList.fnArray[i];
    if (fn === 85 || fn === 83 || fn === 88) {
      const args = opList.argsArray[i];
      if (args && args[0]) {
        const objId = args[0];
        imagePromises.push(
          new Promise<void>((resolve) => {
            // page.objs.get will call the callback when the object is ready
            page.objs.get(objId, () => resolve());
          })
        );
      }
    }
  }
  
  if (imagePromises.length > 0) {
    await Promise.all(imagePromises);
  }
}

export async function pdfToImages(
  pdfBuffer: ArrayBuffer,
  options: PdfToImageOptions,
  onProgress?: (progress: PdfToImageProgress) => void
): Promise<Blob[]> {
  const { format, quality = 0.92, scale = 2 } = options;

  try {
    // Configure pdf.js for better image handling
    const pdf = await pdfjsLib.getDocument({ 
      data: pdfBuffer,
      // Disable offscreen canvas for more reliable image decoding
      isOffscreenCanvasSupported: false,
      // Disable streaming to ensure all data is loaded
      disableStream: true,
      disableAutoFetch: false,
    }).promise;
    
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

      // Wait for all images on this page to be decoded
      await waitForImageDecoding(page);

      const canvas = document.createElement('canvas');
      // Use willReadFrequently for better performance with toBlob
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) {
        throw new PdfToImageError('CANVAS_ERROR', 'Failed to get canvas context');
      }

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Fill with white background for JPEG format
      if (format === 'jpeg') {
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Render with print intent for complete image rendering
      const renderContext = {
        canvasContext: context,
        viewport,
        canvas,
        intent: 'print' as const,
      };
      
      const renderTask = page.render(renderContext);
      await renderTask.promise;
      
      // Wait for any asynchronous image decoding to complete
      // Some PDFs have images that decode asynchronously after render completes
      await new Promise<void>(resolve => setTimeout(resolve, 1000));

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
      
      // Clean up page resources
      page.cleanup();
    }

    onProgress?.({ percentage: 100, currentPage: totalPages, totalPages });

    return images;
  } catch (error) {
    console.error('PDF to Image conversion error:', error);
    if (error instanceof PdfToImageError) throw error;
    throw new PdfToImageError('CONVERSION_FAILED', 'Failed to convert PDF to images');
  }
}

export async function imagesToZip(
  images: Blob[],
  format: ImageFormat,
  baseName: string
): Promise<Blob> {
  const JSZip = (await import('jszip')).default;
  
  const zip = new JSZip();
  const ext = format === 'png' ? 'png' : 'jpg';
  
  images.forEach((blob, index) => {
    zip.file(`${baseName}_page_${index + 1}.${ext}`, blob);
  });

  return await zip.generateAsync({ type: 'blob' });
}

export async function pdfToZip(
  pdfBuffer: ArrayBuffer,
  options: PdfToImageOptions,
  baseName: string,
  onProgress?: (progress: PdfToImageProgress) => void
): Promise<Blob> {
  const images = await pdfToImages(pdfBuffer, options, onProgress);
  return imagesToZip(images, options.format, baseName);
}
