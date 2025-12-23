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

export async function pdfToImages(
  pdfBuffer: ArrayBuffer,
  options: PdfToImageOptions,
  onProgress?: (progress: PdfToImageProgress) => void
): Promise<Blob[]> {
  const { format, quality = 0.92, scale = 2 } = options;

  try {
    // Disable offscreen canvas to force synchronous image processing in main thread
    // This helps with PDFs containing images that fail to decode asynchronously
    const pdf = await pdfjsLib.getDocument({ 
      data: pdfBuffer,
      isOffscreenCanvasSupported: false,
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

      // Get operator list first to ensure all page resources are processed
      // This forces pdf.js to decode all images before we render
      const opList = await page.getOperatorList();
      
      // Wait for all page objects (images) to be fully loaded
      // The commonObjs and objs contain decoded image data
      const objsToWait: Promise<unknown>[] = [];
      
      // Check each operator for image references and ensure they're loaded
      for (let i = 0; i < opList.fnArray.length; i++) {
        const fn = opList.fnArray[i];
        // OPS.paintImageXObject = 85, OPS.paintImageMaskXObject = 83
        if (fn === 85 || fn === 83) {
          const args = opList.argsArray[i];
          if (args && args[0]) {
            const objId = args[0];
            // Try to get the object, which forces it to be decoded
            try {
              const objPromise = new Promise<void>((resolve) => {
                page.objs.get(objId, () => resolve());
              });
              objsToWait.push(objPromise);
            } catch {
              // Object might already be loaded or not exist
            }
          }
        }
      }
      
      // Wait for all image objects to be loaded
      if (objsToWait.length > 0) {
        await Promise.all(objsToWait);
      }

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) {
        throw new PdfToImageError('CANVAS_ERROR', 'Failed to get canvas context');
      }

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Fill with white background for JPEG format (prevents transparency issues)
      if (format === 'jpeg') {
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Use 'print' intent to ensure all images with soft masks are fully rendered
      const renderContext = {
        canvasContext: context,
        viewport,
        canvas,
        intent: 'print' as const,
      };
      
      // Render the page
      const renderTask = page.render(renderContext);
      await renderTask.promise;

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
