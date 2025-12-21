import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Upload, FileUp, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadZoneProps {
  onFileSelect: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}

export function FileUploadZone({ 
  onFileSelect, 
  accept = '*/*', 
  multiple = false,
  disabled = false,
  className = ''
}: FileUploadZoneProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const filterFilesByAccept = useCallback((fileList: FileList): FileList => {
    if (accept === '*/*' || accept === '*') {
      return fileList;
    }
    
    const acceptedTypes = accept.split(',').map(t => t.trim().toLowerCase());
    const filteredFiles: File[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const fileType = file.type.toLowerCase();
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      const isAccepted = acceptedTypes.some(acceptType => {
        if (acceptType.endsWith('/*')) {
          const category = acceptType.slice(0, -2);
          return fileType.startsWith(category);
        }
        if (acceptType.startsWith('.')) {
          return fileExtension === acceptType;
        }
        return fileType === acceptType;
      });
      
      if (isAccepted) {
        filteredFiles.push(file);
      }
    }
    
    const dataTransfer = new DataTransfer();
    filteredFiles.forEach(file => dataTransfer.items.add(file));
    return dataTransfer.files;
  }, [accept]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled || isLoading) return;
    
    const files = filterFilesByAccept(e.dataTransfer.files);
    if (files.length > 0) {
      setIsLoading(true);
      toast({
        title: t('Common.upload.uploading', { defaultValue: 'Uploading...' }),
        description: t('Common.upload.processingFiles', { defaultValue: 'Processing your files' }),
      });
      try {
        await Promise.resolve(onFileSelect(files));
        toast({
          title: t('Common.upload.uploadSuccess', { defaultValue: 'Upload complete' }),
          description: multiple 
            ? t('Common.upload.filesReady', { count: files.length, defaultValue: `${files.length} files ready` })
            : t('Common.upload.fileReady', { defaultValue: 'File ready for processing' }),
        });
      } catch {
        toast({
          title: t('Common.upload.uploadFailed', { defaultValue: 'Upload failed' }),
          description: t('Common.upload.tryAgain', { defaultValue: 'Please try again' }),
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      toast({
        title: t('Common.upload.invalidFormat', { defaultValue: 'Invalid format' }),
        description: t('Common.upload.checkFormat', { defaultValue: 'Please check the accepted file formats' }),
        variant: 'destructive',
      });
    }
  }, [disabled, isLoading, onFileSelect, filterFilesByAccept, toast, t, multiple]);

  const handleClick = useCallback(() => {
    if (!disabled && !isLoading) fileInputRef.current?.click();
  }, [disabled, isLoading]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsLoading(true);
      toast({
        title: t('Common.upload.uploading', { defaultValue: 'Uploading...' }),
        description: t('Common.upload.processingFiles', { defaultValue: 'Processing your files' }),
      });
      try {
        await Promise.resolve(onFileSelect(e.target.files));
        toast({
          title: t('Common.upload.uploadSuccess', { defaultValue: 'Upload complete' }),
          description: multiple 
            ? t('Common.upload.filesReady', { count: e.target.files.length, defaultValue: `${e.target.files.length} files ready` })
            : t('Common.upload.fileReady', { defaultValue: 'File ready for processing' }),
        });
      } catch {
        toast({
          title: t('Common.upload.uploadFailed', { defaultValue: 'Upload failed' }),
          description: t('Common.upload.tryAgain', { defaultValue: 'Please try again' }),
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  }, [onFileSelect, toast, t, multiple]);

  const getAcceptLabel = () => {
    if (accept === '*/*' || accept === '*') {
      return t('Common.messages.allFormats', { defaultValue: 'All formats' });
    }
    
    const formatMap: Record<string, string> = {
      'image/jpeg': 'JPG',
      'image/jpg': 'JPG',
      'image/png': 'PNG',
      'image/webp': 'WebP',
      'image/gif': 'GIF',
      'image/svg+xml': 'SVG',
      'image/bmp': 'BMP',
      'image/heic': 'HEIC',
      'image/heif': 'HEIF',
      'application/pdf': 'PDF',
      'video/mp4': 'MP4',
      'video/webm': 'WebM',
      'video/quicktime': 'MOV',
      'video/x-msvideo': 'AVI',
      'video/x-matroska': 'MKV',
      'audio/mpeg': 'MP3',
      'audio/wav': 'WAV',
      'audio/ogg': 'OGG',
      'audio/flac': 'FLAC',
      'audio/aac': 'AAC',
      '.jpg': 'JPG',
      '.jpeg': 'JPG',
      '.png': 'PNG',
      '.webp': 'WebP',
      '.gif': 'GIF',
      '.svg': 'SVG',
      '.bmp': 'BMP',
      '.heic': 'HEIC',
      '.heif': 'HEIF',
      '.pdf': 'PDF',
      '.mp4': 'MP4',
      '.webm': 'WebM',
      '.mov': 'MOV',
      '.avi': 'AVI',
      '.mkv': 'MKV',
      '.mp3': 'MP3',
      '.wav': 'WAV',
      '.ogg': 'OGG',
      '.flac': 'FLAC',
      '.aac': 'AAC',
    };
    
    const acceptTypes = accept.split(',').map(t => t.trim().toLowerCase());
    const labels: string[] = [];
    
    for (const type of acceptTypes) {
      if (type === 'image/*') {
        return 'JPG, PNG, WebP, GIF, SVG';
      }
      if (type === 'video/*') {
        return 'MP4, WebM, MOV, AVI';
      }
      if (type === 'audio/*') {
        return 'MP3, WAV, OGG, FLAC';
      }
      if (formatMap[type]) {
        if (!labels.includes(formatMap[type])) {
          labels.push(formatMap[type]);
        }
      }
    }
    
    if (labels.length > 0) {
      return labels.join(', ');
    }
    
    return t('Common.messages.allFormats', { defaultValue: 'All formats' });
  };

  return (
    <div
      className={`
        w-full max-w-2xl mx-auto h-64 md:h-80 border-2 border-dashed rounded-3xl 
        flex flex-col items-center justify-center transition-all duration-300 cursor-pointer group px-6
        ${isDragging 
          ? 'border-primary bg-primary/5 scale-[1.02]' 
          : 'border-muted-foreground/30 hover:border-primary hover:bg-muted/50'
        }
        ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      data-testid="zone-file-upload"
    >
      <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
        {isLoading ? (
          <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin" />
        ) : (
          <Upload className="w-8 h-8 md:w-10 md:h-10" />
        )}
      </div>
      
      <h3 className="text-lg md:text-2xl font-bold mb-2 group-hover:text-primary transition-colors text-center">
        {isLoading 
          ? t('Common.upload.uploading', { defaultValue: 'Uploading...' })
          : multiple 
            ? t('Common.upload.uploadFiles', { defaultValue: 'Upload files' })
            : t('Common.upload.uploadFile', { defaultValue: 'Upload your file' })
        }
      </h3>
      
      <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 max-w-sm text-center">
        {isLoading 
          ? t('Common.upload.processingFiles', { defaultValue: 'Processing your files' })
          : (
            <>
              {t('Common.upload.dragDrop', { defaultValue: 'Drag and drop here, or click to browse' })}
              <span className="text-xs text-muted-foreground/70 mt-2 block">
                {getAcceptLabel()}
              </span>
            </>
          )
        }
      </p>
      
      <Button 
        size="lg" 
        className="rounded-full px-8 pointer-events-none"
        disabled={disabled || isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <FileUp className="w-5 h-5 mr-2" />
        )}
        {isLoading 
          ? t('Common.upload.uploading', { defaultValue: 'Uploading...' })
          : t('Common.upload.selectFile', { defaultValue: 'Select File' }) + (multiple ? 's' : '')
        }
      </Button>
      
      <input 
        ref={fileInputRef}
        type="file" 
        accept={accept}
        multiple={multiple}
        className="hidden" 
        onChange={handleFileChange}
        data-testid="input-file-upload"
      />
    </div>
  );
}
