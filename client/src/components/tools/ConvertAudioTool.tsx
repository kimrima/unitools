import { useCallback, useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { useFileHandler, type FileHandlerError } from '@/hooks/useFileHandler';
import { convertAudio, boostAudio, reverseAudio, changeAudioBitrate, FFmpegError, isFFmpegSupported, type ConvertAudioResult, type BoostAudioResult, type ReverseAudioResult, type AudioBitrateResult } from '@/lib/engines/ffmpegEngine';
import { getFileSizeData } from '@/lib/engines/imageCompress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUploadZone } from '@/components/tool-ui';
import { Music, Download, Loader2, AlertTriangle, Volume2, RotateCcw, Gauge, Check } from 'lucide-react';
import { downloadBlob } from '@/hooks/useToolEngine';

type ToolMode = 'convert-audio' | 'boost-audio' | 'reverse-audio' | 'audio-bitrate';
type AudioResult = ConvertAudioResult | BoostAudioResult | ReverseAudioResult | AudioBitrateResult;
type LoadingStage = 'idle' | 'loading-ffmpeg' | 'processing' | 'complete';

interface ConvertAudioToolProps {
  toolId?: string;
}

export default function ConvertAudioTool({ toolId: propToolId }: ConvertAudioToolProps) {
  const { t } = useTranslation();
  const [location] = useLocation();
  
  const toolId = useMemo(() => {
    if (propToolId) return propToolId as ToolMode;
    const parts = location.split('/');
    return (parts[parts.length - 1] || 'convert-audio') as ToolMode;
  }, [propToolId, location]);
  
  const [outputFormat, setOutputFormat] = useState<'mp3' | 'wav' | 'ogg'>('mp3');
  const [boostLevel, setBoostLevel] = useState(200);
  const [bitrate, setBitrate] = useState<'64k' | '128k' | '192k' | '256k' | '320k'>('192k');
  const [result, setResult] = useState<AudioResult | null>(null);
  const [loadingStage, setLoadingStage] = useState<LoadingStage>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  const toolConfig = useMemo(() => {
    switch (toolId) {
      case 'boost-audio':
        return { icon: Volume2, titleKey: 'boost-audio', actionKey: 'boost', actionLabel: '볼륨 증폭' };
      case 'reverse-audio':
        return { icon: RotateCcw, titleKey: 'reverse-audio', actionKey: 'reverse', actionLabel: '역재생' };
      case 'audio-bitrate':
        return { icon: Gauge, titleKey: 'audio-bitrate', actionKey: 'change', actionLabel: '비트레이트 변경' };
      default:
        return { icon: Music, titleKey: 'convert-audio', actionKey: 'convert', actionLabel: '포맷 변환' };
    }
  }, [toolId]);
  
  const {
    status,
    error,
    progress,
    setStatus,
    setError,
    setProgress,
    reset: resetHandler,
  } = useFileHandler({ accept: 'audio/*', multiple: false, maxSizeBytes: 300 * 1024 * 1024 });

  useEffect(() => {
    setResult(null);
    setUploadedFile(null);
    setAudioUrl(null);
    setLoadingStage('idle');
  }, [toolId]);

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
      const file = audioFiles[0];
      setUploadedFile(file);
      setResult(null);
      setAudioUrl(URL.createObjectURL(file));
    }
  }, []);

  const handleProcess = useCallback(async () => {
    if (!uploadedFile) {
      setError({ code: 'NO_FILES_PROVIDED' });
      return;
    }
    setStatus('processing');
    setProgress(0);
    setError(null);
    setResult(null);
    setLoadingStage('loading-ffmpeg');

    try {
      let processResult: AudioResult;
      
      const progressCallback = (prog: number) => {
        if (prog > 0) {
          setLoadingStage('processing');
        }
        setProgress(prog);
      };
      
      switch (toolId) {
        case 'boost-audio':
          processResult = await boostAudio(uploadedFile, { volume: boostLevel / 100 }, progressCallback);
          break;
        case 'reverse-audio':
          processResult = await reverseAudio(uploadedFile, progressCallback);
          break;
        case 'audio-bitrate':
          processResult = await changeAudioBitrate(uploadedFile, { bitrate }, progressCallback);
          break;
        default:
          processResult = await convertAudio(uploadedFile, { outputFormat }, progressCallback);
      }
      
      setResult(processResult);
      setStatus('success');
      setLoadingStage('complete');
    } catch (err) {
      console.error('Audio processing error:', err);
      setError({ code: err instanceof FFmpegError ? err.code : 'PROCESSING_FAILED' });
      setStatus('error');
      setLoadingStage('idle');
    }
  }, [uploadedFile, toolId, outputFormat, boostLevel, bitrate, setStatus, setProgress, setError]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const baseName = result.originalFile.name.substring(0, result.originalFile.name.lastIndexOf('.'));
    let ext = 'mp3';
    let prefix = 'converted';
    
    if ('newFormat' in result && result.newFormat) {
      ext = result.newFormat;
      prefix = 'converted';
    } else if (toolId === 'boost-audio') {
      ext = result.originalFile.name.split('.').pop() || 'mp3';
      prefix = 'boosted';
    } else if (toolId === 'reverse-audio') {
      ext = result.originalFile.name.split('.').pop() || 'mp3';
      prefix = 'reversed';
    } else if (toolId === 'audio-bitrate') {
      ext = result.originalFile.name.split('.').pop() || 'mp3';
      prefix = `${bitrate}`;
    }
    
    downloadBlob(result.outputBlob, `unitools_${prefix}_${baseName}.${ext}`);
  }, [result, toolId, bitrate]);

  const reset = useCallback(() => {
    resetHandler();
    setResult(null);
    setAudioUrl(null);
    setUploadedFile(null);
    setLoadingStage('idle');
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

  const ToolIcon = toolConfig.icon;

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground" data-testid="text-instructions">{t(`Tools.${toolConfig.titleKey}.description`, { defaultValue: t('Tools.convert-audio.instructions') })}</div>

      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Music className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 dark:text-blue-200">{t('Common.messages.audioFileSizeLimit')}</p>
              <p className="text-blue-700 dark:text-blue-300 mt-1">{t('Common.messages.fileSizeLimitNotice')}</p>
              <p className="text-amber-600 dark:text-amber-400 mt-1">{t('Common.messages.qualityDegradationNotice')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-4">
          {toolId === 'convert-audio' && (
            <div className="space-y-2">
              <Label>{t('Common.messages.outputFormat')}</Label>
              <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as 'mp3' | 'wav' | 'ogg')}>
                <SelectTrigger data-testid="select-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp3">MP3</SelectItem>
                  <SelectItem value="wav">WAV</SelectItem>
                  <SelectItem value="ogg">OGG</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {toolId === 'boost-audio' && (
            <div className="space-y-2">
              <Label>볼륨 레벨: {boostLevel}%</Label>
              <Slider
                value={[boostLevel]}
                onValueChange={([v]) => setBoostLevel(v)}
                min={100}
                max={400}
                step={10}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">100% = 원본, 200% = 2배 크게</p>
            </div>
          )}
          
          {toolId === 'audio-bitrate' && (
            <div className="space-y-2">
              <Label>비트레이트</Label>
              <Select value={bitrate} onValueChange={(v) => setBitrate(v as '64k' | '128k' | '192k' | '256k' | '320k')}>
                <SelectTrigger data-testid="select-bitrate">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="64k">64 kbps (저용량)</SelectItem>
                  <SelectItem value="128k">128 kbps (표준)</SelectItem>
                  <SelectItem value="192k">192 kbps (고음질)</SelectItem>
                  <SelectItem value="256k">256 kbps (고음질)</SelectItem>
                  <SelectItem value="320k">320 kbps (최고음질)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {toolId === 'reverse-audio' && (
            <p className="text-sm text-muted-foreground">오디오가 역방향으로 재생됩니다</p>
          )}
        </CardContent>
      </Card>

      <FileUploadZone
        onFileSelect={handleFilesFromDropzone}
        accept="audio/*"
      />

      {audioUrl && !result && status !== 'processing' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Music className="w-8 h-8 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">{uploadedFile?.name}</p>
                <p className="text-sm text-muted-foreground">{uploadedFile && formatFileSize(uploadedFile.size)}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={reset}>{t('Common.actions.clear')}</Button>
            </div>
            <audio src={audioUrl} controls className="w-full mt-4" data-testid="audio-preview" />
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
                  1단계: FFmpeg 엔진 로딩
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${loadingStage === 'processing' ? 'bg-primary text-primary-foreground animate-pulse' : loadingStage === 'complete' ? 'bg-green-500 text-white' : 'bg-muted'}`}>
                  {loadingStage === 'processing' ? <Loader2 className="w-4 h-4 animate-spin" /> : loadingStage === 'complete' ? <Check className="w-4 h-4" /> : <span className="text-xs">2</span>}
                </div>
                <span className={loadingStage === 'processing' ? 'font-medium' : 'text-muted-foreground'}>
                  2단계: 오디오 처리 중
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${loadingStage === 'complete' ? 'bg-green-500 text-white' : 'bg-muted'}`}>
                  {loadingStage === 'complete' ? <Check className="w-4 h-4" /> : <span className="text-xs">3</span>}
                </div>
                <span className={loadingStage === 'complete' ? 'font-medium' : 'text-muted-foreground'}>
                  3단계: 완료
                </span>
              </div>
            </div>
            
            {loadingStage === 'processing' && (
              <Progress value={progress} className="h-2" data-testid="progress-bar" />
            )}
          </CardContent>
        </Card>
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
        <Button onClick={handleProcess} disabled={!uploadedFile || status === 'processing'} className="flex-1" data-testid="button-process">
          {status === 'processing' ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('Common.messages.processing')}</>
          ) : (
            <><ToolIcon className="w-4 h-4 mr-2" />{toolConfig.actionLabel}</>
          )}
        </Button>
        {(status === 'success' || status === 'error') && <Button variant="outline" onClick={reset} data-testid="button-reset">{t('Common.actions.reset')}</Button>}
      </div>
    </div>
  );
}
