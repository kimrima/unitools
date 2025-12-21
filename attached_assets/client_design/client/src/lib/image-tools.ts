// Image Processing Tools - All client-side using Canvas API

export interface ImageToolResult {
  dataUrl: string;
  blob?: Blob;
  width: number;
  height: number;
  size: number;
  format: string;
  requiresServer?: boolean;
  message?: string;
}

// Load image from file
export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// OCR via server API (uses Tesseract)
async function ocrImageViaServer(file: File): Promise<ImageToolResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/process/ocr', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'OCR failed' }));
    throw new Error(error.error || 'OCR processing failed');
  }

  const result = await response.json();
  return {
    dataUrl: '',
    width: 0,
    height: 0,
    size: 0,
    format: 'text/plain',
    message: result.text || 'No text detected'
  };
}

// Convert canvas to blob
function canvasToBlob(canvas: HTMLCanvasElement, format: string = 'image/png', quality: number = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create blob'));
    }, format, quality);
  });
}

// Resize Image
export async function resizeImage(file: File, width: number, height: number, maintainAspect: boolean = true): Promise<ImageToolResult> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  let newWidth = width;
  let newHeight = height;

  if (maintainAspect) {
    const ratio = Math.min(width / img.width, height / img.height);
    newWidth = img.width * ratio;
    newHeight = img.height * ratio;
  }

  canvas.width = newWidth;
  canvas.height = newHeight;
  ctx.drawImage(img, 0, 0, newWidth, newHeight);

  const format = file.type || 'image/png';
  const blob = await canvasToBlob(canvas, format);
  
  return {
    dataUrl: canvas.toDataURL(format),
    blob,
    width: newWidth,
    height: newHeight,
    size: blob.size,
    format
  };
}

// Crop Image
export async function cropImage(file: File, x: number, y: number, width: number, height: number): Promise<ImageToolResult> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, x, y, width, height, 0, 0, width, height);

  const format = file.type || 'image/png';
  const blob = await canvasToBlob(canvas, format);
  
  return {
    dataUrl: canvas.toDataURL(format),
    blob,
    width,
    height,
    size: blob.size,
    format
  };
}

// Circle Crop
export async function circleCrop(file: File): Promise<ImageToolResult> {
  const img = await loadImage(file);
  const size = Math.min(img.width, img.height);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = size;
  canvas.height = size;

  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  const offsetX = (img.width - size) / 2;
  const offsetY = (img.height - size) / 2;
  ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);

  const blob = await canvasToBlob(canvas, 'image/png');
  
  return {
    dataUrl: canvas.toDataURL('image/png'),
    blob,
    width: size,
    height: size,
    size: blob.size,
    format: 'image/png'
  };
}

// Flip Image
export async function flipImage(file: File, direction: 'horizontal' | 'vertical'): Promise<ImageToolResult> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = img.width;
  canvas.height = img.height;

  if (direction === 'horizontal') {
    ctx.translate(img.width, 0);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(0, img.height);
    ctx.scale(1, -1);
  }

  ctx.drawImage(img, 0, 0);

  const format = file.type || 'image/png';
  const blob = await canvasToBlob(canvas, format);
  
  return {
    dataUrl: canvas.toDataURL(format),
    blob,
    width: img.width,
    height: img.height,
    size: blob.size,
    format
  };
}

// Rotate Image
export async function rotateImage(file: File, degrees: number): Promise<ImageToolResult> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  const radians = (degrees * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));
  
  canvas.width = img.width * cos + img.height * sin;
  canvas.height = img.width * sin + img.height * cos;

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(radians);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);

  const format = file.type || 'image/png';
  const blob = await canvasToBlob(canvas, format);
  
  return {
    dataUrl: canvas.toDataURL(format),
    blob,
    width: canvas.width,
    height: canvas.height,
    size: blob.size,
    format
  };
}

