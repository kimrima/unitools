import { PDFDocument } from 'pdf-lib';

export interface ImageToPdfProgress {
  percentage: number;
  currentImage?: number;
  totalImages?: number;
}

export class ImageToPdfError extends Error {
  constructor(
    public code: string,
    message?: string,
    public fileIndex?: number
  ) {
    super(message || code);
    this.name = 'ImageToPdfError';
  }
}

export async function imagesToPdf(
  imageBuffers: ArrayBuffer[],
  fileTypes: string[],
  onProgress?: (progress: ImageToPdfProgress) => void
): Promise<Blob> {
  if (imageBuffers.length === 0) {
    throw new ImageToPdfError('NO_IMAGES_PROVIDED', 'No images provided');
  }

  try {
    const pdfDoc = await PDFDocument.create();
    const totalImages = imageBuffers.length;

    for (let i = 0; i < imageBuffers.length; i++) {
      const buffer = imageBuffers[i];
      const fileType = fileTypes[i]?.toLowerCase() || '';

      onProgress?.({
        percentage: Math.round((i / totalImages) * 80),
        currentImage: i + 1,
        totalImages,
      });

      let image;
      if (fileType.includes('png')) {
        image = await pdfDoc.embedPng(buffer);
      } else if (fileType.includes('jpg') || fileType.includes('jpeg')) {
        image = await pdfDoc.embedJpg(buffer);
      } else {
        try {
          image = await pdfDoc.embedJpg(buffer);
        } catch {
          image = await pdfDoc.embedPng(buffer);
        }
      }

      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });
    }

    onProgress?.({ percentage: 90 });

    const pdfBytes = await pdfDoc.save();

    onProgress?.({ percentage: 100 });

    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    if (error instanceof ImageToPdfError) throw error;
    throw new ImageToPdfError('CONVERSION_FAILED', 'Failed to convert images to PDF');
  }
}
