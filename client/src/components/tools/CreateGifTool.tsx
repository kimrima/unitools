import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Image, Upload, Download, Loader2, CheckCircle, Trash2, Plus, GripVertical } from 'lucide-react';

type ToolStatus = 'idle' | 'processing' | 'success' | 'error';

interface ImageItem {
  id: string;
  file: File;
  preview: string;
}

export default function CreateGifTool() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [status, setStatus] = useState<ToolStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<{ code: string } | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [frameDelay, setFrameDelay] = useState(500);
  const [quality, setQuality] = useState(10);
  const [width, setWidth] = useState(400);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    
    const newImages = imageFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
    }));
    
    setImages(prev => [...prev, ...newImages]);
    setStatus('idle');
    setError(null);
    setResultBlob(null);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl('');
  }, [resultUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    
    const newImages = imageFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
    }));
    
    setImages(prev => [...prev, ...newImages]);
    setStatus('idle');
    setError(null);
  }, []);

  const removeImage = (id: string) => {
    setImages(prev => {
      const item = prev.find(img => img.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter(img => img.id !== id);
    });
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    setImages(prev => {
      const newImages = [...prev];
      const [moved] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, moved);
      return newImages;
    });
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const handleCreateGif = async () => {
    if (images.length < 2) {
      setError({ code: 'MIN_IMAGES_REQUIRED' });
      return;
    }

    setStatus('processing');
    setProgress(10);
    setError(null);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      const firstImg = await loadImage(images[0].preview);
      const aspectRatio = firstImg.height / firstImg.width;
      const height = Math.round(width * aspectRatio);
      
      canvas.width = width;
      canvas.height = height;

      const frames: ImageData[] = [];
      
      for (let i = 0; i < images.length; i++) {
        const img = await loadImage(images[i].preview);
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        frames.push(ctx.getImageData(0, 0, width, height));
        setProgress(10 + (40 * (i + 1) / images.length));
      }

      const gif = new (window as any).GIF({
        workers: 2,
        quality,
        width,
        height,
        workerScript: '/gif.worker.js',
      });

      for (let i = 0; i < frames.length; i++) {
        ctx.putImageData(frames[i], 0, 0);
        gif.addFrame(ctx, { copy: true, delay: frameDelay });
        setProgress(50 + (40 * (i + 1) / frames.length));
      }

      gif.on('finished', (blob: Blob) => {
        setResultBlob(blob);
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        setResultUrl(URL.createObjectURL(blob));
        setStatus('success');
        setProgress(100);
      });

      gif.render();
    } catch (err) {
      console.error('GIF creation error:', err);
      setError({ code: 'GIF_CREATION_FAILED' });
      setStatus('error');
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'animation.gif';
    a.click();
  };

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-file-upload"
      />

      <Card
        className="border-2 border-dashed p-6 text-center cursor-pointer hover-elevate"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        data-testid="dropzone-images"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-medium">{t('Tools.create-gif.addImages')}</p>
            <p className="text-sm text-muted-foreground">{t('Tools.create-gif.dragHint')}</p>
          </div>
        </div>
      </Card>

      {images.length > 0 && (
        <Card className="p-4 space-y-4">
          <Label>{t('Tools.create-gif.imageOrder')} ({images.length} {t('Tools.create-gif.images')})</Label>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {images.map((img, index) => (
              <div
                key={img.id}
                className="relative group aspect-square rounded-md overflow-hidden border bg-muted"
              >
                <img
                  src={img.preview}
                  alt={`Frame ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  {index > 0 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-6 h-6 text-white"
                      onClick={() => moveImage(index, index - 1)}
                    >
                      <GripVertical className="w-3 h-3" />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-6 h-6 text-white"
                    onClick={() => removeImage(img.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-0.5">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {images.length > 0 && status !== 'success' && (
        <Card className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t('Tools.create-gif.frameDelay')}: {frameDelay}ms</Label>
              <Slider
                value={[frameDelay]}
                onValueChange={([v]) => setFrameDelay(v)}
                min={100}
                max={2000}
                step={100}
                data-testid="slider-delay"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('Tools.create-gif.quality')}: {quality}</Label>
              <Slider
                value={[quality]}
                onValueChange={([v]) => setQuality(v)}
                min={1}
                max={20}
                step={1}
                data-testid="slider-quality"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('Tools.create-gif.width')}: {width}px</Label>
              <Slider
                value={[width]}
                onValueChange={([v]) => setWidth(v)}
                min={100}
                max={800}
                step={50}
                data-testid="slider-width"
              />
            </div>
          </div>

          {status === 'processing' && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">
                {t('Common.processing')} {Math.round(progress)}%
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{t(`Errors.${error.code}`)}</p>
          )}

          <Button
            className="w-full"
            onClick={handleCreateGif}
            disabled={status === 'processing' || images.length < 2}
            data-testid="button-create"
          >
            {status === 'processing' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('Common.processing')}
              </>
            ) : (
              <>
                <Image className="w-4 h-4 mr-2" />
                {t('Tools.create-gif.createButton')}
              </>
            )}
          </Button>
        </Card>
      )}

      {status === 'success' && resultUrl && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{t('Common.success')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('Tools.create-gif.successMessage')}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 space-y-4">
            <div className="flex justify-center">
              <img
                src={resultUrl}
                alt="Generated GIF"
                className="max-w-full max-h-64 rounded-lg border"
                data-testid="img-result"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleDownload} className="flex-1" data-testid="button-download">
                <Download className="w-4 h-4 mr-2" />
                {t('Common.download')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setImages([]);
                  setResultBlob(null);
                  if (resultUrl) URL.revokeObjectURL(resultUrl);
                  setResultUrl('');
                  setStatus('idle');
                }}
                data-testid="button-new"
              >
                {t('Common.processAnother')}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
