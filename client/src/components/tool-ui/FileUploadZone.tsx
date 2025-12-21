import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Upload, FileUp } from 'lucide-react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileSelect(files);
    }
  }, [disabled, onFileSelect]);

  const handleClick = useCallback(() => {
    if (!disabled) fileInputRef.current?.click();
  }, [disabled]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files);
    }
  }, [onFileSelect]);

  const getAcceptLabel = () => {
    if (accept.includes('image/')) return 'JPG, PNG, WebP, GIF, SVG';
    if (accept.includes('pdf')) return 'PDF';
    if (accept.includes('video/')) return 'MP4, MOV, AVI';
    if (accept.includes('audio/')) return 'MP3, WAV, OGG';
    return t('Common.messages.allFormats', { defaultValue: 'All common formats' });
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
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      data-testid="zone-file-upload"
    >
      <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
        <Upload className="w-8 h-8 md:w-10 md:h-10" />
      </div>
      
      <h3 className="text-lg md:text-2xl font-bold mb-2 group-hover:text-primary transition-colors text-center">
        {multiple 
          ? t('Common.upload.uploadFiles', { defaultValue: 'Upload files' })
          : t('Common.upload.uploadFile', { defaultValue: 'Upload your file' })
        }
      </h3>
      
      <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 max-w-sm text-center">
        {t('Common.upload.dragDrop', { defaultValue: 'Drag and drop here, or click to browse' })}
        <span className="text-xs text-muted-foreground/70 mt-2 block">
          {getAcceptLabel()}
        </span>
      </p>
      
      <Button 
        size="lg" 
        className="rounded-full px-8 pointer-events-none"
        disabled={disabled}
      >
        <FileUp className="w-5 h-5 mr-2" />
        {t('Common.upload.selectFile', { defaultValue: 'Select File' })}{multiple ? 's' : ''}
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
