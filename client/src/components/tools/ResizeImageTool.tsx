import { useCallback, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler } from '@/hooks/useFileHandler';
import { useStagedProcessing } from '@/hooks/useStagedProcessing';
import { resizeImage } from '@/lib/engines/imageEngine';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { StagedLoadingOverlay } from '@/components/StagedLoadingOverlay';
import { Image, Upload, Download, CheckCircle, Link2 } from 'lucide-react';
import { ShareActions } from '@/components/ShareActions';

const PRESET_SCALES = [25, 50, 75, 100, 125, 150, 200];

export default function ResizeImageTool() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scale, setScale] = useState<number>(100);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [showResults, setShowResults] = useState(false);
  
  const {
    files,
    error,
    resultBlob,
    addFiles,
    setError,
    setResult,
    downloadResult,
    reset: resetHandler,
  } = useFileHandler({ accept: 'image/*', multiple: false });

  const stagedProcessing = useStagedProcessing({
    minDuration: 3000,
    stages: [
      { name: 'analyzing', duration: 800, message: t('Common.stages.analyzingFiles', { defaultValue: 'Analyzing files...' }) },
      { name: 'processing', duration: 1400, message: t('Common.stages.resizingImage', { defaultValue: 'Resizing image...' }) },
      { name: 'optimizing', duration: 800, message: t('Common.stages.optimizingOutput', { defaultValue: 'Optimizing output...' }) },
    ],
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (resultBlob) {
      const url = URL.createObjectURL(resultBlob);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    return undefined;
  }, [resultBlob]);

  const targetWidth = Math.round(originalDimensions.width * scale / 100);
  const targetHeight = Math.round(originalDimensions.height * scale / 100);

  useEffect(() => {
    if (files.length > 0 && files[0].previewUrl) {
      const img = new window.Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
        setScale(100);
      };
      img.src = files[0].previewUrl;
    }
  }, [files]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
      setShowResults(false);
    }
  }, [addFiles]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type.startsWith('image/')
    );
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
      setShowResults(false);
    }
  }, [addFiles]);

  const handleResize = useCallback(async () => {
    if (!files[0]?.previewUrl || targetWidth <= 0 || targetHeight <= 0) return;

    setError(null);
    setShowResults(false);

    try {
      await stagedProcessing.runStagedProcessing(async () => {
        const blob = await resizeImage(
          files[0].previewUrl!,
          targetWidth,
          targetHeight,
          maintainAspect,
          files[0].file.type.includes('png') ? 'png' : 'jpg'
        );
        setResult(blob);
        return blob;
      });
      setShowResults(true);
    } catch {
      setError({ code: 'RESIZE_FAILED' });
    }
  }, [files, targetWidth, targetHeight, maintainAspect, setError, setResult, stagedProcessing]);

  const handleDownload = useCallback(() => {
    const ext = files[0]?.file.type.includes('png') ? 'png' : 'jpg';
    downloadResult(`unitools_resized_${targetWidth}x${targetHeight}.${ext}`);
  }, [files, targetWidth, targetHeight, downloadResult]);

  const reset = useCallback(() => {
    resetHandler();
    stagedProcessing.reset();
    setShowResults(false);
    setScale(100);
  }, [resetHandler, stagedProcessing]);

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground" data-testid="text-instructions">
        {t('Tools.resize-image.description')}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-file-image"
      />

      {!stagedProcessing.isProcessing && !showResults && files.length === 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-muted-foreground/25 rounded-xl min-h-64 flex flex-col items-center justify-center gap-4 p-8 cursor-pointer hover:border-primary/50 transition-colors"
          data-testid="dropzone"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Image className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-medium text-lg">{t('Common.workflow.dropFilesHere')}</p>
            <p className="text-sm text-muted-foreground mt-1">{t('Common.workflow.orClickToBrowse')}</p>
          </div>
          <Button variant="outline" data-testid="button-select-file">
            <Upload className="w-4 h-4 mr-2" />
            {t('Common.workflow.selectFiles')}
          </Button>
        </div>
      )}

      {!stagedProcessing.isProcessing && !showResults && files.length > 0 && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {files[0].previewUrl && (
                <div className="flex-1">
                  <img 
                    src={files[0].previewUrl} 
                    alt="Original"
                    className="w-full max-h-64 object-contain bg-muted rounded"
                  />
                </div>
              )}
              <div className="flex-1 flex flex-col justify-center">
                <div className="text-center p-4 bg-muted rounded">
                  <p className="text-sm text-muted-foreground mb-2">
                    {t('Tools.resize-image.original', { defaultValue: 'Original' })}
                  </p>
                  <p className="font-medium">{originalDimensions.width} x {originalDimensions.height} px</p>
                  <div className="my-4 text-2xl text-muted-foreground">→</div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {t('Tools.resize-image.result', { defaultValue: 'Result' })}
                  </p>
                  <p className="font-medium text-primary">{targetWidth} x {targetHeight} px</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 space-y-6">
            <div className="flex items-center justify-between">
              <Label>{t('Tools.resize-image.maintainAspect', { defaultValue: 'Maintain aspect ratio' })}</Label>
              <div className="flex items-center gap-2">
                <Link2 className={`w-4 h-4 ${maintainAspect ? 'text-primary' : 'text-muted-foreground'}`} />
                <Switch
                  checked={maintainAspect}
                  onCheckedChange={setMaintainAspect}
                  data-testid="switch-aspect-ratio"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{t('Tools.resize-image.scale', { defaultValue: 'Scale' })}</Label>
                <span className="text-lg font-semibold text-primary">{scale}%</span>
              </div>
              
              <Slider
                value={[scale]}
                onValueChange={(values) => setScale(values[0])}
                min={10}
                max={200}
                step={5}
                className="w-full"
                data-testid="slider-scale"
              />
              
              <div className="flex gap-2 flex-wrap justify-center">
                {PRESET_SCALES.map((preset) => (
                  <Button
                    key={preset}
                    variant={scale === preset ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setScale(preset)}
                    data-testid={`button-preset-${preset}`}
                  >
                    {preset}%
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button onClick={handleResize} className="flex-1" data-testid="button-resize">
              <Image className="w-4 h-4 mr-2" />
              {t('Tools.resize-image.title')}
            </Button>
            <Button variant="outline" onClick={reset} data-testid="button-reset">
              {t('Common.workflow.startOver')}
            </Button>
          </div>
        </div>
      )}

      {stagedProcessing.isProcessing && (
        <StagedLoadingOverlay
          stage={stagedProcessing.stage}
          progress={stagedProcessing.progress}
          stageProgress={stagedProcessing.stageProgress}
          message={stagedProcessing.message}
          error={stagedProcessing.error}
          onCancel={stagedProcessing.abort}
        />
      )}

      {showResults && resultBlob && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">{t('Common.workflow.processingComplete')}</span>
              </div>
              {previewUrl && (
                <div className="w-full flex justify-center p-4 bg-muted rounded">
                  <img 
                    src={previewUrl} 
                    alt="Result" 
                    className="max-w-full h-auto object-contain"
                  />
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                {originalDimensions.width} x {originalDimensions.height} → {targetWidth} x {targetHeight} px
              </p>
              <div className="flex gap-3">
                <Button onClick={handleDownload} data-testid="button-download">
                  <Download className="w-4 h-4 mr-2" />
                  {t('Common.workflow.download')}
                </Button>
                <Button variant="outline" onClick={reset} data-testid="button-start-over">
                  {t('Common.workflow.startOver')}
                </Button>
              </div>
            </div>
          </Card>
          <ShareActions />
        </div>
      )}

      {error && (
        <div className="text-center text-destructive py-4">
          {t(`Common.errors.${error.code}`, { defaultValue: t('Common.messages.error') })}
        </div>
      )}
    </div>
  );
}
