export interface ImageProcessProgress {
  percentage: number;
}

export type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp';

function getMimeType(format: string): OutputFormat {
  const formatLower = format.toLowerCase();
  if (formatLower === 'png') return 'image/png';
  if (formatLower === 'webp') return 'image/webp';
  return 'image/jpeg';
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!src.startsWith('blob:') && !src.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: OutputFormat, quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create blob'));
      },
      mimeType,
      quality
    );
  });
}

export async function convertFormat(
  imageUrl: string,
  outputFormat: string,
  onProgress?: (progress: ImageProcessProgress) => void
): Promise<Blob> {
  onProgress?.({ percentage: 20 });
  const img = await loadImage(imageUrl);
  
  onProgress?.({ percentage: 50 });
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  
  const ctx = canvas.getContext('2d')!;
  if (outputFormat === 'jpg' || outputFormat === 'jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);
  
  onProgress?.({ percentage: 80 });
  const blob = await canvasToBlob(canvas, getMimeType(outputFormat));
  onProgress?.({ percentage: 100 });
  return blob;
}

export async function resizeImage(
  imageUrl: string,
  width: number,
  height: number,
  maintainAspect: boolean,
  outputFormat: string,
  onProgress?: (progress: ImageProcessProgress) => void
): Promise<Blob> {
  onProgress?.({ percentage: 20 });
  const img = await loadImage(imageUrl);
  
  let newWidth = width;
  let newHeight = height;
  
  if (maintainAspect) {
    const aspectRatio = img.width / img.height;
    if (width && !height) {
      newHeight = Math.round(width / aspectRatio);
    } else if (height && !width) {
      newWidth = Math.round(height * aspectRatio);
    } else {
      const scaleX = width / img.width;
      const scaleY = height / img.height;
      const scale = Math.min(scaleX, scaleY);
      newWidth = Math.round(img.width * scale);
      newHeight = Math.round(img.height * scale);
    }
  }
  
  onProgress?.({ percentage: 50 });
  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;
  
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, newWidth, newHeight);
  
  onProgress?.({ percentage: 80 });
  const blob = await canvasToBlob(canvas, getMimeType(outputFormat));
  onProgress?.({ percentage: 100 });
  return blob;
}

export async function cropImage(
  imageUrl: string,
  x: number,
  y: number,
  width: number,
  height: number,
  outputFormat: string,
  onProgress?: (progress: ImageProcessProgress) => void
): Promise<Blob> {
  onProgress?.({ percentage: 20 });
  const img = await loadImage(imageUrl);
  
  onProgress?.({ percentage: 50 });
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
  
  onProgress?.({ percentage: 80 });
  const blob = await canvasToBlob(canvas, getMimeType(outputFormat));
  onProgress?.({ percentage: 100 });
  return blob;
}

export async function rotateImage(
  imageUrl: string,
  degrees: number,
  outputFormat: string,
  onProgress?: (progress: ImageProcessProgress) => void
): Promise<Blob> {
  onProgress?.({ percentage: 20 });
  const img = await loadImage(imageUrl);
  
  const radians = (degrees * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));
  
  const newWidth = Math.round(img.width * cos + img.height * sin);
  const newHeight = Math.round(img.width * sin + img.height * cos);
  
  onProgress?.({ percentage: 50 });
  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;
  
  const ctx = canvas.getContext('2d')!;
  ctx.translate(newWidth / 2, newHeight / 2);
  ctx.rotate(radians);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  
  onProgress?.({ percentage: 80 });
  const blob = await canvasToBlob(canvas, getMimeType(outputFormat));
  onProgress?.({ percentage: 100 });
  return blob;
}

