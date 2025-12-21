import { useState, useCallback } from 'react';

export type ProcessingStatus = 'idle' | 'processing' | 'success' | 'error';

export interface FileWithPreview {
  file: File;
  id: string;
  previewUrl: string | null;
  arrayBuffer: ArrayBuffer | null;
}

export interface UseFileHandlerOptions {
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeBytes?: number;
}

export interface FileHandlerError {
  code: string;
  fileName?: string;
}

export interface UseFileHandlerReturn {
  files: FileWithPreview[];
  status: ProcessingStatus;
  error: FileHandlerError | null;
  resultBlob: Blob | null;
  resultUrl: string | null;
  progress: number;
  addFiles: (newFiles: FileList | File[]) => Promise<void>;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  reorderFiles: (fromIndex: number, toIndex: number) => void;
  setStatus: (status: ProcessingStatus) => void;
  setError: (error: FileHandlerError | null) => void;
  setResult: (blob: Blob, filename?: string) => void;
  setProgress: (progress: number) => void;
  downloadResult: (filename: string) => void;
  reset: () => void;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

async function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function createPreviewUrl(file: File): string | null {
  if (file.type.startsWith('image/')) {
    return URL.createObjectURL(file);
  }
  return null;
}

export function useFileHandler(options: UseFileHandlerOptions = {}): UseFileHandlerReturn {
  const { multiple = true, maxFiles = 100, maxSizeBytes = 100 * 1024 * 1024 } = options;

  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [error, setError] = useState<FileHandlerError | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const addFiles = useCallback(async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    
    if (!multiple && fileArray.length > 1) {
      fileArray.splice(1);
    }

    for (const file of fileArray) {
      if (file.size > maxSizeBytes) {
        setError({ code: 'FILE_TOO_LARGE', fileName: file.name });
        return;
      }
    }

    const processedFiles: FileWithPreview[] = await Promise.all(
      fileArray.map(async (file) => {
        const arrayBuffer = await fileToArrayBuffer(file);
        const previewUrl = createPreviewUrl(file);

        return {
          file,
          id: generateId(),
          previewUrl,
          arrayBuffer,
        };
      })
    );

    setFiles((prev) => {
      const combined = multiple ? [...prev, ...processedFiles] : processedFiles;
      return combined.slice(0, maxFiles);
    });

    setStatus('idle');
    setError(null);
    setResultBlob(null);
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      setResultUrl(null);
    }
  }, [multiple, maxFiles, maxSizeBytes, resultUrl]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clearFiles = useCallback(() => {
    files.forEach((f) => {
      if (f.previewUrl) {
        URL.revokeObjectURL(f.previewUrl);
      }
    });
    setFiles([]);
    setStatus('idle');
    setError(null);
    setProgress(0);
  }, [files]);

  const reorderFiles = useCallback((fromIndex: number, toIndex: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      const [movedFile] = newFiles.splice(fromIndex, 1);
      newFiles.splice(toIndex, 0, movedFile);
      return newFiles;
    });
  }, []);

  const setResult = useCallback((blob: Blob) => {
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
    }
    setResultBlob(blob);
    setResultUrl(URL.createObjectURL(blob));
    setStatus('success');
  }, [resultUrl]);

  const downloadResult = useCallback((filename: string) => {
    if (!resultBlob) return;

    const url = URL.createObjectURL(resultBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [resultBlob]);

  const reset = useCallback(() => {
    files.forEach((f) => {
      if (f.previewUrl) {
        URL.revokeObjectURL(f.previewUrl);
      }
    });
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
    }
    setFiles([]);
    setStatus('idle');
    setError(null);
    setResultBlob(null);
    setResultUrl(null);
    setProgress(0);
  }, [files, resultUrl]);

  return {
    files,
    status,
    error,
    resultBlob,
    resultUrl,
    progress,
    addFiles,
    removeFile,
    clearFiles,
    reorderFiles,
    setStatus,
    setError,
    setResult,
    setProgress,
    downloadResult,
    reset,
  };
}
