import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler, type FileHandlerError } from '@/hooks/useFileHandler';
import { trimVideo, FFmpegError, isFFmpegSupported, type TrimVideoResult } from '@/lib/engines/ffmpegEngine';
import { getFileSizeData } from '@/lib/engines/imageCompress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FileUploadZone } from '@/components/tool-ui';
import { Video, Download, Loader2, Scissors, AlertTriangle } from 'lucide-react';
import { downloadBlob } from '@/hooks/useToolEngine';

export default function TrimVideoTool() {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);
  const [videoDuration, setVideoDuration] = useState(0);
  const [result, setResult] = useState<TrimVideoResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const {
    files,
    status,
    error,
    progress,
    addFiles,
    setStatus,
    setError,
    setProgress,
    reset: resetHandler,
  } = useFileHandler({ accept: 'video/*', multiple: false, maxSizeBytes: 50 * 1024 * 1024 });

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

  const handleFilesFromDropzone = useCallback((fileList: FileList) => {
    const videoFiles = Array.from(fileList).filter(f => f.type.startsWith('video/'));
    if (videoFiles.length > 0) {
      addFiles([videoFiles[0]]);
      setResult(null);
      const url = URL.createObjectURL(videoFiles[0]);
      setVideoUrl(url);
    }
  }, [addFiles]);

  const handleVideoLoaded = useCallback(() => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      setVideoDuration(duration);
      setEndTime(Math.min(10, duration));
    }
  }, []);

  const handleTrim = useCallback(async () => {
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
      const trimResult = await trimVideo(
        files[0].file,
        { startTime, endTime },
        (prog) => {
          setProgress(prog);
        }
      );

      setResult(trimResult);
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
  }, [files, startTime, endTime, setStatus, setProgress, setError]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const baseName = result.originalFile.name.substring(0, result.originalFile.name.lastIndexOf('.'));
    downloadBlob(result.outputBlob, `unitools_${baseName}_trimmed.mp4`);
  }, [result]);

  const reset = useCallback(() => {
    resetHandler();
    setResult(null);
    setVideoUrl(null);
    setVideoDuration(0);
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
        {t('Tools.trim-video.instructions')}
      </div>

      <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20 dark:border-yellow-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                {t('Common.messages.videoFileSizeLimit')} | {t('Common.messages.recommendedVideoLength')}
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                {t('Common.messages.qualityDegradationNotice')} {t('Common.messages.largeFileRecommendation')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <FileUploadZone
        onFileSelect={handleFilesFromDropzone}
        accept="video/*"
      />

      {videoUrl && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              onLoadedMetadata={handleVideoLoaded}
              className="w-full max-h-64 rounded-lg"
              data-testid="video-preview"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">{t('Common.messages.startTime')} ({t('Common.messages.seconds')})</Label>
                <Input
                  id="start-time"
                  type="number"
                  min={0}
                  max={videoDuration}
                  step={0.5}
                  value={startTime}
                  onChange={(e) => setStartTime(parseFloat(e.target.value) || 0)}
                  data-testid="input-start-time"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-time">{t('Common.messages.endTime')} ({t('Common.messages.seconds')})</Label>
                <Input
                  id="end-time"
                  type="number"
                  min={0}
                  max={videoDuration}
                  step={0.5}
                  value={endTime}
                  onChange={(e) => setEndTime(parseFloat(e.target.value) || 0)}
                  data-testid="input-end-time"
                />
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              {t('Common.messages.duration')}: {(endTime - startTime).toFixed(1)}s / {videoDuration.toFixed(1)}s
            </div>
          </CardContent>
        </Card>
      )}

      {status === 'processing' && (
        <div className="space-y-2" data-testid="section-processing">
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{isLoading && progress === 0 ? t('Common.messages.loadingFFmpeg') : t('Common.messages.processing')}</span>
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
                  {formatFileSize(result.originalSize)} → {formatFileSize(result.outputSize)}
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
          onClick={handleTrim}
          disabled={files.length === 0 || status === 'processing'}
          className="flex-1"
          data-testid="button-trim"
        >
          {status === 'processing' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('Common.messages.processing')}
            </>
          ) : (
            <>
              <Scissors className="w-4 h-4 mr-2" />
              {t('Common.actions.trim')}
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