export async function flipImage(
  imageUrl: string,
  horizontal: boolean,
  vertical: boolean,
  outputFormat: string,
  onProgress?: (progress: ImageProcessProgress) => void
): Promise<Blob> {
  onProgress?.({ percentage: 20 });
  const img = await loadImage(imageUrl);
  
  onProgress?.({ percentage: 50 });
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  
  const ctx = canvas.getContext('2d')!;
  ctx.translate(horizontal ? img.width : 0, vertical ? img.height : 0);
  ctx.scale(horizontal ? -1 : 1, vertical ? -1 : 1);
  ctx.drawImage(img, 0, 0);
  
  onProgress?.({ percentage: 80 });
  const blob = await canvasToBlob(canvas, getMimeType(outputFormat));
  onProgress?.({ percentage: 100 });
  return blob;
}

export async function applyBrightness(
  imageUrl: string,
  brightness: number,
  outputFormat: string,
  onProgress?: (progress: ImageProcessProgress) => void
): Promise<Blob> {
  onProgress?.({ percentage: 20 });
  const img = await loadImage(imageUrl);
  
  onProgress?.({ percentage: 40 });
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  
  const ctx = canvas.getContext('2d')!;
  ctx.filter = `brightness(${brightness}%)`;
  ctx.drawImage(img, 0, 0);
  
  onProgress?.({ percentage: 80 });
  const blob = await canvasToBlob(canvas, getMimeType(outputFormat));
  onProgress?.({ percentage: 100 });
  return blob;
}

export async function applyGrayscale(
  imageUrl: string,
  outputFormat: string,
  onProgress?: (progress: ImageProcessProgress) => void
): Promise<Blob> {
  onProgress?.({ percentage: 20 });
  const img = await loadImage(imageUrl);
  
  onProgress?.({ percentage: 40 });
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  
  const ctx = canvas.getContext('2d')!;
  ctx.filter = 'grayscale(100%)';
  ctx.drawImage(img, 0, 0);
  
  onProgress?.({ percentage: 80 });
  const blob = await canvasToBlob(canvas, getMimeType(outputFormat));
  onProgress?.({ percentage: 100 });
  return blob;
}

export async function addTextWatermark(
  imageUrl: string,
  text: string,
  options: {
    fontSize?: number;
    color?: string;
    opacity?: number;
    position?: 'center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  },
  outputFormat: string,
  onProgress?: (progress: ImageProcessProgress) => void
): Promise<Blob> {
  const { fontSize = 48, color = '#ffffff', opacity = 0.5, position = 'center' } = options;
  
  onProgress?.({ percentage: 20 });
  const img = await loadImage(imageUrl);
  
  onProgress?.({ percentage: 50 });
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  
  ctx.font = `${fontSize}px Arial, sans-serif`;
  ctx.fillStyle = color;
  ctx.globalAlpha = opacity;
  
  const textMetrics = ctx.measureText(text);
  const textWidth = textMetrics.width;
  const textHeight = fontSize;
  
  let x: number, y: number;
  switch (position) {
    case 'top-left':
      x = 20;
      y = textHeight + 20;
      break;
    case 'top-right':
      x = img.width - textWidth - 20;
      y = textHeight + 20;
      break;
    case 'bottom-left':
      x = 20;
      y = img.height - 20;
      break;
    case 'bottom-right':
      x = img.width - textWidth - 20;
      y = img.height - 20;
      break;
    default:
      x = (img.width - textWidth) / 2;
      y = (img.height + textHeight) / 2;
  }
  
  ctx.fillText(text, x, y);
  ctx.globalAlpha = 1;
  
  onProgress?.({ percentage: 80 });
  const blob = await canvasToBlob(canvas, getMimeType(outputFormat));
  onProgress?.({ percentage: 100 });
  return blob;
}

export async function applyRoundCorners(
  imageUrl: string,
  radius: number,
  onProgress?: (progress: ImageProcessProgress) => void
): Promise<Blob> {
  onProgress?.({ percentage: 20 });
  const img = await loadImage(imageUrl);
  
  onProgress?.({ percentage: 50 });
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  
  const ctx = canvas.getContext('2d')!;
  ctx.beginPath();
  ctx.roundRect(0, 0, img.width, img.height, radius);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, 0, 0);
  
  onProgress?.({ percentage: 80 });
  const blob = await canvasToBlob(canvas, 'image/png');
  onProgress?.({ percentage: 100 });
  return blob;
}

