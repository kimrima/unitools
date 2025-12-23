import { PDFDocument, degrees } from 'pdf-lib';

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

async function createWatermarkImage(
  text: string,
  fontSize: number,
  color: { r: number; g: number; b: number },
  opacity: number
): Promise<Uint8Array> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  ctx.font = `bold ${fontSize}px "Noto Sans KR", "Malgun Gothic", sans-serif`;
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const textHeight = fontSize * 1.2;

  const padding = 20;
  canvas.width = textWidth + padding * 2;
  canvas.height = textHeight + padding * 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  ctx.font = `bold ${fontSize}px "Noto Sans KR", "Malgun Gothic", sans-serif`;
  ctx.fillStyle = `rgba(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)}, ${opacity})`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const dataUrl = canvas.toDataURL('image/png');
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new Uint8Array(await blob.arrayBuffer());
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
  } = options;

  try {
    onProgress?.({ percentage: 10 });

    const pdfDoc = await PDFDocument.load(pdfBuffer, {
      ignoreEncryption: true,
    });

    const watermarkImageBytes = await createWatermarkImage(text, fontSize, color, opacity);
    const watermarkImage = await pdfDoc.embedPng(watermarkImageBytes);
    
    const pages = pdfDoc.getPages();
    const totalPages = pages.length;

    onProgress?.({ percentage: 30 });

    for (let i = 0; i < totalPages; i++) {
      const page = pages[i];
      const { width, height } = page.getSize();
      
      const imgWidth = watermarkImage.width;
      const imgHeight = watermarkImage.height;
      
      const x = (width - imgWidth) / 2;
      const y = (height - imgHeight) / 2;

      page.drawImage(watermarkImage, {
        x,
        y,
        width: imgWidth,
        height: imgHeight,
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
