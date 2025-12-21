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
import { Image, Download, Link2, RefreshCw, Share2 } from 'lucide-react';
import { FileUploadZone, ResultSuccessHeader, FileResultCard, PrivacyNote, RelatedTools } from '@/components/tool-ui';
import { useToast } from '@/hooks/use-toast';

const PRESET_SCALES = [25, 50, 75, 100, 125, 150, 200];

export default function ResizeImageTool() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('Tools.resize-image.title'),
          text: t('Common.messages.shareText', { defaultValue: 'Check out this free tool!' }),
          url: window.location.href,
        });
      } catch { }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: t('Common.messages.copied', { defaultValue: 'Link copied!' }) });
    }
  };

  const reset = useCallback(() => {
    resetHandler();
    stagedProcessing.reset();
    setShowResults(false);
    setScale(100);
  }, [resetHandler, stagedProcessing]);

  const formatFileSize = (bytes: number): string => {
    const k = 1024;
    if (bytes < k) return `${bytes} B`;
    if (bytes < k * k) return `${(bytes / k).toFixed(1)} KB`;
    return `${(bytes / (k * k)).toFixed(1)} MB`;
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
        />
      </div>
    );
  }

  if (showResults && resultBlob) {
    return (
      <div className="space-y-6">
        <ResultSuccessHeader
          stats={[
            { label: t('Common.messages.originalSize', { defaultValue: 'Original' }), value: `${originalDimensions.width}x${originalDimensions.height}` },
            { label: t('Common.messages.newSize', { defaultValue: 'New Size' }), value: `${targetWidth}x${targetHeight}` },
            { label: t('Common.messages.scale', { defaultValue: 'Scale' }), value: `${scale}%` },
            { label: t('Common.messages.fileSize', { defaultValue: 'File Size' }), value: formatFileSize(resultBlob.size) },
          ]}
        />
        
        <FileResultCard
          fileName={`resized_${targetWidth}x${targetHeight}.${files[0]?.file.type.includes('png') ? 'png' : 'jpg'}`}
          fileSize={formatFileSize(resultBlob.size)}
          fileType="image"
          previewUrl={previewUrl || undefined}
          onDownload={handleDownload}
          onShare={handleShare}
        />

        <div className="flex gap-3">
          <Button variant="outline" size="lg" onClick={reset} className="flex-1 rounded-xl" data-testid="button-new-file">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('Common.actions.processAnother', { defaultValue: 'Process Another' })}
          </Button>
        </div>
        
        <PrivacyNote variant="success" />
        
        <RelatedTools currentToolId="resize-image" category="image-edit" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-file-image"
      />

      {files.length === 0 && (
        <>
          <FileUploadZone
            onFileSelect={(fileList) => addFiles(fileList)}
            accept="image/*"
            multiple={false}
          />
          <PrivacyNote />
        </>
      )}

      {files.length > 0 && (
        <div className="space-y-6">
          <Card className="p-6 overflow-visible">
            <div className="flex flex-col md:flex-row gap-6">
              {files[0].previewUrl && (
                <div className="flex-1">
                  <img 
                    src={files[0].previewUrl} 
                    alt="Original"
                    className="w-full max-h-64 object-contain bg-muted rounded-xl"
                  />
                </div>
              )}
              <div className="flex-1 flex flex-col justify-center">
                <div className="text-center p-6 bg-muted/50 rounded-xl border">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
                    {t('Tools.resize-image.original', { defaultValue: 'Original' })}
                  </p>
                  <p className="font-medium text-lg">{originalDimensions.width} x {originalDimensions.height} px</p>
                  <div className="my-4 text-2xl text-muted-foreground">→</div>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
                    {t('Tools.resize-image.result', { defaultValue: 'Result' })}
                  </p>
                  <p className="font-medium text-lg text-primary">{targetWidth} x {targetHeight} px</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-6 overflow-visible">
            <div className="flex items-center justify-between gap-3">
              <Label className="font-medium">{t('Tools.resize-image.maintainAspect', { defaultValue: 'Maintain aspect ratio' })}</Label>
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
              <div className="flex items-center justify-between gap-3">
                <Label className="font-medium">{t('Tools.resize-image.scale', { defaultValue: 'Scale' })}</Label>
                <span className="text-xl font-bold text-primary">{scale}%</span>
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
                    className="rounded-lg"
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
            <Button onClick={handleResize} size="lg" className="flex-1 rounded-xl" data-testid="button-resize">
              <Image className="w-5 h-5 mr-2" />
              {t('Tools.resize-image.title')}
            </Button>
            <Button variant="outline" size="lg" onClick={reset} className="rounded-xl" data-testid="button-reset">
              {t('Common.workflow.startOver')}
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-xl" data-testid="section-error">
          {t(`Common.errors.${error.code}`, { defaultValue: t('Common.messages.error') })}
        </div>
      )}
    </div>
  );
}
