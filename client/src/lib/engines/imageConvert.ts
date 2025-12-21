export type ImageFormat = 'jpeg' | 'png' | 'webp';

export interface ConvertOptions {
  format: ImageFormat;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface ConvertResult {
  originalFile: File;
  convertedBlob: Blob;
  originalSize: number;
  convertedSize: number;
  originalFormat: string;
  newFormat: ImageFormat;
}

export interface ConvertProgress {
  current: number;
  total: number;
  percentage: number;
}

export type ProgressCallback = (progress: ConvertProgress) => void;

export type ImageConvertErrorCode = 
  | 'NO_FILES_PROVIDED'
  | 'INVALID_IMAGE'
  | 'CONVERSION_FAILED'
  | 'CANVAS_NOT_SUPPORTED';

export class ImageConvertError extends Error {
  code: ImageConvertErrorCode;
  fileName?: string;

  constructor(code: ImageConvertErrorCode, fileName?: string) {
    super(code);
    this.code = code;
    this.fileName = fileName;
    this.name = 'ImageConvertError';
  }
}

const formatMimeMap: Record<ImageFormat, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

const formatExtensionMap: Record<ImageFormat, string> = {
  jpeg: '.jpg',
  png: '.png',
  webp: '.webp',
};

export function getFormatExtension(format: ImageFormat): string {
  return formatExtensionMap[format];
}

async function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new ImageConvertError('INVALID_IMAGE', file.name));
    };
    
    img.src = url;
  });
}

export async function convertImage(
  file: File,
  options: ConvertOptions
): Promise<ConvertResult> {
  const { format, quality = 0.92, maxWidth, maxHeight } = options;

  let img: HTMLImageElement;
  try {
    img = await loadImage(file);
  } catch {
    throw new ImageConvertError('INVALID_IMAGE', file.name);
  }

  let targetWidth = img.naturalWidth;
  let targetHeight = img.naturalHeight;

  if (maxWidth && targetWidth > maxWidth) {
    const ratio = maxWidth / targetWidth;
    targetWidth = maxWidth;
    targetHeight = Math.round(targetHeight * ratio);
  }

  if (maxHeight && targetHeight > maxHeight) {
    const ratio = maxHeight / targetHeight;
    targetHeight = maxHeight;
    targetWidth = Math.round(targetWidth * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new ImageConvertError('CANVAS_NOT_SUPPORTED');
  }

  if (format === 'jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  const mimeType = formatMimeMap[format];
  
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new ImageConvertError('CONVERSION_FAILED', file.name));
          return;
        }

        const originalFormat = file.type.split('/')[1] || 'unknown';

        resolve({
          originalFile: file,
          convertedBlob: blob,
          originalSize: file.size,
          convertedSize: blob.size,
          originalFormat,
          newFormat: format,
        });
      },
      mimeType,
      quality
    );
  });
}

export async function convertImages(
  files: File[],
  options: ConvertOptions,
  onProgress?: ProgressCallback
): Promise<ConvertResult[]> {
  if (files.length === 0) {
    throw new ImageConvertError('NO_FILES_PROVIDED');
  }

  const results: ConvertResult[] = [];
  const total = files.length;

  for (let i = 0; i < files.length; i++) {
    const result = await convertImage(files[i], options);
    results.push(result);

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
