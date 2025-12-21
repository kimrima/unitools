import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'wouter';
import { useFileHandler, type FileHandlerError } from '@/hooks/useFileHandler';
import { useStagedProcessing } from '@/hooks/useStagedProcessing';
import { convertImages, ImageConvertError, getFormatExtension, type ConvertResult, type ImageFormat } from '@/lib/engines/imageConvert';
import { getFileSizeData } from '@/lib/engines/imageCompress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Image, Upload, X, RefreshCw } from 'lucide-react';
import { StagedLoadingOverlay } from '@/components/StagedLoadingOverlay';

interface ToolFormatConfig {
  acceptedFormats: string[];
  defaultTarget: ImageFormat;
  availableTargets: ImageFormat[];
  acceptMime: string;
}

const toolFormatConfigs: Record<string, ToolFormatConfig> = {
  'png-to-jpg': {
    acceptedFormats: ['PNG'],
    defaultTarget: 'jpeg',
    availableTargets: ['jpeg'],
    acceptMime: 'image/png',
  },
  'jpg-to-png': {
    acceptedFormats: ['JPG', 'JPEG'],
    defaultTarget: 'png',
    availableTargets: ['png'],
    acceptMime: 'image/jpeg',
  },
  'webp-to-jpg': {
    acceptedFormats: ['WebP'],
    defaultTarget: 'jpeg',
    availableTargets: ['jpeg'],
    acceptMime: 'image/webp',
  },
  'webp-to-png': {
    acceptedFormats: ['WebP'],
    defaultTarget: 'png',
    availableTargets: ['png'],
    acceptMime: 'image/webp',
  },
  'png-to-webp': {
    acceptedFormats: ['PNG'],
    defaultTarget: 'webp',
    availableTargets: ['webp'],
    acceptMime: 'image/png',
  },
  'jpg-to-webp': {
    acceptedFormats: ['JPG', 'JPEG'],
    defaultTarget: 'webp',
    availableTargets: ['webp'],
    acceptMime: 'image/jpeg',
  },
  'webp-converter': {
    acceptedFormats: ['JPG', 'PNG', 'GIF', 'BMP'],
    defaultTarget: 'webp',
    availableTargets: ['webp'],
    acceptMime: 'image/jpeg,image/png,image/gif,image/bmp',
  },
  'convert-image': {
    acceptedFormats: ['JPG', 'PNG', 'WebP', 'GIF', 'BMP'],
    defaultTarget: 'jpeg',
    availableTargets: ['jpeg', 'png', 'webp'],
    acceptMime: 'image/*',
  },
  'bulk-convert': {
    acceptedFormats: ['JPG', 'PNG', 'WebP', 'GIF', 'BMP'],
    defaultTarget: 'jpeg',
    availableTargets: ['jpeg', 'png', 'webp'],
    acceptMime: 'image/*',
  },
  'bulk-convert-image': {
    acceptedFormats: ['JPG', 'PNG', 'WebP', 'GIF', 'BMP'],
    defaultTarget: 'jpeg',
    availableTargets: ['jpeg', 'png', 'webp'],
    acceptMime: 'image/*',
  },
  'gif-to-png': {
    acceptedFormats: ['GIF'],
    defaultTarget: 'png',
    availableTargets: ['png'],
    acceptMime: 'image/gif',
  },
  'svg-to-png': {
    acceptedFormats: ['SVG'],
    defaultTarget: 'png',
    availableTargets: ['png'],
    acceptMime: 'image/svg+xml',
  },
};

interface ConvertImageToolProps {
  toolId?: string;
}

