import { useCallback, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler } from '@/hooks/useFileHandler';
import { useStagedProcessing } from '@/hooks/useStagedProcessing';
import { applyRoundCorners } from '@/lib/engines/imageEngine';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { StagedLoadingOverlay } from '@/components/StagedLoadingOverlay';
import { Upload, Download, CheckCircle, Square } from 'lucide-react';
import { AdSlot } from '@/components/AdSlot';

const RADIUS_PRESETS = [0, 10, 20, 30, 50, 75, 100];

export default function RoundCornersTool() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [radius, setRadius] = useState(30);
  const [showResults, setShowResults] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  
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
      { name: 'processing', duration: 1400, message: t('Common.stages.applyingFilter', { defaultValue: 'Applying filter...' }) },
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

  const maxRadius = Math.min(imageDimensions.width, imageDimensions.height) / 2 || 200;

  useEffect(() => {
    if (files.length > 0 && files[0].previewUrl) {
      const img = new window.Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
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
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
      setShowResults(false);
    }
  }, [addFiles]);

  const handleApply = useCallback(async () => {
    if (!files[0]?.previewUrl) return;
    
    setError(null);
    setShowResults(false);

    try {
      await stagedProcessing.runStagedProcessing(async () => {
        const blob = await applyRoundCorners(files[0].previewUrl!, radius);
        setResult(blob);
        return blob;
      });
      setShowResults(true);
    } catch {
      setError({ code: 'ROUND_CORNERS_FAILED' });
    }
  }, [files, radius, setError, setResult, stagedProcessing]);

  const handleDownload = useCallback(() => {
    downloadResult(`unitools_rounded.png`);
  }, [downloadResult]);

  const reset = useCallback(() => {
    resetHandler();
    stagedProcessing.reset();
    setShowResults(false);
    setRadius(30);
  }, [resetHandler, stagedProcessing]);

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground" data-testid="text-instructions">
        {t('Tools.round-corners.description')}
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
            <Square className="w-8 h-8 text-primary" />
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
            {files[0].previewUrl && (
              <div className="flex justify-center">
                <img 
                  src={files[0].previewUrl} 
                  alt="Preview" 
                  className="max-w-full max-h-64 object-contain bg-muted"
                  style={{ borderRadius: `${radius}px` }} 
                />
              </div>
            )}
          </Card>

          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Label>{t('Tools.round-corners.radius', { defaultValue: 'Corner Radius' })}</Label>
              <span className="text-lg font-semibold text-primary">{radius}px</span>
            </div>
            
            <Slider 
              value={[radius]} 
              onValueChange={(values) => setRadius(values[0])} 
              min={0} 
              max={Math.round(maxRadius)} 
              step={1}
              data-testid="slider-radius"
            />
            
            <div className="flex gap-2 flex-wrap justify-center">
              {RADIUS_PRESETS.map((preset) => (
                <Button
                  key={preset}
                  variant={radius === preset ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRadius(preset)}
                  data-testid={`button-preset-${preset}`}
                >
                  {preset}px
                </Button>
              ))}
            </div>
          </Card>

          <div className="flex gap-3">
            <Button onClick={handleApply} className="flex-1" data-testid="button-apply">
              <Square className="w-4 h-4 mr-2" />
              {t('Tools.round-corners.title')}
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
          showAds={true}
        />
      )}

      {showResults && resultBlob && (
        <div className="space-y-6">
          <Card className="p-4">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">{t('Common.workflow.processingComplete')}</span>
              </div>
              {previewUrl && (
                <img 
                  src={previewUrl} 
                  alt="Result" 
                  className="max-w-full max-h-80 object-contain bg-muted rounded"
                />
              )}
              <p className="text-sm text-muted-foreground">
                {t('Tools.round-corners.applied', { radius, defaultValue: `Corner radius: ${radius}px` })}
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
          <AdSlot position="results" />
        </div>
      )}

      {error && (
        <div className="text-center text-destructive py-4" data-testid="section-error">
          {t(`Common.errors.${error.code}`, { defaultValue: t('Common.messages.error') })}
        </div>
      )}
    </div>
  );
}
