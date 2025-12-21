import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler, type FileHandlerError } from '@/hooks/useFileHandler';
import { convertVideoToGif, VideoToGifError, isFFmpegSupported, type GifResult } from '@/lib/engines/videoToGif';
import { getFileSizeData } from '@/lib/engines/imageCompress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Video, Upload, Download, Loader2, Film, AlertTriangle } from 'lucide-react';
import { downloadBlob } from '@/hooks/useToolEngine';

export default function VideoToGifTool() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [fps, setFps] = useState(10);
  const [width, setWidth] = useState(480);
  const [startTime, setStartTime] = useState(0);
  const [duration, setDuration] = useState(5);
  const [gifResult, setGifResult] = useState<GifResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
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
  } = useFileHandler({ accept: 'video/*', multiple: false });

  const formatFileSize = useCallback((bytes: number): string => {
    const data = getFileSizeData(bytes);
    return `${data.value} ${t(`Common.units.${data.unit}`)}`;
  }, [t]);

  const translateError = useCallback((err: FileHandlerError | VideoToGifError | null): string => {
    if (!err) return '';
    
    if (err instanceof VideoToGifError) {
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
      setGifResult(null);
    }
  }, [addFiles]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type.startsWith('video/')
    );
    if (droppedFiles.length > 0) {
      addFiles([droppedFiles[0]]);
      setGifResult(null);
    }
  }, [addFiles]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleConvert = useCallback(async () => {
    if (files.length === 0) {
      setError({ code: 'NO_FILES_PROVIDED' });
      return;
    }

    setStatus('processing');
    setProgress(0);
    setError(null);
    setGifResult(null);
    setIsLoading(true);

    try {
      const result = await convertVideoToGif(
        files[0].file,
        { fps, width, startTime, duration },
        (prog) => {
          setProgress(prog);
        }
      );

      setGifResult(result);
      setStatus('success');
    } catch (err) {
      if (err instanceof VideoToGifError) {
        setError({ code: err.code });
      } else {
        setError({ code: 'PROCESSING_FAILED' });
      }
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  }, [files, fps, width, startTime, duration, setStatus, setProgress, setError]);

  const handleDownload = useCallback(() => {
    if (!gifResult) return;
    const baseName = gifResult.originalFile.name.substring(0, gifResult.originalFile.name.lastIndexOf('.'));
    downloadBlob(gifResult.gifBlob, `unitools_${baseName}.gif`);
  }, [gifResult]);

  const reset = useCallback(() => {
    resetHandler();
    setGifResult(null);
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
        {t('Tools.video-to-gif.instructions')}
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fps-slider">{t('Common.messages.fps')}: {fps}</Label>
              <Slider
                id="fps-slider"
                value={[fps]}
                onValueChange={(values) => setFps(values[0])}
                min={5}
                max={30}
                step={1}
                data-testid="slider-fps"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="width-slider">{t('Common.messages.width')}: {width}px</Label>
              <Slider
                id="width-slider"
                value={[width]}
                onValueChange={(values) => setWidth(values[0])}
                min={200}
                max={1280}
                step={40}
                data-testid="slider-width"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">{t('Common.messages.startTime')} ({t('Common.messages.seconds')})</Label>
              <Input
                id="start-time"
                type="number"
                min={0}
                step={0.5}
                value={startTime}
                onChange={(e) => setStartTime(parseFloat(e.target.value) || 0)}
                data-testid="input-start-time"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">{t('Common.messages.duration')} ({t('Common.messages.seconds')})</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                max={30}
                step={0.5}
                value={duration}
                onChange={(e) => setDuration(parseFloat(e.target.value) || 5)}
                data-testid="input-duration"
              />
            </div>
          </div>
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

      {files.length > 0 && !gifResult && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Video className="w-8 h-8 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">{files[0].file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(files[0].file.size)}
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
            <span>{isLoading && progress === 0 ? t('Common.messages.loadingFFmpeg') : t('Common.messages.convertingVideo')}</span>
          </div>
          <Progress value={progress} className="h-2" data-testid="progress-bar" />
        </div>
      )}

      {gifResult && (
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <p className="font-medium text-green-700 dark:text-green-300">
                  {t('Common.messages.complete')}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {formatFileSize(gifResult.originalSize)} → {formatFileSize(gifResult.gifSize)}
                </p>
              </div>
              <Button onClick={handleDownload} data-testid="button-download">
                <Download className="w-4 h-4 mr-2" />
                {t('Common.actions.download')}
              </Button>
            </div>

            <div className="flex justify-center">
              <img
                src={URL.createObjectURL(gifResult.gifBlob)}
                alt="Generated GIF"
                className="max-w-full max-h-64 rounded-lg border"
                data-testid="preview-gif"
              />
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
          onClick={handleConvert}
          disabled={files.length === 0 || status === 'processing'}
          className="flex-1"
          data-testid="button-convert"
        >
          {status === 'processing' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('Common.messages.processing')}
            </>
          ) : (
            <>
              <Film className="w-4 h-4 mr-2" />
              {t('Common.actions.createGif')}
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
