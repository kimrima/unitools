import { useCallback, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler } from '@/hooks/useFileHandler';
import { resizeImage } from '@/lib/engines/imageEngine';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Image, Upload, Download, Loader2, CheckCircle, Link2 } from 'lucide-react';

export default function ResizeImageTool() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  
  const {
    files,
    status,
    error,
    progress,
    resultBlob,
    addFiles,
    setStatus,
    setError,
    setResult,
    setProgress,
    downloadResult,
    reset,
  } = useFileHandler({ accept: 'image/*', multiple: false });

  useEffect(() => {
    if (files.length > 0 && files[0].previewUrl) {
      const img = new window.Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
        setWidth(img.width);
        setHeight(img.height);
      };
      img.src = files[0].previewUrl;
    }
  }, [files]);

  const handleWidthChange = useCallback((newWidth: number) => {
    setWidth(newWidth);
    if (maintainAspect && originalDimensions.width > 0) {
      const ratio = originalDimensions.height / originalDimensions.width;
      setHeight(Math.round(newWidth * ratio));
    }
  }, [maintainAspect, originalDimensions]);

  const handleHeightChange = useCallback((newHeight: number) => {
    setHeight(newHeight);
    if (maintainAspect && originalDimensions.height > 0) {
      const ratio = originalDimensions.width / originalDimensions.height;
      setWidth(Math.round(newHeight * ratio));
    }
  }, [maintainAspect, originalDimensions]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
  }, [addFiles]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type.startsWith('image/')
    );
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  }, [addFiles]);

  const handleResize = useCallback(async () => {
    if (!files[0]?.previewUrl || width <= 0 || height <= 0) return;

    setStatus('processing');
    setProgress(0);
    setError(null);

    try {
      const blob = await resizeImage(
        files[0].previewUrl,
        width,
        height,
        maintainAspect,
        files[0].file.type.includes('png') ? 'png' : 'jpg',
        (prog) => setProgress(prog.percentage)
      );
      setResult(blob);
    } catch {
      setError({ code: 'RESIZE_FAILED' });
      setStatus('error');
    }
  }, [files, width, height, maintainAspect, setStatus, setProgress, setError, setResult]);

  const handleDownload = useCallback(() => {
    const ext = files[0]?.file.type.includes('png') ? 'png' : 'jpg';
    downloadResult(`unitools_resized_${width}x${height}.${ext}`);
  }, [files, width, height, downloadResult]);

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

      {status === 'idle' && files.length === 0 && (
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

      {status === 'idle' && files.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <p className="text-sm font-medium mb-2">{t('Tools.resize-image.original', { defaultValue: 'Original' })}</p>
              {files[0].previewUrl && (
                <img 
                  src={files[0].previewUrl} 
                  alt="Original"
                  className="w-full h-48 object-contain bg-muted rounded"
                />
              )}
              <p className="text-sm text-muted-foreground mt-2">
                {originalDimensions.width} x {originalDimensions.height} px
              </p>
            </Card>
            
            <Card className="p-4">
              <p className="text-sm font-medium mb-2">{t('Tools.resize-image.preview', { defaultValue: 'Preview' })}</p>
              <div className="w-full h-48 bg-muted rounded flex items-center justify-center">
                <p className="text-muted-foreground">{width} x {height} px</p>
              </div>
            </Card>
          </div>

          <Card className="p-4 space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">{t('Tools.resize-image.width', { defaultValue: 'Width (px)' })}</Label>
                <Input
                  id="width"
                  type="number"
                  value={width}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                  min={1}
                  data-testid="input-width"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">{t('Tools.resize-image.height', { defaultValue: 'Height (px)' })}</Label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                  min={1}
                  data-testid="input-height"
                />
              </div>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button onClick={handleResize} className="flex-1" data-testid="button-resize">
              {t('Tools.resize-image.title')}
            </Button>
            <Button variant="outline" onClick={reset} data-testid="button-reset">
              {t('Common.workflow.startOver')}
            </Button>
          </div>
        </div>
      )}

      {status === 'processing' && (
        <div className="space-y-6 py-8">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="font-medium">{t('Common.workflow.processing')}</p>
          </div>
          <Progress value={progress} className="h-2" data-testid="progress-bar" />
        </div>
      )}

      {status === 'success' && resultBlob && (
        <div className="flex flex-col items-center gap-6 py-8">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">{t('Common.workflow.processingComplete')}</h3>
            <p className="text-muted-foreground">{width} x {height} px</p>
          </div>
          <div className="flex gap-3">
            <Button size="lg" onClick={handleDownload} data-testid="button-download">
              <Download className="w-5 h-5 mr-2" />
              {t('Common.workflow.download')}
            </Button>
            <Button variant="outline" size="lg" onClick={reset} data-testid="button-start-over">
              {t('Common.workflow.startOver')}
            </Button>
          </div>
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
