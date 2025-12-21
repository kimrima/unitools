import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  quality?: number;
  useWebWorker?: boolean;
}

export interface CompressionResult {
  originalFile: File;
  compressedBlob: Blob;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

export interface CompressionProgress {
  current: number;
  total: number;
  percentage: number;
  currentFileProgress: number;
}

export type ProgressCallback = (progress: CompressionProgress) => void;

const defaultOptions: CompressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  quality: 0.8,
  useWebWorker: true,
};

export async function compressImage(
  file: File,
  options: CompressionOptions = {},
  onProgress?: (progress: number) => void
): Promise<CompressionResult> {
  const mergedOptions = { ...defaultOptions, ...options };

  const originalSize = file.size;

  const compressedBlob = await imageCompression(file, {
    maxSizeMB: mergedOptions.maxSizeMB,
    maxWidthOrHeight: mergedOptions.maxWidthOrHeight,
    initialQuality: mergedOptions.quality,
    useWebWorker: mergedOptions.useWebWorker,
    onProgress: onProgress,
  });

  const compressedSize = compressedBlob.size;
  const compressionRatio = Math.round((1 - compressedSize / originalSize) * 100);

  return {
    originalFile: file,
    compressedBlob,
    originalSize,
    compressedSize,
    compressionRatio,
  };
}

export async function compressImages(
  files: File[],
  options: CompressionOptions = {},
  onProgress?: ProgressCallback
): Promise<CompressionResult[]> {
  const results: CompressionResult[] = [];
  const total = files.length;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    const result = await compressImage(file, options, (fileProgress) => {
      if (onProgress) {
        onProgress({
          current: i + 1,
          total,
          percentage: Math.round(((i + fileProgress / 100) / total) * 100),
          currentFileProgress: fileProgress,
        });
      }
    });

    results.push(result);

    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        percentage: Math.round(((i + 1) / total) * 100),
        currentFileProgress: 100,
      });
    }
  }

  return results;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
