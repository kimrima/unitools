import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler, type FileHandlerError } from '@/hooks/useFileHandler';
import { compressVideo, FFmpegError, isFFmpegSupported, type CompressVideoResult } from '@/lib/engines/ffmpegEngine';
import { getFileSizeData } from '@/lib/engines/imageCompress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Video, Upload, Download, Loader2, Minimize2, AlertTriangle, Info } from 'lucide-react';
import { downloadBlob } from '@/hooks/useToolEngine';

export default function CompressVideoTool() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [result, setResult] = useState<CompressVideoResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const {
    files,
    status,
    error,
    progress,
    addFiles,
    clearFiles,
    setStatus,
    setError,
    setProgress,
    reset: resetHandler,
  } = useFileHandler({ accept: 'video/*', multiple: false, maxSizeBytes: 300 * 1024 * 1024 });

  const formatFileSize = useCallback((bytes: number): string => {
    const data = getFileSizeData(bytes);
    return `${data.value} ${t(`Common.units.${data.unit}`)}`;
  }, [t]);

  const translateError = useCallback((err: FileHandlerError | FFmpegError | null): string => {
    if (!err) return '';
    
    if (err instanceof FFmpegError) {
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
    if (e.target.files && e.target.files[0]) {
      addFiles(e.target.files);
      setResult(null);
      const url = URL.createObjectURL(e.target.files[0]);
      setVideoUrl(url);
    }
  }, [addFiles]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type.startsWith('video/')
    );
    if (droppedFiles.length > 0) {
      addFiles([droppedFiles[0]]);
      setResult(null);
      const url = URL.createObjectURL(droppedFiles[0]);
      setVideoUrl(url);
    }
  }, [addFiles]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleCompress = useCallback(async () => {
    if (files.length === 0) {
      setError({ code: 'NO_FILES_PROVIDED' });
      return;
    }

    setStatus('processing');
    setProgress(0);
    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      const compressResult = await compressVideo(
        files[0].file,
        { quality },
        (prog) => {
          setProgress(prog);
        }
      );

      setResult(compressResult);
      setStatus('success');
    } catch (err) {
      if (err instanceof FFmpegError) {
        setError({ code: err.code });
      } else {
        setError({ code: 'PROCESSING_FAILED' });
      }
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  }, [files, quality, setStatus, setProgress, setError]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const baseName = result.originalFile.name.substring(0, result.originalFile.name.lastIndexOf('.'));
    downloadBlob(result.outputBlob, `unitools_${baseName}_compressed.mp4`);
  }, [result]);

  const reset = useCallback(() => {
    resetHandler();
    setResult(null);
    setVideoUrl(null);
  }, [resetHandler]);

  const ffmpegSupported = isFFmpegSupported();

  if (!ffmpegSupported) {
    return (
      <div className="space-y-6">
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                  {t('Common.messages.browserNotSupported')}
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  {t('Common.messages.ffmpegNotSupported')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground" data-testid="text-instructions">
        {t('Tools.compress-video.instructions')}
      </div>

      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 dark:text-blue-200">
                {t('Common.messages.videoFileSizeLimit')}
              </p>
              <p className="text-blue-700 dark:text-blue-300 mt-1">
                {t('Common.messages.fileSizeLimitNotice')} {t('Common.messages.recommendedVideoLength')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-4">
          <Label>{t('Common.messages.quality')}</Label>
          <RadioGroup
            value={quality}
            onValueChange={(v) => setQuality(v as 'low' | 'medium' | 'high')}
            className="flex gap-4"
            data-testid="radio-quality"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="low" id="low" />
              <Label htmlFor="low">{t('Common.messages.qualityLow')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="medium" />
              <Label htmlFor="medium">{t('Common.messages.qualityMedium')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="high" id="high" />
              <Label htmlFor="high">{t('Common.messages.qualityHigh')}</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-file-video"
      />

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-muted-foreground/25 rounded-lg min-h-40 flex flex-col items-center justify-center gap-4 hover:border-muted-foreground/50 transition-colors cursor-pointer p-6"
        data-testid="dropzone-video"
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

      {videoUrl && !result && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Video className="w-8 h-8 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">{files[0]?.file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {files[0] && formatFileSize(files[0].file.size)}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={clearFiles}>
                {t('Common.actions.clear')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {status === 'processing' && (
        <div className="space-y-2" data-testid="section-processing">
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{isLoading && progress === 0 ? t('Common.messages.loadingFFmpeg') : t('Common.messages.compressingVideo')}</span>
          </div>
          <Progress value={progress} className="h-2" data-testid="progress-bar" />
        </div>
      )}

      {result && (
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <p className="font-medium text-green-700 dark:text-green-300">
                  {t('Common.messages.complete')}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {formatFileSize(result.originalSize)} → {formatFileSize(result.outputSize)} ({result.compressionRatio}% {t('Common.messages.reduced')})
                </p>
              </div>
              <Button onClick={handleDownload} data-testid="button-download">
                <Download className="w-4 h-4 mr-2" />
                {t('Common.actions.download')}
              </Button>
            </div>
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
          onClick={handleCompress}
          disabled={files.length === 0 || status === 'processing'}
          className="flex-1"
          data-testid="button-compress"
        >
          {status === 'processing' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('Common.messages.processing')}
            </>
          ) : (
            <>
              <Minimize2 className="w-4 h-4 mr-2" />
              {t('Common.actions.compress')}
            </>
          )}
        </Button>
        
        {(status === 'success' || status === 'error') && (
          <Button variant="outline" onClick={reset} data-testid="button-reset">
            {t('Common.actions.reset')}
          </Button>
        )}
      </div>
    </div>
  );
}
