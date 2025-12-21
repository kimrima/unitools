import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';

export interface WatermarkProgress {
  percentage: number;
}

export interface WatermarkOptions {
  text: string;
  fontSize?: number;
  opacity?: number;
  color?: { r: number; g: number; b: number };
  rotation?: number;
  position?: 'center' | 'diagonal';
}

export class PdfWatermarkError extends Error {
  constructor(public code: string, message?: string) {
    super(message || code);
    this.name = 'PdfWatermarkError';
  }
}

export async function addWatermark(
  pdfBuffer: ArrayBuffer,
  options: WatermarkOptions,
  onProgress?: (progress: WatermarkProgress) => void
): Promise<Blob> {
  const {
    text,
    fontSize = 50,
    opacity = 0.3,
    color = { r: 0.5, g: 0.5, b: 0.5 },
    rotation = 45,
    position = 'diagonal',
  } = options;

  try {
    onProgress?.({ percentage: 10 });

    const pdfDoc = await PDFDocument.load(pdfBuffer, {
      ignoreEncryption: true,
    });

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();
    const totalPages = pages.length;

    onProgress?.({ percentage: 30 });

    for (let i = 0; i < totalPages; i++) {
      const page = pages[i];
      const { width, height } = page.getSize();
      
      const textWidth = font.widthOfTextAtSize(text, fontSize);

      let x: number, y: number;
      if (position === 'center' || position === 'diagonal') {
        x = (width - textWidth) / 2;
        y = height / 2;
      } else {
        x = width / 2;
        y = height / 2;
      }

      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(color.r, color.g, color.b),
        opacity,
        rotate: degrees(rotation),
      });

      onProgress?.({
        percentage: 30 + Math.round((i / totalPages) * 60),
      });
    }

    onProgress?.({ percentage: 95 });

    const pdfBytes = await pdfDoc.save();

    onProgress?.({ percentage: 100 });

    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    throw new PdfWatermarkError('WATERMARK_FAILED', 'Failed to add watermark');
  }
}
