import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface AddPageNumbersProgress {
  percentage: number;
}

export interface PageNumberOptions {
  position?: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left';
  fontSize?: number;
  margin?: number;
  startFrom?: number;
  format?: 'number' | 'of-total';
}

export class PdfAddPageNumbersError extends Error {
  constructor(public code: string, message?: string) {
    super(message || code);
    this.name = 'PdfAddPageNumbersError';
  }
}

export async function addPageNumbers(
  pdfBuffer: ArrayBuffer,
  options: PageNumberOptions = {},
  onProgress?: (progress: AddPageNumbersProgress) => void
): Promise<Blob> {
  const {
    position = 'bottom-center',
    fontSize = 12,
    margin = 30,
    startFrom = 1,
    format = 'number',
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
      const pageNum = i + startFrom;
      
      const text = format === 'of-total' 
        ? `${pageNum} / ${totalPages + startFrom - 1}` 
        : `${pageNum}`;
      
      const textWidth = font.widthOfTextAtSize(text, fontSize);

      let x: number, y: number;

      if (position.includes('left')) {
        x = margin;
      } else if (position.includes('right')) {
        x = width - textWidth - margin;
      } else {
        x = (width - textWidth) / 2;
      }

      if (position.includes('top')) {
        y = height - margin;
      } else {
        y = margin;
      }

      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(0.3, 0.3, 0.3),
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
    throw new PdfAddPageNumbersError('ADD_PAGE_NUMBERS_FAILED', 'Failed to add page numbers');
  }
}