export default function ConvertImageTool({ toolId = 'convert-image' }: ConvertImageToolProps) {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const params = useParams<{ locale: string }>();
  const locale = params.locale || i18n.language;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const config = toolFormatConfigs[toolId] || toolFormatConfigs['convert-image'];
  const [targetFormat, setTargetFormat] = useState<ImageFormat>(config.defaultTarget);
  
  const {
    files,
    error,
    addFiles,
    removeFile,
    clearFiles,
    setError,
    reset: resetHandler,
  } = useFileHandler({ accept: config.acceptMime, multiple: true });
  
  const stagedProcessing = useStagedProcessing({
    minDuration: 4500,
    stages: [
      { name: 'analyzing', duration: 1200, message: t('Common.stages.analyzingFiles', { defaultValue: 'Analyzing files...' }) },
      { name: 'processing', duration: 2000, message: t('Common.stages.convertingFormat', { defaultValue: 'Converting format...' }) },
      { name: 'optimizing', duration: 1300, message: t('Common.stages.optimizingOutput', { defaultValue: 'Optimizing output...' }) },
    ],
  });
  
  const showFormatSelect = config.availableTargets.length > 1;

  const formatFileSize = useCallback((bytes: number): string => {
    const data = getFileSizeData(bytes);
    return `${data.value} ${t(`Common.units.${data.unit}`)}`;
  }, [t]);

  const translateError = useCallback((err: FileHandlerError | ImageConvertError | null): string => {
    if (!err) return '';
    
    if (err instanceof ImageConvertError) {
      if (err.fileName) {
        return `${t(`Common.errors.${err.code}`)}: ${err.fileName}`;
      }
      return t(`Common.errors.${err.code}`);
    }
    
    if ('code' in err) {
      return t(`Common.errors.${err.code}`);
    }
    
    return t('Common.messages.error');
  }, [t]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
  }, [addFiles]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const acceptedMimes = config.acceptMime === 'image/*' 
      ? null 
      : config.acceptMime.split(',');
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) => {
      if (!file.type.startsWith('image/')) return false;
      if (!acceptedMimes) return true;
      return acceptedMimes.some(mime => file.type === mime.trim());
    });
    
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  }, [addFiles, config.acceptMime]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const saveResultsToSession = useCallback(async (results: ConvertResult[]) => {
    const processedResults = await Promise.all(
      results.map(async (result) => {
        return new Promise<{
          blobData: string;
          fileName: string;
          originalSize: number;
          outputSize: number;
          mimeType: string;
        }>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve({
              blobData: base64,
              fileName: `unitools_${result.originalFile.name.substring(0, result.originalFile.name.lastIndexOf('.'))}.${getFormatExtension(result.newFormat).slice(1)}`,
              originalSize: result.originalSize,
              outputSize: result.convertedSize,
              mimeType: result.convertedBlob.type,
            });
          };
          reader.readAsDataURL(result.convertedBlob);
        });
      })
    );
    
    const resultData = {
      results: processedResults,
      toolId,
      timestamp: Date.now(),
    };
    sessionStorage.setItem('unitools_result', JSON.stringify(resultData));
    setLocation(`/${locale}/${toolId}/result`);
  }, [locale, toolId, setLocation]);

  const handleConvert = useCallback(async () => {
    if (files.length === 0) {
      setError({ code: 'NO_FILES_SELECTED' });
      return;
    }

    setError(null);

    try {
      await stagedProcessing.runStagedProcessing(
        async () => {
          const results = await convertImages(
            files.map(f => f.file),
            { format: targetFormat, quality: 0.92 },
            () => {}
          );
          return results;
        },
        (results) => {
          if (results.length > 0) {
            saveResultsToSession(results);
          }
        }
      );
    } catch (err) {
      if (err instanceof ImageConvertError) {
        setError({ code: err.code });
      } else {
        setError({ code: 'PROCESSING_FAILED' });
      }
    }
  }, [files, targetFormat, setError, stagedProcessing, saveResultToSession]);

  const reset = useCallback(() => {
    resetHandler();
    stagedProcessing.reset();
  }, [resetHandler, stagedProcessing]);

  const formatLabels: Record<ImageFormat, string> = {
    jpeg: 'JPG',
    png: 'PNG',
    webp: 'WebP',
  };

  if (stagedProcessing.isProcessing) {
    return (
      <div className="space-y-6">
        <StagedLoadingOverlay
          stage={stagedProcessing.stage}
          progress={stagedProcessing.progress}
          stageProgress={stagedProcessing.stageProgress}
          message={stagedProcessing.message}
          error={stagedProcessing.error}
          onCancel={stagedProcessing.abort}
          showAds={true}
        />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground" data-testid="text-instructions">
        {t(`Tools.${toolId}.instructions`, { defaultValue: t('Tools.convert-image.instructions') })}
      </div>

      {showFormatSelect && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <Label htmlFor="format-select">{t('Common.messages.targetFormat')}</Label>
              <Select value={targetFormat} onValueChange={(v) => setTargetFormat(v as ImageFormat)}>
                <SelectTrigger id="format-select" data-testid="select-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {config.availableTargets.map((format) => (
                    <SelectItem key={format} value={format}>
                      {formatLabels[format]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={config.acceptMime}
        multiple
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-file-image"
      />

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-muted-foreground/25 rounded-lg min-h-40 flex flex-col items-center justify-center gap-4 hover:border-muted-foreground/50 transition-colors cursor-pointer p-6"
        data-testid="dropzone-image"
      >
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Upload className="w-6 h-6 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="font-medium">{t('Common.messages.dragDrop')}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t('Common.messages.noServerUpload')}
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-sm font-medium" data-testid="text-files-count">
                {files.length} {t('Common.messages.filesSelected')}
              </span>
              <Button variant="ghost" size="sm" onClick={clearFiles} data-testid="button-clear">
                {t('Common.actions.clear')}
              </Button>
            </div>

            <ul className="space-y-2">
              {files.map((file, index) => (
                <li
                  key={file.id}
                  className="flex items-center gap-3 p-2 bg-muted/50 rounded-md"
                  data-testid={`list-item-file-${index}`}
                >
                  {file.previewUrl ? (
                    <img
                      src={file.previewUrl}
                      alt={file.file.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <Image className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className="flex-1 text-sm truncate">{file.file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(file.file.size)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                    data-testid={`button-remove-file-${index}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg" data-testid="section-error">
          {translateError(error)}
        </div>
      )}

      <div className="flex gap-4 flex-wrap">
        <Button
          onClick={handleConvert}
          disabled={files.length === 0}
          className="flex-1"
          data-testid="button-convert"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('Common.actions.convert')}
        </Button>
        
        {files.length > 0 && (
          <Button variant="outline" onClick={reset} data-testid="button-reset">
            {t('Common.actions.reset')}
          </Button>
        )}
      </div>
    </div>
  );
}
