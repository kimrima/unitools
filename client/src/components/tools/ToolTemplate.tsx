import { useTranslation } from 'react-i18next';
import { useLocale } from '@/components/LocaleProvider';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Settings, Loader2, Download, CheckCircle, X, FileText, Image, Film } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToolStep = 'upload' | 'options' | 'processing' | 'complete';

interface ToolTemplateProps {
  step: ToolStep;
  progress?: number;
  children: React.ReactNode;
}

const steps = [
  { id: 'upload', icon: Upload, labelKey: 'upload' },
  { id: 'options', icon: Settings, labelKey: 'options' },
  { id: 'processing', icon: Loader2, labelKey: 'processing' },
  { id: 'complete', icon: CheckCircle, labelKey: 'complete' },
] as const;

export function ToolTemplate({ step, progress = 0, children }: ToolTemplateProps) {
  const { t } = useTranslation();
  const locale = useLocale();

  const currentStepIndex = steps.findIndex((s) => s.id === step);

  const stepLabels: Record<string, { ko: string; en: string }> = {
    upload: { ko: '파일 선택', en: 'Upload' },
    options: { ko: '설정', en: 'Options' },
    processing: { ko: '처리 중', en: 'Processing' },
    complete: { ko: '완료', en: 'Complete' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-2 md:gap-4">
        {steps.map((s, index) => {
          const Icon = s.icon;
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          const isPending = index > currentStepIndex;

          return (
            <div key={s.id} className="flex items-center gap-2 md:gap-4">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                    isActive && 'bg-primary text-primary-foreground',
                    isCompleted && 'bg-green-500 text-white',
                    isPending && 'bg-muted text-muted-foreground'
                  )}
                  data-testid={`step-indicator-${s.id}`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className={cn('w-5 h-5', isActive && s.id === 'processing' && 'animate-spin')} />
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium hidden sm:block',
                    isActive && 'text-primary',
                    isCompleted && 'text-green-500',
                    isPending && 'text-muted-foreground'
                  )}
                >
                  {stepLabels[s.id][locale as 'ko' | 'en'] || stepLabels[s.id].en}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-8 md:w-16 h-0.5 transition-colors',
                    index < currentStepIndex ? 'bg-green-500' : 'bg-muted'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {step === 'processing' && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" data-testid="progress-bar" />
          <p className="text-center text-sm text-muted-foreground">
            {progress}% {locale === 'ko' ? '완료' : 'complete'}
          </p>
        </div>
      )}

      <div className="min-h-64">{children}</div>

      {step === 'processing' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 border-dashed border-2 flex items-center justify-center min-h-24">
            <p className="text-sm text-muted-foreground text-center">
              {locale === 'ko' ? '광고 영역' : 'Ad Slot'}
            </p>
          </Card>
          <Card className="p-4 border-dashed border-2 flex items-center justify-center min-h-24">
            <p className="text-sm text-muted-foreground text-center">
              {locale === 'ko' ? '광고 영역' : 'Ad Slot'}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  files?: File[];
  onRemoveFile?: (index: number) => void;
  fileType?: 'pdf' | 'image' | 'video' | 'any';
}

export function Dropzone({
  onFilesSelected,
  accept = '*/*',
  multiple = true,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024,
  files = [],
  onRemoveFile,
  fileType = 'any',
}: DropzoneProps) {
  const locale = useLocale();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    onFilesSelected(droppedFiles.slice(0, maxFiles));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    onFilesSelected(selectedFiles.slice(0, maxFiles));
  };

  const getIcon = () => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="w-12 h-12 text-muted-foreground" />;
      case 'image':
        return <Image className="w-12 h-12 text-muted-foreground" />;
      case 'video':
        return <Film className="w-12 h-12 text-muted-foreground" />;
      default:
        return <Upload className="w-12 h-12 text-muted-foreground" />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-muted-foreground/25 rounded-xl min-h-64 flex flex-col items-center justify-center gap-4 p-6 hover:border-primary/50 transition-colors cursor-pointer"
        data-testid="dropzone"
      >
        {getIcon()}
        <div className="text-center">
          <p className="font-medium text-lg">
            {locale === 'ko' ? '파일을 여기에 끌어다 놓으세요' : 'Drop files here'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {locale === 'ko' ? '또는 클릭하여 파일 선택' : 'or click to browse'}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {locale === 'ko'
              ? `최대 ${maxFiles}개 파일, 각 ${formatSize(maxSize)}`
              : `Up to ${maxFiles} files, ${formatSize(maxSize)} each`}
          </p>
        </div>
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="absolute inset-0 opacity-0 cursor-pointer"
          style={{ position: 'absolute', width: '100%', height: '100%' }}
          data-testid="input-file"
        />
        <Button type="button" variant="outline" className="relative z-10" data-testid="button-select-files">
          <Upload className="w-4 h-4 mr-2" />
          {locale === 'ko' ? '파일 선택' : 'Select Files'}
        </Button>
      </div>

      {files.length > 0 && (
        <div className="space-y-2" data-testid="file-list">
          <p className="text-sm font-medium">
            {locale === 'ko'
              ? `${files.length}개 파일 선택됨`
              : `${files.length} file${files.length > 1 ? 's' : ''} selected`}
          </p>
          <div className="space-y-2 max-h-48 overflow-auto">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between gap-3 p-3 bg-muted/50 rounded-lg"
                data-testid={`file-item-${index}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {fileType === 'pdf' ? (
                      <FileText className="w-4 h-4 text-primary" />
                    ) : fileType === 'image' ? (
                      <Image className="w-4 h-4 text-primary" />
                    ) : fileType === 'video' ? (
                      <Film className="w-4 h-4 text-primary" />
                    ) : (
                      <FileText className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                  </div>
                </div>
                {onRemoveFile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveFile(index)}
                    data-testid={`button-remove-file-${index}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface DownloadResultProps {
  fileName: string;
  fileSize: number;
  originalSize?: number;
  onDownload: () => void;
  onReset: () => void;
  downloadUrl?: string;
}

export function DownloadResult({
  fileName,
  fileSize,
  originalSize,
  onDownload,
  onReset,
  downloadUrl,
}: DownloadResultProps) {
  const locale = useLocale();

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const savings = originalSize ? Math.round(((originalSize - fileSize) / originalSize) * 100) : null;

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-8">
      <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
        <CheckCircle className="w-10 h-10 text-green-500" />
      </div>

      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">
          {locale === 'ko' ? '처리 완료!' : 'Processing Complete!'}
        </h3>
        <p className="text-muted-foreground">{fileName}</p>

        {originalSize && savings !== null && savings > 0 && (
          <div className="mt-3 flex items-center justify-center gap-3 text-sm">
            <span className="text-muted-foreground line-through">{formatSize(originalSize)}</span>
            <span className="text-green-500 font-medium">{formatSize(fileSize)}</span>
            <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded text-xs font-medium">
              -{savings}%
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {downloadUrl ? (
          <a href={downloadUrl} download={fileName}>
            <Button size="lg" className="gap-2" data-testid="button-download">
              <Download className="w-5 h-5" />
              {locale === 'ko' ? '다운로드' : 'Download'}
            </Button>
          </a>
        ) : (
          <Button size="lg" className="gap-2" onClick={onDownload} data-testid="button-download">
            <Download className="w-5 h-5" />
            {locale === 'ko' ? '다운로드' : 'Download'}
          </Button>
        )}
        <Button variant="outline" size="lg" onClick={onReset} data-testid="button-reset">
          {locale === 'ko' ? '다시 하기' : 'Start Over'}
        </Button>
      </div>

      <Card className="w-full max-w-md p-4 border-dashed border-2 flex items-center justify-center min-h-16 mt-4">
        <p className="text-sm text-muted-foreground text-center">
          {locale === 'ko' ? '광고 영역' : 'Ad Slot'}
        </p>
      </Card>
    </div>
  );
}