export async function addShadow(
  imageUrl: string,
  options: {
    blur?: number;
    offsetX?: number;
    offsetY?: number;
    color?: string;
  },
  onProgress?: (progress: ImageProcessProgress) => void
): Promise<Blob> {
  const { blur = 20, offsetX = 10, offsetY = 10, color = 'rgba(0,0,0,0.5)' } = options;
  
  onProgress?.({ percentage: 20 });
  const img = await loadImage(imageUrl);
  
  const padding = blur * 2 + Math.max(Math.abs(offsetX), Math.abs(offsetY));
  
  onProgress?.({ percentage: 50 });
  const canvas = document.createElement('canvas');
  canvas.width = img.width + padding * 2;
  canvas.height = img.height + padding * 2;
  
  const ctx = canvas.getContext('2d')!;
  ctx.shadowBlur = blur;
  ctx.shadowColor = color;
  ctx.shadowOffsetX = offsetX;
  ctx.shadowOffsetY = offsetY;
  ctx.drawImage(img, padding, padding);
  
  onProgress?.({ percentage: 80 });
  const blob = await canvasToBlob(canvas, 'image/png');
  onProgress?.({ percentage: 100 });
  return blob;
}

export async function addBorder(
  imageUrl: string,
  borderWidth: number,
  borderColor: string,
  outputFormat: string,
  onProgress?: (progress: ImageProcessProgress) => void
): Promise<Blob> {
  onProgress?.({ percentage: 20 });
  const img = await loadImage(imageUrl);
  
  onProgress?.({ percentage: 50 });
  const canvas = document.createElement('canvas');
  canvas.width = img.width + borderWidth * 2;
  canvas.height = img.height + borderWidth * 2;
  
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = borderColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, borderWidth, borderWidth);
  
  onProgress?.({ percentage: 80 });
  const blob = await canvasToBlob(canvas, getMimeType(outputFormat));
  onProgress?.({ percentage: 100 });
  return blob;
}

export async function applyOpacity(
  imageUrl: string,
  opacity: number,
  onProgress?: (progress: ImageProcessProgress) => void
): Promise<Blob> {
  onProgress?.({ percentage: 20 });
  const img = await loadImage(imageUrl);
  
  onProgress?.({ percentage: 50 });
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  
  const ctx = canvas.getContext('2d')!;
  ctx.globalAlpha = opacity / 100;
  ctx.drawImage(img, 0, 0);
  
  onProgress?.({ percentage: 80 });
  const blob = await canvasToBlob(canvas, 'image/png');
  onProgress?.({ percentage: 100 });
  return blob;
}

export async function applyMosaic(
  imageUrl: string,
  x: number,
  y: number,
  width: number,
  height: number,
  pixelSize: number,
  outputFormat: string,
  onProgress?: (progress: ImageProcessProgress) => void
): Promise<Blob> {
  onProgress?.({ percentage: 20 });
  const img = await loadImage(imageUrl);
  
  onProgress?.({ percentage: 40 });
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  
  const imageData = ctx.getImageData(x, y, width, height);
  const data = imageData.data;
  
  for (let py = 0; py < height; py += pixelSize) {
    for (let px = 0; px < width; px += pixelSize) {
      let r = 0, g = 0, b = 0, count = 0;
      
      for (let dy = 0; dy < pixelSize && py + dy < height; dy++) {
        for (let dx = 0; dx < pixelSize && px + dx < width; dx++) {
          const i = ((py + dy) * width + (px + dx)) * 4;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
      }
      
      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);
      
      for (let dy = 0; dy < pixelSize && py + dy < height; dy++) {
        for (let dx = 0; dx < pixelSize && px + dx < width; dx++) {
          const i = ((py + dy) * width + (px + dx)) * 4;
          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
        }
      }
    }
  }
  
  ctx.putImageData(imageData, x, y);
  
  onProgress?.({ percentage: 80 });
  const blob = await canvasToBlob(canvas, getMimeType(outputFormat));
  onProgress?.({ percentage: 100 });
  return blob;
}