// Blur Image (using StackBlur algorithm approximation)
export async function blurImage(file: File, radius: number = 10): Promise<ImageToolResult> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = img.width;
  canvas.height = img.height;
  
  // Apply blur using CSS filter (simple approach)
  ctx.filter = `blur(${radius}px)`;
  ctx.drawImage(img, 0, 0);
  ctx.filter = 'none';

  const format = file.type || 'image/png';
  const blob = await canvasToBlob(canvas, format);
  
  return {
    dataUrl: canvas.toDataURL(format),
    blob,
    width: img.width,
    height: img.height,
    size: blob.size,
    format
  };
}

// Pixelate Image
export async function pixelateImage(file: File, pixelSize: number = 10): Promise<ImageToolResult> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = img.width;
  canvas.height = img.height;

  // Draw small then scale up
  const smallWidth = Math.ceil(img.width / pixelSize);
  const smallHeight = Math.ceil(img.height / pixelSize);
  
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, smallWidth, smallHeight);
  ctx.drawImage(canvas, 0, 0, smallWidth, smallHeight, 0, 0, img.width, img.height);

  const format = file.type || 'image/png';
  const blob = await canvasToBlob(canvas, format);
  
  return {
    dataUrl: canvas.toDataURL(format),
    blob,
    width: img.width,
    height: img.height,
    size: blob.size,
    format
  };
}

// Grayscale Image
export async function grayscaleImage(file: File): Promise<ImageToolResult> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = img.width;
  canvas.height = img.height;
  
  ctx.filter = 'grayscale(100%)';
  ctx.drawImage(img, 0, 0);
  ctx.filter = 'none';

  const format = file.type || 'image/png';
  const blob = await canvasToBlob(canvas, format);
  
  return {
    dataUrl: canvas.toDataURL(format),
    blob,
    width: img.width,
    height: img.height,
    size: blob.size,
    format
  };
}

// Add Text to Image
export async function addTextToImage(
  file: File, 
  text: string, 
  options: { x?: number; y?: number; fontSize?: number; color?: string; font?: string } = {}
): Promise<ImageToolResult> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const fontSize = options.fontSize || 32;
  const font = options.font || 'Arial';
  const color = options.color || '#ffffff';
  const x = options.x ?? img.width / 2;
  const y = options.y ?? img.height - 50;

  ctx.font = `bold ${fontSize}px ${font}`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);

  const format = file.type || 'image/png';
  const blob = await canvasToBlob(canvas, format);
  
  return {
    dataUrl: canvas.toDataURL(format),
    blob,
    width: img.width,
    height: img.height,
    size: blob.size,
    format
  };
}

// Round Corners
export async function roundCorners(file: File, radius: number = 20): Promise<ImageToolResult> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = img.width;
  canvas.height = img.height;

  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(img.width - radius, 0);
  ctx.quadraticCurveTo(img.width, 0, img.width, radius);
  ctx.lineTo(img.width, img.height - radius);
  ctx.quadraticCurveTo(img.width, img.height, img.width - radius, img.height);
  ctx.lineTo(radius, img.height);
  ctx.quadraticCurveTo(0, img.height, 0, img.height - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(img, 0, 0);

  const blob = await canvasToBlob(canvas, 'image/png');
  
  return {
    dataUrl: canvas.toDataURL('image/png'),
    blob,
    width: img.width,
    height: img.height,
    size: blob.size,
    format: 'image/png'
  };
}

// Compress Image
export async function compressImage(file: File, quality: number = 0.7): Promise<ImageToolResult> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const blob = await canvasToBlob(canvas, 'image/jpeg', quality);
  
  return {
    dataUrl: canvas.toDataURL('image/jpeg', quality),
    blob,
    width: img.width,
    height: img.height,
    size: blob.size,
    format: 'image/jpeg'
  };
}

