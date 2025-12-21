import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler, type FileHandlerError } from '@/hooks/useFileHandler';
import { trimAudio, FFmpegError, isFFmpegSupported, type TrimAudioResult } from '@/lib/engines/ffmpegEngine';
import { getFileSizeData } from '@/lib/engines/imageCompress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FileUploadZone } from '@/components/tool-ui';
import { Music, Download, Loader2, Scissors, AlertTriangle } from 'lucide-react';
import { downloadBlob } from '@/hooks/useToolEngine';

export default function TrimAudioTool() {
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(30);
  const [audioDuration, setAudioDuration] = useState(0);
  const [result, setResult] = useState<TrimAudioResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
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
  } = useFileHandler({ accept: 'audio/*', multiple: false, maxSizeBytes: 300 * 1024 * 1024 });

  const formatFileSize = useCallback((bytes: number): string => {
    const data = getFileSizeData(bytes);
    return `${data.value} ${t(`Common.units.${data.unit}`)}`;
  }, [t]);

  const translateError = useCallback((err: FileHandlerError | FFmpegError | null): string => {
    if (!err) return '';
    if (err instanceof FFmpegError) return t(`Common.errors.${err.code}`);
    if ('code' in err) return t(`Common.errors.${err.code}`);
    return t('Common.messages.error');
  }, [t]);

  const handleFilesFromDropzone = useCallback((fileList: FileList) => {
    const audioFiles = Array.from(fileList).filter(f => f.type.startsWith('audio/'));
    if (audioFiles.length > 0) {
      addFiles([audioFiles[0]]);
      setResult(null);
      setAudioUrl(URL.createObjectURL(audioFiles[0]));
    }
  }, [addFiles]);

  const handleAudioLoaded = useCallback(() => {
    if (audioRef.current) {
      const duration = audioRef.current.duration;
      setAudioDuration(duration);
      setEndTime(Math.min(30, duration));
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
      const trimResult = await trimAudio(files[0].file, { startTime, endTime }, (prog) => setProgress(prog));
      setResult(trimResult);
      setStatus('success');
    } catch (err) {
      setError({ code: err instanceof FFmpegError ? err.code : 'PROCESSING_FAILED' });
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  }, [files, startTime, endTime, setStatus, setProgress, setError]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const baseName = result.originalFile.name.substring(0, result.originalFile.name.lastIndexOf('.'));
    downloadBlob(result.outputBlob, `unitools_${baseName}_trimmed.mp3`);
  }, [result]);

  const reset = useCallback(() => {
    resetHandler();
    setResult(null);
    setAudioUrl(null);
    setAudioDuration(0);
  }, [resetHandler]);

  if (!isFFmpegSupported()) {
    return (
      <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
            <div>
              <h3 className="font-medium text-yellow-800 dark:text-yellow-200">{t('Common.messages.browserNotSupported')}</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">{t('Common.messages.ffmpegNotSupported')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground" data-testid="text-instructions">{t('Tools.trim-audio.instructions')}</div>

      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Music className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 dark:text-blue-200">{t('Common.messages.audioFileSizeLimit')}</p>
              <p className="text-blue-700 dark:text-blue-300 mt-1">{t('Common.messages.fileSizeLimitNotice')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <FileUploadZone
        onFileSelect={handleFilesFromDropzone}
        accept="audio/*"
      />

      {audioUrl && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <audio ref={audioRef} src={audioUrl} controls onLoadedMetadata={handleAudioLoaded} className="w-full" data-testid="audio-preview" />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">{t('Common.messages.startTime')} ({t('Common.messages.seconds')})</Label>
                <Input id="start-time" type="number" min={0} max={audioDuration} step={0.5} value={startTime} onChange={(e) => setStartTime(parseFloat(e.target.value) || 0)} data-testid="input-start-time" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">{t('Common.messages.endTime')} ({t('Common.messages.seconds')})</Label>
                <Input id="end-time" type="number" min={0} max={audioDuration} step={0.5} value={endTime} onChange={(e) => setEndTime(parseFloat(e.target.value) || 0)} data-testid="input-end-time" />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">{t('Common.messages.duration')}: {(endTime - startTime).toFixed(1)}s / {audioDuration.toFixed(1)}s</div>
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
                <p className="font-medium text-green-700 dark:text-green-300">{t('Common.messages.complete')}</p>
                <p className="text-sm text-green-600 dark:text-green-400">{formatFileSize(result.originalSize)} → {formatFileSize(result.outputSize)}</p>
              </div>
              <Button onClick={handleDownload} data-testid="button-download">
                <Download className="w-4 h-4 mr-2" />
                {t('Common.actions.download')}
              </Button>
            </div>
            <audio src={URL.createObjectURL(result.outputBlob)} controls className="w-full" data-testid="audio-result" />
          </CardContent>
        </Card>
      )}

      {error && <div className="p-4 bg-destructive/10 text-destructive rounded-lg" data-testid="section-error">{translateError(error)}</div>}

      <div className="flex gap-4 flex-wrap">
        <Button onClick={handleTrim} disabled={files.length === 0 || status === 'processing'} className="flex-1" data-testid="button-trim">
          {status === 'processing' ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('Common.messages.processing')}</> : <><Scissors className="w-4 h-4 mr-2" />{t('Common.actions.trim')}</>}
        </Button>
        {(status === 'success' || status === 'error') && <Button variant="outline" onClick={reset} data-testid="button-reset">{t('Common.actions.reset')}</Button>}
      </div>
    </div>
  );
}