export async function joinImages(
  imageUrls: string[],
  direction: 'horizontal' | 'vertical',
  gap: number,
  outputFormat: string,
  onProgress?: (progress: ImageProcessProgress) => void
): Promise<Blob> {
  onProgress?.({ percentage: 10 });
  
  const images = await Promise.all(imageUrls.map(url => loadImage(url)));
  
  onProgress?.({ percentage: 40 });
  
  let totalWidth = 0;
  let totalHeight = 0;
  let maxWidth = 0;
  let maxHeight = 0;
  
  for (const img of images) {
    maxWidth = Math.max(maxWidth, img.width);
    maxHeight = Math.max(maxHeight, img.height);
    totalWidth += img.width;
    totalHeight += img.height;
  }
  
  const canvas = document.createElement('canvas');
  
  if (direction === 'horizontal') {
    canvas.width = totalWidth + gap * (images.length - 1);
    canvas.height = maxHeight;
  } else {
    canvas.width = maxWidth;
    canvas.height = totalHeight + gap * (images.length - 1);
  }
  
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  let offset = 0;
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    if (direction === 'horizontal') {
      ctx.drawImage(img, offset, 0);
      offset += img.width + gap;
    } else {
      ctx.drawImage(img, 0, offset);
      offset += img.height + gap;
    }
    onProgress?.({ percentage: 40 + Math.round((i / images.length) * 40) });
  }
  
  onProgress?.({ percentage: 90 });
  const blob = await canvasToBlob(canvas, getMimeType(outputFormat));
  onProgress?.({ percentage: 100 });
  return blob;
}

export async function changeCanvasSize(
  imageUrl: string,
  newWidth: number,
  newHeight: number,
  backgroundColor: string,
  anchor: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
  outputFormat: string,
  onProgress?: (progress: ImageProcessProgress) => void
): Promise<Blob> {
  onProgress?.({ percentage: 20 });
  const img = await loadImage(imageUrl);
  
  onProgress?.({ percentage: 50 });
  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;
  
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, newWidth, newHeight);
  
  let x = 0, y = 0;
  switch (anchor) {
    case 'center':
      x = (newWidth - img.width) / 2;
      y = (newHeight - img.height) / 2;
      break;
    case 'top-left':
      x = 0;
      y = 0;
      break;
    case 'top-right':
      x = newWidth - img.width;
      y = 0;
      break;
    case 'bottom-left':
      x = 0;
      y = newHeight - img.height;
      break;
    case 'bottom-right':
      x = newWidth - img.width;
      y = newHeight - img.height;
      break;
  }
  
  ctx.drawImage(img, x, y);
  
  onProgress?.({ percentage: 80 });
  const blob = await canvasToBlob(canvas, getMimeType(outputFormat));
  onProgress?.({ percentage: 100 });
  return blob;
}

export async function changeAspectRatio(
  imageUrl: string,
  ratio: string,
  fit: 'contain' | 'cover' | 'stretch',
  backgroundColor: string,
  outputFormat: string,
  onProgress?: (progress: ImageProcessProgress) => void
): Promise<Blob> {
  onProgress?.({ percentage: 20 });
  const img = await loadImage(imageUrl);
  
  const [rw, rh] = ratio.split(':').map(Number);
  const targetRatio = rw / rh;
  const currentRatio = img.width / img.height;
  
  let newWidth: number, newHeight: number;
  
  if (currentRatio > targetRatio) {
    newWidth = img.width;
    newHeight = Math.round(img.width / targetRatio);
  } else {
    newHeight = img.height;
    newWidth = Math.round(img.height * targetRatio);
  }
  
  onProgress?.({ percentage: 50 });
  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;
  
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, newWidth, newHeight);
  
  let drawX = 0, drawY = 0, drawWidth = img.width, drawHeight = img.height;
  
  if (fit === 'contain') {
    drawX = (newWidth - img.width) / 2;
    drawY = (newHeight - img.height) / 2;
  } else if (fit === 'cover') {
    const scale = Math.max(newWidth / img.width, newHeight / img.height);
    drawWidth = img.width * scale;
    drawHeight = img.height * scale;
    drawX = (newWidth - drawWidth) / 2;
    drawY = (newHeight - drawHeight) / 2;
  } else {
    drawWidth = newWidth;
    drawHeight = newHeight;
  }
  
  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  
  onProgress?.({ percentage: 80 });
  const blob = await canvasToBlob(canvas, getMimeType(outputFormat));
  onProgress?.({ percentage: 100 });
  return blob;
}

