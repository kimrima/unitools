import { useState, useCallback, useRef } from 'react';

export type ToolStatus = 'idle' | 'validating' | 'processing' | 'success' | 'error';

export type ToolErrorCode = 
  | 'INVALID_FILE_TYPE'
  | 'FILE_TOO_LARGE'
  | 'NO_FILES_PROVIDED'
  | 'PROCESSING_FAILED'
  | 'VALIDATION_FAILED'
  | 'WORKER_ERROR';

export interface ToolError {
  code: ToolErrorCode;
  fileName?: string;
  details?: string;
}

export interface ToolEngineState {
  status: ToolStatus;
  progress: number;
  error: ToolError | null;
}

export interface UseToolEngineOptions {
  allowedTypes?: string[];
  maxFileSizeBytes?: number;
  maxFiles?: number;
}

export interface UseToolEngineReturn {
  status: ToolStatus;
  progress: number;
  error: ToolError | null;
  setStatus: (status: ToolStatus) => void;
  setProgress: (progress: number) => void;
  setError: (error: ToolError | null) => void;
  validateFile: (file: File) => ToolError | null;
  validateFiles: (files: File[]) => ToolError | null;
  reset: () => void;
  abortRef: React.MutableRefObject<boolean>;
  abort: () => void;
}

const defaultOptions: UseToolEngineOptions = {
  maxFileSizeBytes: 500 * 1024 * 1024,
  maxFiles: 50,
};

export function useToolEngine(options: UseToolEngineOptions = {}): UseToolEngineReturn {
  const mergedOptions = { ...defaultOptions, ...options };
  
  const [status, setStatus] = useState<ToolStatus>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<ToolError | null>(null);
  const abortRef = useRef<boolean>(false);

  const validateFile = useCallback((file: File): ToolError | null => {
    if (mergedOptions.allowedTypes && mergedOptions.allowedTypes.length > 0) {
      const isAllowed = mergedOptions.allowedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', '/'));
        }
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.type === type;
      });
      
      if (!isAllowed) {
        return { code: 'INVALID_FILE_TYPE', fileName: file.name };
      }
    }

    if (mergedOptions.maxFileSizeBytes && file.size > mergedOptions.maxFileSizeBytes) {
      return { code: 'FILE_TOO_LARGE', fileName: file.name };
    }

    return null;
  }, [mergedOptions.allowedTypes, mergedOptions.maxFileSizeBytes]);

  const validateFiles = useCallback((files: File[]): ToolError | null => {
    if (files.length === 0) {
      return { code: 'NO_FILES_PROVIDED' };
    }

    if (mergedOptions.maxFiles && files.length > mergedOptions.maxFiles) {
      return { code: 'VALIDATION_FAILED', details: `max_files:${mergedOptions.maxFiles}` };
    }

    for (const file of files) {
      const fileError = validateFile(file);
      if (fileError) {
        return fileError;
      }
    }

    return null;
  }, [validateFile, mergedOptions.maxFiles]);

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setError(null);
    abortRef.current = false;
  }, []);

  const abort = useCallback(() => {
    abortRef.current = true;
    setStatus('idle');
    setProgress(0);
  }, []);

  return {
    status,
    progress,
    error,
    setStatus,
    setProgress,
    setError,
    validateFile,
    validateFiles,
    reset,
    abortRef,
    abort,
  };
}

export async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

export async function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateOutputFilename(originalName: string, suffix: string, newExtension?: string): string {
  const lastDotIndex = originalName.lastIndexOf('.');
  const baseName = lastDotIndex > 0 ? originalName.substring(0, lastDotIndex) : originalName;
  const extension = newExtension || (lastDotIndex > 0 ? originalName.substring(lastDotIndex) : '');
  return `unitools_${baseName}_${suffix}${extension}`;
}
