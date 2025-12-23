import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUploadZone } from '@/components/tool-ui';
import { StagedLoadingOverlay } from '@/components/StagedLoadingOverlay';
import { useStagedProcessing } from '@/hooks/useStagedProcessing';
import { ShareActions } from '@/components/ShareActions';
import { Download, CheckCircle, Trash2, ArrowUp, ArrowDown, Layers } from 'lucide-react';

interface ImageItem {
  id: string;
  file: File;
  preview: string;
  width: number;
  height: number;
}

type LayoutDirection = 'horizontal' | 'vertical' | 'grid-2' | 'grid-3';

export default function ImageJoinerTool() {
  const { t } = useTranslation();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [direction, setDirection] = useState<LayoutDirection>('horizontal');
  const [gap, setGap] = useState([0]);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [showResults, setShowResults] = useState(false);

  const stagedProcessing = useStagedProcessing({
    minDuration: 3000,
    stages: [
      { name: 'analyzing', duration: 800, message: t('Common.stages.analyzingFiles', { defaultValue: 'Analyzing images...' }) },
      { name: 'processing', duration: 1400, message: t('Common.stages.combiningImages', { defaultValue: 'Combining images...' }) },
      { name: 'optimizing', duration: 800, message: t('Common.stages.optimizingOutput', { defaultValue: 'Optimizing output...' }) },
    ],
  });

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const handleFilesFromDropzone = useCallback(async (fileList: FileList) => {
    const imageFiles = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    const newImages: ImageItem[] = [];

    for (const file of imageFiles) {
      const preview = URL.createObjectURL(file);
      const img = await loadImage(preview);
      newImages.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview,
        width: img.width,
        height: img.height,
      });
    }

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

  const moveImage = (index: number, dir: 'up' | 'down') => {
    const newIndex = dir === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;
    setImages(prev => {
      const newImages = [...prev];
      [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
      return newImages;
    });
  };

  const handleJoin = useCallback(async () => {
    if (images.length < 2) return;
    setShowResults(false);

    try {
      await stagedProcessing.runStagedProcessing(async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas not available');

        const gapSize = gap[0];
        const loadedImages = await Promise.all(images.map(img => loadImage(img.preview)));

        let totalWidth = 0;
        let totalHeight = 0;
        const maxWidth = Math.max(...loadedImages.map(i => i.width));
        const maxHeight = Math.max(...loadedImages.map(i => i.height));

        if (direction === 'horizontal') {
          totalWidth = loadedImages.reduce((sum, img) => sum + img.width, 0) + gapSize * (loadedImages.length - 1);
          totalHeight = maxHeight;
        } else if (direction === 'vertical') {
          totalWidth = maxWidth;
          totalHeight = loadedImages.reduce((sum, img) => sum + img.height, 0) + gapSize * (loadedImages.length - 1);
        } else {
          const cols = direction === 'grid-2' ? 2 : 3;
          const rows = Math.ceil(loadedImages.length / cols);
          totalWidth = cols * maxWidth + gapSize * (cols - 1);
          totalHeight = rows * maxHeight + gapSize * (rows - 1);
        }

        canvas.width = totalWidth;
        canvas.height = totalHeight;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, totalWidth, totalHeight);

        if (direction === 'horizontal') {
          let x = 0;
          for (const img of loadedImages) {
            const y = Math.floor((maxHeight - img.height) / 2);
            ctx.drawImage(img, x, y);
            x += img.width + gapSize;
          }
        } else if (direction === 'vertical') {
          let y = 0;
          for (const img of loadedImages) {
            const x = Math.floor((maxWidth - img.width) / 2);
            ctx.drawImage(img, x, y);
            y += img.height + gapSize;
          }
        } else {
          const cols = direction === 'grid-2' ? 2 : 3;
          loadedImages.forEach((img, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = col * (maxWidth + gapSize) + Math.floor((maxWidth - img.width) / 2);
            const y = row * (maxHeight + gapSize) + Math.floor((maxHeight - img.height) / 2);
            ctx.drawImage(img, x, y);
          });
        }

        return new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(blob => {
            if (blob) {
              setResultBlob(blob);
              if (resultUrl) URL.revokeObjectURL(resultUrl);
              const url = URL.createObjectURL(blob);
              setResultUrl(url);
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          }, 'image/png');
        });
      });
      setShowResults(true);
    } catch (err) {
      console.error('Image join error:', err);
    }
  }, [images, direction, gap, resultUrl, stagedProcessing]);

  const handleDownload = () => {
    if (!resultBlob) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'unitools_joined.png';
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
      <div className="text-sm text-muted-foreground">{t('Tools.image-joiner.description')}</div>

      {!stagedProcessing.isProcessing && !showResults && (
        <>
          <FileUploadZone onFileSelect={handleFilesFromDropzone} accept="image/*" multiple />

          {images.length > 0 && (
            <Card className="p-4 space-y-4">
              <Label>{t('Tools.image-joiner.imageOrder', { defaultValue: 'Image Order' })} ({images.length})</Label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {images.map((img, index) => (
                  <div key={img.id} className="relative group aspect-square rounded-md overflow-hidden border bg-muted">
                    <img src={img.preview} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
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
                  <Label>{t('Tools.image-joiner.layout', { defaultValue: 'Layout' })}</Label>
                  <Select value={direction} onValueChange={(v) => setDirection(v as LayoutDirection)}>
                    <SelectTrigger data-testid="select-direction">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="horizontal">{t('Tools.image-joiner.horizontal', { defaultValue: 'Horizontal' })}</SelectItem>
                      <SelectItem value="vertical">{t('Tools.image-joiner.vertical', { defaultValue: 'Vertical' })}</SelectItem>
                      <SelectItem value="grid-2">{t('Tools.image-joiner.grid2', { defaultValue: '2-Column Grid' })}</SelectItem>
                      <SelectItem value="grid-3">{t('Tools.image-joiner.grid3', { defaultValue: '3-Column Grid' })}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('Tools.image-joiner.gap', { defaultValue: 'Gap' })}: {gap[0]}px</Label>
                  <Slider value={gap} onValueChange={setGap} min={0} max={50} step={5} data-testid="slider-gap" />
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="flex-1" onClick={handleJoin} disabled={images.length < 2} data-testid="button-join">
                  <Layers className="w-4 h-4 mr-2" />
                  {t('Tools.image-joiner.joinButton', { defaultValue: 'Join Images' })}
                </Button>
                <Button variant="outline" onClick={reset}>{t('Common.workflow.startOver')}</Button>
              </div>
              {images.length < 2 && (
                <p className="text-sm text-muted-foreground text-center">{t('Tools.image-joiner.minImages', { defaultValue: 'Add at least 2 images to join' })}</p>
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
              <div className="w-full flex justify-center p-4 bg-muted rounded overflow-auto">
                <img src={resultUrl} alt="Joined" className="max-w-full max-h-96 object-contain" data-testid="img-result" />
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
