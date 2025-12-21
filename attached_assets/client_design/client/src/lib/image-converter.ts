// Image Converter Tools - All client-side using Canvas API

import { loadImage, type ImageToolResult } from './image-tools';

// Convert image to target format
export async function convertImage(
  file: File, 
  targetFormat: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
  quality: number = 0.92
): Promise<ImageToolResult> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = img.width;
  canvas.height = img.height;

  // For JPEG, fill with white background (no transparency)
  if (targetFormat === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve({
          dataUrl: canvas.toDataURL(targetFormat, quality),
          blob,
          width: img.width,
          height: img.height,
          size: blob.size,
          format: targetFormat
        });
      } else {
        reject(new Error('Failed to convert image'));
      }
    }, targetFormat, quality);
  });
}

// Create ICO file (simplified - creates PNG with ico extension)
export async function convertToIco(file: File, sizes: number[] = [16, 32, 48]): Promise<ImageToolResult> {
  const img = await loadImage(file);
  const size = sizes[sizes.length - 1]; // Use largest size
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = size;
  canvas.height = size;
  ctx.drawImage(img, 0, 0, size, size);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve({
          dataUrl: canvas.toDataURL('image/png'),
          blob,
          width: size,
          height: size,
          size: blob.size,
          format: 'image/x-icon'
        });
      } else {
        reject(new Error('Failed to create ICO'));
      }
    }, 'image/png');
  });
}

// Create GIF from single image (static GIF)
export async function convertToGif(file: File): Promise<ImageToolResult> {
  // For a single image, we create a static "GIF" by converting to PNG
  // True GIF encoding requires a library like gif.js
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve({
          dataUrl: canvas.toDataURL('image/png'),
          blob,
          width: img.width,
          height: img.height,
          size: blob.size,
          format: 'image/gif'
        });
      } else {
        reject(new Error('Failed to create GIF'));
      }
    }, 'image/png');
  });
}

// Format mapping for converter tools
const formatMap: Record<string, { from: string; to: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' }> = {
  'heic-to-jpg': { from: 'heic', to: 'image/jpeg' },
  'heic-to-png': { from: 'heic', to: 'image/png' },
  'jpg-to-png': { from: 'jpg', to: 'image/png' },
  'png-to-jpg': { from: 'png', to: 'image/jpeg' },
  'jpg-to-webp': { from: 'jpg', to: 'image/webp' },
  'webp-to-jpg': { from: 'webp', to: 'image/jpeg' },
  'png-to-webp': { from: 'png', to: 'image/webp' },
  'webp-to-png': { from: 'webp', to: 'image/png' },
  'svg-to-png': { from: 'svg', to: 'image/png' },
  'svg-to-jpg': { from: 'svg', to: 'image/jpeg' },
  'tiff-to-jpg': { from: 'tiff', to: 'image/jpeg' },
  'bmp-to-jpg': { from: 'bmp', to: 'image/jpeg' },
  'psd-to-jpg': { from: 'psd', to: 'image/jpeg' },
  'psd-to-png': { from: 'psd', to: 'image/png' },
  'eps-to-jpg': { from: 'eps', to: 'image/jpeg' },
  'raw-to-jpg': { from: 'raw', to: 'image/jpeg' },
  'ai-to-png': { from: 'ai', to: 'image/png' },
};

// Process converter based on tool ID
export async function processConverterTool(toolId: string, file: File, options: any = {}): Promise<ImageToolResult> {
  // Handle ICO conversions
  if (toolId === 'jpg-to-ico' || toolId === 'png-to-ico') {
    return convertToIco(file);
  }

  // Handle GIF conversions
  if (toolId === 'jpg-to-gif' || toolId === 'png-to-gif') {
    return convertToGif(file);
  }

  // Get format mapping
  const mapping = formatMap[toolId];
  if (mapping) {
    return convertImage(file, mapping.to, options.quality || 0.92);
  }

  throw new Error(`Unknown converter tool: ${toolId}`);
}

// Get file extension from format
export function getExtension(format: string): string {
  const extMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/x-icon': 'ico'
  };
  return extMap[format] || 'png';
}
