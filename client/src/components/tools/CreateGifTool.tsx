import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { FileUploadZone } from '@/components/tool-ui';
import { StagedLoadingOverlay } from '@/components/StagedLoadingOverlay';
import { useStagedProcessing } from '@/hooks/useStagedProcessing';
import { ShareActions } from '@/components/ShareActions';
import { Image, Download, CheckCircle, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface ImageItem {
  id: string;
  file: File;
  preview: string;
}

export default function CreateGifTool() {
  const { t } = useTranslation();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [frameDelay, setFrameDelay] = useState([500]);
  const [width, setWidth] = useState([400]);
  const [showResults, setShowResults] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stagedProcessing = useStagedProcessing({
    minDuration: 3000,
    stages: [
      { name: 'analyzing', duration: 1000, message: t('Common.stages.loadingImages', { defaultValue: 'Loading images...' }) },
      { name: 'processing', duration: 1500, message: t('Common.stages.encodingGif', { defaultValue: 'Encoding GIF...' }) },
      { name: 'optimizing', duration: 500, message: t('Common.stages.optimizingOutput', { defaultValue: 'Optimizing output...' }) },
    ],
  });

  const handleFilesFromDropzone = useCallback((fileList: FileList) => {
    const imageFiles = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    const newImages = imageFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages(prev => [...prev, ...newImages]);
    setShowResults(false);
    setResultBlob(null);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl('');
  }, [resultUrl]);

  const removeImage = (id: string) => {
    setImages(prev => {
      const item = prev.find(img => img.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter(img => img.id !== id);
    });
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;
    setImages(prev => {
      const newImages = [...prev];
      [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
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

  const handleCreateGif = useCallback(async () => {
    if (images.length < 2) return;
    setShowResults(false);

    try {
      await stagedProcessing.runStagedProcessing(async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas not available');

        const firstImg = await loadImage(images[0].preview);
        const aspectRatio = firstImg.height / firstImg.width;
        const targetWidth = width[0];
        const targetHeight = Math.round(targetWidth * aspectRatio);

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const frames: string[] = [];
        for (const img of images) {
          const loadedImg = await loadImage(img.preview);
          ctx.clearRect(0, 0, targetWidth, targetHeight);
          ctx.drawImage(loadedImg, 0, 0, targetWidth, targetHeight);
          frames.push(canvas.toDataURL('image/png'));
        }

        const gifBlob = await createAnimatedGif(frames, targetWidth, targetHeight, frameDelay[0]);
        setResultBlob(gifBlob);
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        const url = URL.createObjectURL(gifBlob);
        setResultUrl(url);
        return gifBlob;
      });
      setShowResults(true);
    } catch (err) {
      console.error('GIF creation error:', err);
    }
  }, [images, width, frameDelay, resultUrl, stagedProcessing]);

  const handleDownload = () => {
    if (!resultBlob) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'unitools_animation.gif';
    a.click();
  };

  const reset = useCallback(() => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    setResultBlob(null);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl('');
    setShowResults(false);
    stagedProcessing.reset();
  }, [images, resultUrl, stagedProcessing]);

  useEffect(() => {
    return () => {
      images.forEach(img => URL.revokeObjectURL(img.preview));
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">{t('Tools.create-gif.description')}</div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {!stagedProcessing.isProcessing && !showResults && (
        <>
          <FileUploadZone onFileSelect={handleFilesFromDropzone} accept="image/*" multiple />

          {images.length > 0 && (
            <Card className="p-4 space-y-4">
              <Label>{t('Tools.create-gif.imageOrder', { defaultValue: 'Frame Order' })} ({images.length} {t('Tools.create-gif.images', { defaultValue: 'images' })})</Label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {images.map((img, index) => (
                  <div key={img.id} className="relative group aspect-square rounded-md overflow-hidden border bg-muted">
                    <img src={img.preview} alt={`Frame ${index + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      {index > 0 && (
                        <Button size="icon" variant="ghost" className="text-white" onClick={() => moveImage(index, 'up')}>
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                      )}
                      {index < images.length - 1 && (
                        <Button size="icon" variant="ghost" className="text-white" onClick={() => moveImage(index, 'down')}>
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" className="text-white" onClick={() => removeImage(img.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-0.5">{index + 1}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {images.length > 0 && (
            <Card className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('Tools.create-gif.frameDelay', { defaultValue: 'Frame Delay' })}: {frameDelay[0]}ms</Label>
                  <Slider value={frameDelay} onValueChange={setFrameDelay} min={100} max={2000} step={100} data-testid="slider-delay" />
                </div>
                <div className="space-y-2">
                  <Label>{t('Tools.create-gif.width', { defaultValue: 'Width' })}: {width[0]}px</Label>
                  <Slider value={width} onValueChange={setWidth} min={100} max={800} step={50} data-testid="slider-width" />
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="flex-1" onClick={handleCreateGif} disabled={images.length < 2} data-testid="button-create">
                  <Image className="w-4 h-4 mr-2" />
                  {t('Tools.create-gif.createButton', { defaultValue: 'Create GIF' })}
                </Button>
                <Button variant="outline" onClick={reset}>{t('Common.workflow.startOver')}</Button>
              </div>
              {images.length < 2 && (
                <p className="text-sm text-muted-foreground text-center">{t('Tools.create-gif.minImages', { defaultValue: 'Add at least 2 images to create a GIF' })}</p>
              )}
            </Card>
          )}
        </>
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
              <div className="w-full flex justify-center p-4 bg-muted rounded">
                <img src={resultUrl} alt="Generated GIF" className="max-w-full max-h-80 rounded-lg" data-testid="img-result" />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleDownload} data-testid="button-download">
                  <Download className="w-4 h-4 mr-2" />
                  {t('Common.workflow.download')}
                </Button>
                <Button variant="outline" onClick={reset}>{t('Common.workflow.startOver')}</Button>
              </div>
            </div>
          </Card>
          <ShareActions />
        </div>
      )}
    </div>
  );
}

async function createAnimatedGif(frames: string[], width: number, height: number, delay: number): Promise<Blob> {
  const loadedFrames: ImageData[] = [];
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  for (const frame of frames) {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = document.createElement('img');
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = frame;
    });
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    loadedFrames.push(ctx.getImageData(0, 0, width, height));
  }

  const gif = encodeGif(loadedFrames, width, height, delay);
  return new Blob([gif], { type: 'image/gif' });
}

function encodeGif(frames: ImageData[], width: number, height: number, delay: number): Uint8Array {
  const delayCs = Math.round(delay / 10);
  const chunks: number[] = [];

  chunks.push(0x47, 0x49, 0x46, 0x38, 0x39, 0x61);

  chunks.push(width & 0xff, (width >> 8) & 0xff);
  chunks.push(height & 0xff, (height >> 8) & 0xff);
  chunks.push(0xf7, 0x00, 0x00);

  for (let i = 0; i < 256; i++) {
    chunks.push(i, i, i);
  }

  chunks.push(0x21, 0xff, 0x0b);
  const netscape = 'NETSCAPE2.0';
  for (let i = 0; i < netscape.length; i++) chunks.push(netscape.charCodeAt(i));
  chunks.push(0x03, 0x01, 0x00, 0x00, 0x00);

  for (const frame of frames) {
    chunks.push(0x21, 0xf9, 0x04, 0x04);
    chunks.push(delayCs & 0xff, (delayCs >> 8) & 0xff);
    chunks.push(0x00, 0x00);

    chunks.push(0x2c);
    chunks.push(0x00, 0x00, 0x00, 0x00);
    chunks.push(width & 0xff, (width >> 8) & 0xff);
    chunks.push(height & 0xff, (height >> 8) & 0xff);
    chunks.push(0x00);

    const minCodeSize = 8;
    chunks.push(minCodeSize);

    const pixels: number[] = [];
    for (let i = 0; i < frame.data.length; i += 4) {
      const r = frame.data[i];
      const g = frame.data[i + 1];
      const b = frame.data[i + 2];
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      pixels.push(gray);
    }

    const lzwData = lzwEncode(pixels, minCodeSize);
    let offset = 0;
    while (offset < lzwData.length) {
      const chunkSize = Math.min(255, lzwData.length - offset);
      chunks.push(chunkSize);
      for (let i = 0; i < chunkSize; i++) {
        chunks.push(lzwData[offset + i]);
      }
      offset += chunkSize;
    }
    chunks.push(0x00);
  }

  chunks.push(0x3b);
  return new Uint8Array(chunks);
}

function lzwEncode(pixels: number[], minCodeSize: number): number[] {
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;

  let codeSize = minCodeSize + 1;
  let nextCode = eoiCode + 1;
  const maxCode = 4096;

  const dictionary = new Map<string, number>();
  for (let i = 0; i < clearCode; i++) {
    dictionary.set(String(i), i);
  }

  const output: number[] = [];
  let buffer = 0;
  let bufferLength = 0;

  const emit = (code: number) => {
    buffer |= code << bufferLength;
    bufferLength += codeSize;
    while (bufferLength >= 8) {
      output.push(buffer & 0xff);
      buffer >>= 8;
      bufferLength -= 8;
    }
  };

  emit(clearCode);

  let current = '';
  for (const pixel of pixels) {
    const next = current + ',' + pixel;
    if (dictionary.has(next)) {
      current = next;
    } else {
      emit(dictionary.get(current)!);
      if (nextCode < maxCode) {
        dictionary.set(next, nextCode++);
        if (nextCode > (1 << codeSize) && codeSize < 12) {
          codeSize++;
        }
      }
      current = String(pixel);
    }
  }

  if (current) {
    emit(dictionary.get(current)!);
  }
  emit(eoiCode);

  if (bufferLength > 0) {
    output.push(buffer & 0xff);
  }

  return output;
}
