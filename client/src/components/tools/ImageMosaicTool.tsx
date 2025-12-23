import { useCallback, useState, useRef, useEffect, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler } from '@/hooks/useFileHandler';
import { useStagedProcessing } from '@/hooks/useStagedProcessing';
import { applyMosaic } from '@/lib/engines/imageEngine';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { StagedLoadingOverlay } from '@/components/StagedLoadingOverlay';
import { FileUploadZone } from '@/components/tool-ui';
import { Download, CheckCircle, Grid3X3, RotateCcw } from 'lucide-react';
import { ShareActions } from '@/components/ShareActions';

interface MosaicArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DisplayInfo {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export default function ImageMosaicTool() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [displayInfo, setDisplayInfo] = useState<DisplayInfo>({ scale: 1, offsetX: 0, offsetY: 0 });
  const [mosaicAreas, setMosaicAreas] = useState<MosaicArea[]>([]);
  const [currentArea, setCurrentArea] = useState<MosaicArea | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pixelSize, setPixelSize] = useState([20]);
  const [showResults, setShowResults] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
      { name: 'analyzing', duration: 800, message: t('Common.stages.analyzingFiles', { defaultValue: 'Analyzing image...' }) },
      { name: 'processing', duration: 1400, message: t('Common.stages.applyingMosaic', { defaultValue: 'Applying mosaic effect...' }) },
      { name: 'optimizing', duration: 800, message: t('Common.stages.optimizingOutput', { defaultValue: 'Optimizing output...' }) },
    ],
  });

  useEffect(() => {
    if (resultBlob) {
      const url = URL.createObjectURL(resultBlob);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    return undefined;
  }, [resultBlob]);

  const updateDisplayInfo = useCallback(() => {
    const container = containerRef.current;
    if (!container || originalDimensions.width === 0) return;
    
    const rect = container.getBoundingClientRect();
    const scale = Math.min(rect.width / originalDimensions.width, rect.height / originalDimensions.height);
    const scaledWidth = originalDimensions.width * scale;
    const scaledHeight = originalDimensions.height * scale;
    
    setDisplayInfo({
      scale,
      offsetX: (rect.width - scaledWidth) / 2,
      offsetY: (rect.height - scaledHeight) / 2,
    });
  }, [originalDimensions]);

  useEffect(() => {
    if (files.length > 0 && files[0].previewUrl) {
      setImageLoaded(false);
      const img = new window.Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
        setImageLoaded(true);
      };
      img.src = files[0].previewUrl;
    }
  }, [files]);

  useEffect(() => {
    if (imageLoaded && originalDimensions.width > 0) {
      const timer = setTimeout(updateDisplayInfo, 50);
      window.addEventListener('resize', updateDisplayInfo);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updateDisplayInfo);
      };
    }
  }, [imageLoaded, originalDimensions, updateDisplayInfo]);

  const handleFilesFromDropzone = useCallback((fileList: FileList) => {
    addFiles(fileList);
    setShowResults(false);
    setMosaicAreas([]);
  }, [addFiles]);

  const screenToOriginal = useCallback((screenX: number, screenY: number): { x: number; y: number } => {
    const container = containerRef.current;
    if (!container || displayInfo.scale === 0) return { x: 0, y: 0 };
    
    const rect = container.getBoundingClientRect();
    const relX = screenX - rect.left - displayInfo.offsetX;
    const relY = screenY - rect.top - displayInfo.offsetY;
    
    return {
      x: Math.max(0, Math.min(originalDimensions.width, relX / displayInfo.scale)),
      y: Math.max(0, Math.min(originalDimensions.height, relY / displayInfo.scale)),
    };
  }, [displayInfo, originalDimensions]);

  const handleMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pos = screenToOriginal(e.clientX, e.clientY);
    setIsDragging(true);
    setDragStart(pos);
    setCurrentArea({ x: pos.x, y: pos.y, width: 0, height: 0 });
  }, [screenToOriginal]);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const pos = screenToOriginal(e.clientX, e.clientY);
    
    const startX = Math.min(dragStart.x, pos.x);
    const startY = Math.min(dragStart.y, pos.y);
    const width = Math.abs(pos.x - dragStart.x);
    const height = Math.abs(pos.y - dragStart.y);
    
    setCurrentArea({ x: startX, y: startY, width, height });
  }, [isDragging, dragStart, screenToOriginal]);

  const handleMouseUp = useCallback(() => {
    if (currentArea && currentArea.width > 10 && currentArea.height > 10) {
      setMosaicAreas(prev => [...prev, currentArea]);
    }
    setIsDragging(false);
    setCurrentArea(null);
  }, [currentArea]);

  const handleApply = useCallback(async () => {
    if (!files[0]?.previewUrl || mosaicAreas.length === 0) return;

    setError(null);
    setShowResults(false);

    try {
      await stagedProcessing.runStagedProcessing(async () => {
        let currentUrl = files[0].previewUrl!;
        const format = files[0].file.type.includes('png') ? 'png' : 'jpg';
        
        for (const area of mosaicAreas) {
          const blob = await applyMosaic(
            currentUrl,
            Math.round(area.x),
            Math.round(area.y),
            Math.round(area.width),
            Math.round(area.height),
            pixelSize[0],
            format
          );
          if (currentUrl !== files[0].previewUrl) {
            URL.revokeObjectURL(currentUrl);
          }
          currentUrl = URL.createObjectURL(blob);
        }
        
        const response = await fetch(currentUrl);
        const finalBlob = await response.blob();
        URL.revokeObjectURL(currentUrl);
        
        setResult(finalBlob);
        return finalBlob;
      });
      setShowResults(true);
    } catch {
      setError({ code: 'MOSAIC_FAILED' });
    }
  }, [files, mosaicAreas, pixelSize, setError, setResult, stagedProcessing]);

  const handleDownload = useCallback(() => {
    const ext = files[0]?.file.type.includes('png') ? 'png' : 'jpg';
    downloadResult(`unitools_mosaic.${ext}`);
  }, [files, downloadResult]);

  const reset = useCallback(() => {
    resetHandler();
    stagedProcessing.reset();
    setShowResults(false);
    setMosaicAreas([]);
    setOriginalDimensions({ width: 0, height: 0 });
    setImageLoaded(false);
  }, [resetHandler, stagedProcessing]);

  const clearAreas = useCallback(() => {
    setMosaicAreas([]);
  }, []);

  const allAreas = currentArea ? [...mosaicAreas, currentArea] : mosaicAreas;

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground" data-testid="text-instructions">
        {t('Tools.image-mosaic.description')}
      </div>

      {!stagedProcessing.isProcessing && !showResults && files.length === 0 && (
        <FileUploadZone onFileSelect={handleFilesFromDropzone} accept="image/*" />
      )}

      {!stagedProcessing.isProcessing && !showResults && files.length > 0 && imageLoaded && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
              <div className="flex items-center gap-4 flex-1 min-w-[200px]">
                <Label className="whitespace-nowrap">{t('Common.labels.pixelSize', { defaultValue: 'Pixel Size' })}: {pixelSize[0]}px</Label>
                <Slider
                  value={pixelSize}
                  onValueChange={setPixelSize}
                  min={5}
                  max={50}
                  step={1}
                  className="flex-1"
                  data-testid="slider-pixel-size"
                />
              </div>
              <Button variant="ghost" size="sm" onClick={clearAreas} disabled={mosaicAreas.length === 0} data-testid="button-clear-areas">
                <RotateCcw className="w-4 h-4 mr-2" />
                {t('Common.actions.clear')}
              </Button>
            </div>

            <div className="text-sm text-muted-foreground mb-2">
              {t('Common.labels.dragToSelect', { defaultValue: 'Drag on the image to select areas to pixelate' })}
              {mosaicAreas.length > 0 && ` (${mosaicAreas.length} ${t('Common.labels.areasSelected', { defaultValue: 'areas selected' })})`}
            </div>
            
            <div 
              ref={containerRef}
              className="relative select-none bg-muted rounded overflow-hidden cursor-crosshair"
              style={{ height: 400 }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {files[0].previewUrl && (
                <img 
                  src={files[0].previewUrl} 
                  alt="Original"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                  draggable={false}
                  onLoad={updateDisplayInfo}
                />
              )}
              
              {allAreas.map((area, index) => (
                <div
                  key={index}
                  className="absolute border-2 border-primary bg-primary/20 pointer-events-none"
                  style={{
                    left: displayInfo.offsetX + area.x * displayInfo.scale,
                    top: displayInfo.offsetY + area.y * displayInfo.scale,
                    width: area.width * displayInfo.scale,
                    height: area.height * displayInfo.scale,
                  }}
                >
                  <Grid3X3 className="w-4 h-4 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
              ))}
            </div>
          </Card>

          <div className="flex gap-3">
            <Button onClick={handleApply} className="flex-1" disabled={mosaicAreas.length === 0} data-testid="button-apply">
              <Grid3X3 className="w-4 h-4 mr-2" />
              {t('Common.actions.apply')}
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
                  <img src={previewUrl} alt="Result" className="max-w-full max-h-80 object-contain" />
                </div>
              )}
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