// Add Watermark
export async function addWatermark(
  file: File, 
  watermarkText: string,
  options: { opacity?: number; fontSize?: number; position?: string } = {}
): Promise<ImageToolResult> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const fontSize = options.fontSize || Math.min(img.width, img.height) / 10;
  const opacity = options.opacity || 0.5;

  ctx.font = `bold ${fontSize}px Arial`;
  ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
  ctx.textAlign = 'center';
  ctx.strokeStyle = `rgba(0, 0, 0, ${opacity * 0.5})`;
  ctx.lineWidth = 2;

  // Tile watermark across image
  const textWidth = ctx.measureText(watermarkText).width;
  const gap = textWidth * 1.5;
  
  ctx.save();
  ctx.rotate(-Math.PI / 6);
  for (let y = -img.height; y < img.height * 2; y += fontSize * 3) {
    for (let x = -img.width; x < img.width * 2; x += gap) {
      ctx.strokeText(watermarkText, x, y);
      ctx.fillText(watermarkText, x, y);
    }
  }
  ctx.restore();

  const format = file.type || 'image/png';
  const blob = await canvasToBlob(canvas, format);
  
  return {
    dataUrl: canvas.toDataURL(format),
    blob,
    width: img.width,
    height: img.height,
    size: blob.size,
    format
  };
}

// Create Passport/ID Photo (resize to standard dimensions)
export async function createStandardPhoto(
  file: File, 
  type: 'passport' | 'id' | 'instagram' | 'youtube'
): Promise<ImageToolResult> {
  const sizes: Record<string, { width: number; height: number }> = {
    passport: { width: 413, height: 531 },  // 35mm x 45mm at 300dpi
    id: { width: 354, height: 472 },        // 30mm x 40mm at 300dpi
    instagram: { width: 1080, height: 1080 },
    youtube: { width: 2560, height: 1440 }
  };

  const size = sizes[type] || sizes.passport;
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = size.width;
  canvas.height = size.height;

  // Center crop to fit
  const imgRatio = img.width / img.height;
  const targetRatio = size.width / size.height;

  let sx = 0, sy = 0, sw = img.width, sh = img.height;

  if (imgRatio > targetRatio) {
    sw = img.height * targetRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / targetRatio;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size.width, size.height);

  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.95);
  
  return {
    dataUrl: canvas.toDataURL('image/jpeg', 0.95),
    blob,
    width: size.width,
    height: size.height,
    size: blob.size,
    format: 'image/jpeg'
  };
}

// Process image based on tool ID
export async function processImageTool(toolId: string, file: File, options: any = {}): Promise<ImageToolResult> {
  switch (toolId) {
    case 'resize-image':
      return resizeImage(file, options.width || 800, options.height || 600, options.maintainAspect !== false);
    case 'crop-image':
      return cropImage(file, options.x || 0, options.y || 0, options.width || 400, options.height || 300);
    case 'circle-crop':
      return circleCrop(file);
    case 'flip-image':
      return flipImage(file, options.direction || 'horizontal');
    case 'rotate-image':
      return rotateImage(file, options.degrees || 90);
    case 'blur-image':
      return blurImage(file, options.radius || 10);
    case 'pixelate-image':
      return pixelateImage(file, options.pixelSize || 10);
    case 'grayscale-image':
      return grayscaleImage(file);
    case 'add-text-image':
      return addTextToImage(file, options.text || 'Sample Text', options);
    case 'round-corners':
      return roundCorners(file, options.radius || 20);
    case 'compress-image':
      return compressImage(file, options.quality || 0.7);
    case 'watermark-image':
      return addWatermark(file, options.text || 'Watermark', options);
    case 'passport-photo':
      return createStandardPhoto(file, 'passport');
    case 'id-photo':
      return createStandardPhoto(file, 'id');
    case 'insta-size':
      return createStandardPhoto(file, 'instagram');
    case 'youtube-banner':
      return createStandardPhoto(file, 'youtube');
    case 'ocr-image':
      return ocrImageViaServer(file);
    default:
      throw new Error(`Unknown image tool: ${toolId}`);
  }
}

// Download result
export function downloadImage(result: ImageToolResult, filename: string = 'processed-image') {
  const ext = result.format.split('/')[1] || 'png';
  const a = document.createElement('a');
  a.href = result.dataUrl;
  a.download = `${filename}.${ext}`;
  a.click();
}