export async function extractColors(
  imageUrl: string,
  count: number = 5
): Promise<string[]> {
  const img = await loadImage(imageUrl);
  
  const canvas = document.createElement('canvas');
  const size = 100;
  canvas.width = size;
  canvas.height = size;
  
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, size, size);
  
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  
  const colorMap: Map<string, number> = new Map();
  
  for (let i = 0; i < data.length; i += 4) {
    const r = Math.round(data[i] / 32) * 32;
    const g = Math.round(data[i + 1] / 32) * 32;
    const b = Math.round(data[i + 2] / 32) * 32;
    const key = `${r},${g},${b}`;
    colorMap.set(key, (colorMap.get(key) || 0) + 1);
  }
  
  const sorted = Array.from(colorMap.entries()).sort((a, b) => b[1] - a[1]);
  
  return sorted.slice(0, count).map(([key]) => {
    const [r, g, b] = key.split(',').map(Number);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  });
}

export async function generateFavicon(
  imageUrl: string,
  sizes: number[] = [16, 32, 48],
  onProgress?: (progress: ImageProcessProgress) => void
): Promise<Blob[]> {
  onProgress?.({ percentage: 20 });
  const img = await loadImage(imageUrl);
  
  const blobs: Blob[] = [];
  
  for (let i = 0; i < sizes.length; i++) {
    const size = sizes[i];
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, size, size);
    
    const blob = await canvasToBlob(canvas, 'image/png');
    blobs.push(blob);
    
    onProgress?.({ percentage: 20 + Math.round(((i + 1) / sizes.length) * 70) });
  }
  
  onProgress?.({ percentage: 100 });
  return blobs;
}

export async function removeExif(
  imageUrl: string,
  outputFormat: string,
  onProgress?: (progress: ImageProcessProgress) => void
): Promise<Blob> {
  onProgress?.({ percentage: 20 });
  const img = await loadImage(imageUrl);
  
  onProgress?.({ percentage: 50 });
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  
  onProgress?.({ percentage: 80 });
  const blob = await canvasToBlob(canvas, getMimeType(outputFormat));
  onProgress?.({ percentage: 100 });
  return blob;
}

export async function addText(
  imageUrl: string,
  text: string,
  options: {
    x: number;
    y: number;
    fontSize: number;
    fontFamily: string;
    color: string;
    bold?: boolean;
    italic?: boolean;
  },
  outputFormat: string,
  onProgress?: (progress: ImageProcessProgress) => void
): Promise<Blob> {
  onProgress?.({ percentage: 20 });
  const img = await loadImage(imageUrl);
  
  onProgress?.({ percentage: 50 });
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  
  const fontStyle = `${options.italic ? 'italic ' : ''}${options.bold ? 'bold ' : ''}${options.fontSize}px ${options.fontFamily}`;
  ctx.font = fontStyle;
  ctx.fillStyle = options.color;
  ctx.fillText(text, options.x, options.y);
  
  onProgress?.({ percentage: 80 });
  const blob = await canvasToBlob(canvas, getMimeType(outputFormat));
  onProgress?.({ percentage: 100 });
  return blob;
}
