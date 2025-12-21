import { useCallback, useRef, useState, useMemo } from 'react';
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
import { Music, Upload, Download, Loader2, RefreshCw, AlertTriangle, Volume2, RotateCcw, Gauge } from 'lucide-react';
import { downloadBlob } from '@/hooks/useToolEngine';

type ToolMode = 'convert-audio' | 'boost-audio' | 'reverse-audio' | 'audio-bitrate';
type AudioResult = ConvertAudioResult | BoostAudioResult | ReverseAudioResult | AudioBitrateResult;

interface ConvertAudioToolProps {
  toolId?: string;
}

export default function ConvertAudioTool({ toolId: propToolId }: ConvertAudioToolProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const toolConfig = useMemo(() => {
    switch (toolId) {
      case 'boost-audio':
        return { icon: Volume2, titleKey: 'boost-audio', actionKey: 'boost' };
      case 'reverse-audio':
        return { icon: RotateCcw, titleKey: 'reverse-audio', actionKey: 'reverse' };
      case 'audio-bitrate':
        return { icon: Gauge, titleKey: 'audio-bitrate', actionKey: 'change' };
      default:
        return { icon: Music, titleKey: 'convert-audio', actionKey: 'convert' };
    }
  }, [toolId]);
  
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
  } = useFileHandler({ accept: 'audio/*', multiple: false, maxSizeBytes: 200 * 1024 * 1024 });

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

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      addFiles(e.target.files);
      setResult(null);
      setAudioUrl(URL.createObjectURL(e.target.files[0]));
    }
  }, [addFiles]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('audio/'));
    if (droppedFiles.length > 0) {
      addFiles([droppedFiles[0]]);
      setResult(null);
      setAudioUrl(URL.createObjectURL(droppedFiles[0]));
    }
  }, [addFiles]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => e.preventDefault(), []);

  const handleProcess = useCallback(async () => {
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
      let processResult: AudioResult;
      
      switch (toolId) {
        case 'boost-audio':
          processResult = await boostAudio(files[0].file, { volume: boostLevel / 100 }, (prog) => setProgress(prog));
          break;
        case 'reverse-audio':
          processResult = await reverseAudio(files[0].file, (prog) => setProgress(prog));
          break;
        case 'audio-bitrate':
          processResult = await changeAudioBitrate(files[0].file, { bitrate }, (prog) => setProgress(prog));
          break;
        default:
          processResult = await convertAudio(files[0].file, { outputFormat }, (prog) => setProgress(prog));
      }
      
      setResult(processResult);
      setStatus('success');
    } catch (err) {
      setError({ code: err instanceof FFmpegError ? err.code : 'PROCESSING_FAILED' });
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  }, [files, toolId, outputFormat, boostLevel, bitrate, setStatus, setProgress, setError]);

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
      <div className="text-sm text-muted-foreground" data-testid="text-instructions">{t(`Tools.${toolConfig.titleKey}.description`, { defaultValue: t('Tools.convert-audio.instructions') })}</div>

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
              <Label>{t('Common.messages.volume', { defaultValue: 'Volume Level' })}: {boostLevel}%</Label>
              <Slider
                value={[boostLevel]}
                onValueChange={([v]) => setBoostLevel(v)}
                min={100}
                max={400}
                step={10}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">{t('Common.messages.volumeHint', { defaultValue: '100% = original, 200% = 2x louder' })}</p>
            </div>
          )}
          
          {toolId === 'audio-bitrate' && (
            <div className="space-y-2">
              <Label>{t('Common.messages.bitrate', { defaultValue: 'Bitrate' })}</Label>
              <Select value={bitrate} onValueChange={(v) => setBitrate(v as '64k' | '128k' | '192k' | '256k' | '320k')}>
                <SelectTrigger data-testid="select-bitrate">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="64k">64 kbps</SelectItem>
                  <SelectItem value="128k">128 kbps</SelectItem>
                  <SelectItem value="192k">192 kbps</SelectItem>
                  <SelectItem value="256k">256 kbps</SelectItem>
                  <SelectItem value="320k">320 kbps</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {toolId === 'reverse-audio' && (
            <p className="text-sm text-muted-foreground">{t('Tools.reverse-audio.hint', { defaultValue: 'Your audio will be reversed' })}</p>
          )}
        </CardContent>
      </Card>

      <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileSelect} className="hidden" data-testid="input-file-audio" />

      <div onDrop={handleDrop} onDragOver={handleDragOver} onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-muted-foreground/25 rounded-lg min-h-40 flex flex-col items-center justify-center gap-4 hover:border-muted-foreground/50 transition-colors cursor-pointer p-6" data-testid="dropzone-audio">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Upload className="w-6 h-6 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="font-medium">{t('Common.messages.dragDrop')}</p>
          <p className="text-sm text-muted-foreground mt-1">{t('Common.messages.noServerUpload')}</p>
        </div>
      </div>

      {audioUrl && !result && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Music className="w-8 h-8 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">{files[0]?.file.name}</p>
                <p className="text-sm text-muted-foreground">{files[0] && formatFileSize(files[0].file.size)}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={clearFiles}>{t('Common.actions.clear')}</Button>
            </div>
            <audio src={audioUrl} controls className="w-full mt-4" data-testid="audio-preview" />
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
                <p className="text-sm text-green-600 dark:text-green-400">{formatFileSize(result.originalSize)} → {formatFileSize(result.outputSize)} ({outputFormat.toUpperCase()})</p>
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
        <Button onClick={handleProcess} disabled={files.length === 0 || status === 'processing'} className="flex-1" data-testid="button-process">
          {status === 'processing' ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('Common.messages.processing')}</>
          ) : (
            <><toolConfig.icon className="w-4 h-4 mr-2" />{t(`Common.actions.${toolConfig.actionKey}`, { defaultValue: t('Common.actions.convert') })}</>
          )}
        </Button>
        {(status === 'success' || status === 'error') && <Button variant="outline" onClick={reset} data-testid="button-reset">{t('Common.actions.reset')}</Button>}
      </div>
    </div>
  );
}
