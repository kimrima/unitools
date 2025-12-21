import { useCallback, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler } from '@/hooks/useFileHandler';
import { cropImage } from '@/lib/engines/imageEngine';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Image, Upload, Download, Loader2, CheckCircle, Crop } from 'lucide-react';

export default function CropImageTool() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropWidth, setCropWidth] = useState(0);
  const [cropHeight, setCropHeight] = useState(0);
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
        setCropWidth(img.width);
        setCropHeight(img.height);
        setCropX(0);
        setCropY(0);
      };
      img.src = files[0].previewUrl;
    }
  }, [files]);

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

  const handleCrop = useCallback(async () => {
    if (!files[0]?.previewUrl || cropWidth <= 0 || cropHeight <= 0) return;

    setStatus('processing');
    setProgress(0);
    setError(null);

    try {
      const blob = await cropImage(
        files[0].previewUrl,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        files[0].file.type.includes('png') ? 'png' : 'jpg',
        (prog) => setProgress(prog.percentage)
      );
      setResult(blob);
    } catch {
      setError({ code: 'CROP_FAILED' });
      setStatus('error');
    }
  }, [files, cropX, cropY, cropWidth, cropHeight, setStatus, setProgress, setError, setResult]);

  const handleDownload = useCallback(() => {
    const ext = files[0]?.file.type.includes('png') ? 'png' : 'jpg';
    downloadResult(`unitools_cropped.${ext}`);
  }, [files, downloadResult]);

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground" data-testid="text-instructions">
        {t('Tools.crop-image.description')}
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
            <Crop className="w-8 h-8 text-primary" />
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
          <Card className="p-4">
            {files[0].previewUrl && (
              <div className="relative">
                <img 
                  src={files[0].previewUrl} 
                  alt="Original"
                  className="w-full max-h-96 object-contain bg-muted rounded"
                />
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  {t('Tools.crop-image.originalSize', { defaultValue: 'Original' })}: {originalDimensions.width} x {originalDimensions.height} px
                </p>
              </div>
            )}
          </Card>

          <Card className="p-4 space-y-4">
            <p className="font-medium">{t('Tools.crop-image.cropArea', { defaultValue: 'Crop Area' })}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cropX">X</Label>
                <Input
                  id="cropX"
                  type="number"
                  value={cropX}
                  onChange={(e) => setCropX(Math.max(0, Number(e.target.value)))}
                  min={0}
                  max={originalDimensions.width}
                  data-testid="input-crop-x"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cropY">Y</Label>
                <Input
                  id="cropY"
                  type="number"
                  value={cropY}
                  onChange={(e) => setCropY(Math.max(0, Number(e.target.value)))}
                  min={0}
                  max={originalDimensions.height}
                  data-testid="input-crop-y"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cropWidth">{t('Tools.crop-image.width', { defaultValue: 'Width' })}</Label>
                <Input
                  id="cropWidth"
                  type="number"
                  value={cropWidth}
                  onChange={(e) => setCropWidth(Math.max(1, Number(e.target.value)))}
                  min={1}
                  data-testid="input-crop-width"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cropHeight">{t('Tools.crop-image.height', { defaultValue: 'Height' })}</Label>
                <Input
                  id="cropHeight"
                  type="number"
                  value={cropHeight}
                  onChange={(e) => setCropHeight(Math.max(1, Number(e.target.value)))}
                  min={1}
                  data-testid="input-crop-height"
                />
              </div>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button onClick={handleCrop} className="flex-1" data-testid="button-crop">
              <Crop className="w-4 h-4 mr-2" />
              {t('Tools.crop-image.title')}
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
            <p className="text-muted-foreground">{cropWidth} x {cropHeight} px</p>
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
