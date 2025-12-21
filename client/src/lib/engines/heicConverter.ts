import heic2any from 'heic2any';

export interface HeicConvertProgress {
  percentage: number;
}

export async function convertHeicToJpg(
  file: File,
  quality: number = 0.92,
  onProgress?: (progress: HeicConvertProgress) => void
): Promise<Blob> {
  onProgress?.({ percentage: 10 });
  
  try {
    onProgress?.({ percentage: 30 });
    
    const result = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality,
    });
    
    onProgress?.({ percentage: 90 });
    
    const blob = Array.isArray(result) ? result[0] : result;
    
    onProgress?.({ percentage: 100 });
    
    return blob;
  } catch (error) {
    throw new Error('Failed to convert HEIC file');
  }
}

export async function convertHeicToPng(
  file: File,
  onProgress?: (progress: HeicConvertProgress) => void
): Promise<Blob> {
  onProgress?.({ percentage: 10 });
  
  try {
    onProgress?.({ percentage: 30 });
    
    const result = await heic2any({
      blob: file,
      toType: 'image/png',
    });
    
    onProgress?.({ percentage: 90 });
    
    const blob = Array.isArray(result) ? result[0] : result;
    
    onProgress?.({ percentage: 100 });
    
    return blob;
  } catch (error) {
    throw new Error('Failed to convert HEIC file');
  }
}
