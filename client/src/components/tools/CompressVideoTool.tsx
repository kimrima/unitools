import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler, type FileHandlerError } from '@/hooks/useFileHandler';
import { compressVideo, FFmpegError, isFFmpegSupported, type CompressVideoResult } from '@/lib/engines/ffmpegEngine';
import { getFileSizeData } from '@/lib/engines/imageCompress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FileUploadZone } from '@/components/tool-ui';
import { Video, Download, Loader2, Minimize2, AlertTriangle, Info, Check } from 'lucide-react';
import { downloadBlob } from '@/hooks/useToolEngine';

type LoadingStage = 'idle' | 'loading-ffmpeg' | 'processing' | 'complete';

export default function CompressVideoTool() {
  const { t } = useTranslation();
  
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [result, setResult] = useState<CompressVideoResult | null>(null);
  const [loadingStage, setLoadingStage] = useState<LoadingStage>('idle');
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
  } = useFileHandler({ accept: 'video/*', multiple: false, maxSizeBytes: 30 * 1024 * 1024 });

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

  const handleCompress = useCallback(async () => {
    if (files.length === 0) {
      setError({ code: 'NO_FILES_PROVIDED' });
      return;
    }

    setStatus('processing');
    setProgress(0);
    setError(null);
    setResult(null);
    setLoadingStage('loading-ffmpeg');

    try {
      const compressResult = await compressVideo(
        files[0].file,
        { quality },
        (prog) => {
          if (prog > 0) {
            setLoadingStage('processing');
          }
          setProgress(prog);
        }
      );

      setResult(compressResult);
      setStatus('success');
      setLoadingStage('complete');
    } catch (err) {
      if (err instanceof FFmpegError) {
        setError({ code: err.code });
      } else {
        setError({ code: 'PROCESSING_FAILED' });
      }
      setStatus('error');
      setLoadingStage('idle');
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
    setLoadingStage('idle');
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

      <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-red-800 dark:text-red-200">
                비디오 압축은 매우 오래 걸립니다 (30MB 이하, 30초 이하 권장)
              </p>
              <p className="text-red-700 dark:text-red-300 mt-1">
                {t('Common.messages.qualityDegradationNotice')} 브라우저 처리 특성상 긴 영상은 처리가 실패할 수 있습니다.
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
              <Label htmlFor="low">{t('Common.messages.qualityLow')} (가장 빠름)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="medium" />
              <Label htmlFor="medium">{t('Common.messages.qualityMedium')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="high" id="high" />
              <Label htmlFor="high">{t('Common.messages.qualityHigh')} (가장 느림)</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <FileUploadZone
        onFileSelect={handleFilesFromDropzone}
        accept="video/*"
      />

      {videoUrl && !result && status !== 'processing' && (
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
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${loadingStage === 'loading-ffmpeg' ? 'bg-primary text-primary-foreground animate-pulse' : loadingStage === 'processing' || loadingStage === 'complete' ? 'bg-green-500 text-white' : 'bg-muted'}`}>
                  {loadingStage === 'loading-ffmpeg' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </div>
                <span className={loadingStage === 'loading-ffmpeg' ? 'font-medium' : 'text-muted-foreground'}>
                  {t('Common.messages.step1Loading')}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${loadingStage === 'processing' ? 'bg-primary text-primary-foreground animate-pulse' : loadingStage === 'complete' ? 'bg-green-500 text-white' : 'bg-muted'}`}>
                  {loadingStage === 'processing' ? <Loader2 className="w-4 h-4 animate-spin" /> : loadingStage === 'complete' ? <Check className="w-4 h-4" /> : <span className="text-xs">2</span>}
                </div>
                <span className={loadingStage === 'processing' ? 'font-medium' : 'text-muted-foreground'}>
                  {t('Common.messages.step2VideoProcessing')}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${loadingStage === 'complete' ? 'bg-green-500 text-white' : 'bg-muted'}`}>
                  {loadingStage === 'complete' ? <Check className="w-4 h-4" /> : <span className="text-xs">3</span>}
                </div>
                <span className={loadingStage === 'complete' ? 'font-medium' : 'text-muted-foreground'}>
                  {t('Common.messages.step3Complete')}
                </span>
              </div>
            </div>
            
            {loadingStage === 'processing' && (
              <>
                <Progress value={progress} className="h-2" data-testid="progress-bar" />
                <p className="text-xs text-muted-foreground text-center">
                  처리 중... 브라우저 탭을 닫지 마세요
                </p>
              </>
            )}
          </CardContent>
        </Card>
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
                  {result.originalSize > result.outputSize && (
                    <span className="ml-2">
                      ({Math.round((1 - result.outputSize / result.originalSize) * 100)}% 감소)
                    </span>
                  )}
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
