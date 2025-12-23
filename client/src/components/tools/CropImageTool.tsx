import { useCallback, useRef, useState, useEffect, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler } from '@/hooks/useFileHandler';
import { useStagedProcessing } from '@/hooks/useStagedProcessing';
import { cropImage } from '@/lib/engines/imageEngine';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StagedLoadingOverlay } from '@/components/StagedLoadingOverlay';
import { FileUploadZone } from '@/components/tool-ui';
import { Download, CheckCircle, Crop, RotateCcw } from 'lucide-react';
import { ShareActions } from '@/components/ShareActions';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DisplayInfo {
  scale: number;
  offsetX: number;
  offsetY: number;
  containerWidth: number;
  containerHeight: number;
}

const ASPECT_PRESETS = [
  { label: 'Free', value: null },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '3:2', value: 3 / 2 },
  { label: '9:16', value: 9 / 16 },
];

export default function CropImageTool() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [displayInfo, setDisplayInfo] = useState<DisplayInfo>({ scale: 1, offsetX: 0, offsetY: 0, containerWidth: 0, containerHeight: 0 });
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialCrop, setInitialCrop] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
  const [dragMode, setDragMode] = useState<'move' | 'resize' | 'create' | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
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
      { name: 'processing', duration: 1400, message: t('Common.stages.croppingImage', { defaultValue: 'Cropping image...' }) },
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

  const clampCropArea = useCallback((area: CropArea): CropArea => {
    const maxW = originalDimensions.width;
    const maxH = originalDimensions.height;
    if (maxW === 0 || maxH === 0) return area;
    
    let { x, y, width, height } = area;
    width = Math.max(20, Math.min(maxW, width));
    height = Math.max(20, Math.min(maxH, height));
    x = Math.max(0, Math.min(maxW - width, x));
    y = Math.max(0, Math.min(maxH - height, y));
    
    return { x, y, width, height };
  }, [originalDimensions]);

  const initializeCropArea = useCallback(() => {
    if (originalDimensions.width > 0 && originalDimensions.height > 0) {
      const padding = Math.min(originalDimensions.width, originalDimensions.height) * 0.1;
      setCropArea({
        x: padding,
        y: padding,
        width: originalDimensions.width - padding * 2,
        height: originalDimensions.height - padding * 2,
      });
    }
  }, [originalDimensions]);

  const updateDisplayInfo = useCallback(() => {
    const container = containerRef.current;
    if (!container || originalDimensions.width === 0) return;
    
    const rect = container.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;
    
    const scale = Math.min(
      containerWidth / originalDimensions.width,
      containerHeight / originalDimensions.height
    );
    
    const scaledWidth = originalDimensions.width * scale;
    const scaledHeight = originalDimensions.height * scale;
    const offsetX = (containerWidth - scaledWidth) / 2;
    const offsetY = (containerHeight - scaledHeight) / 2;
    
    setDisplayInfo({ scale, offsetX, offsetY, containerWidth, containerHeight });
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
      initializeCropArea();
      const timer = setTimeout(updateDisplayInfo, 50);
      window.addEventListener('resize', updateDisplayInfo);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updateDisplayInfo);
      };
    }
  }, [imageLoaded, originalDimensions, initializeCropArea, updateDisplayInfo]);

  const handleFilesFromDropzone = useCallback((fileList: FileList) => {
    addFiles(fileList);
    setShowResults(false);
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

  const handleMouseDown = useCallback((e: MouseEvent<HTMLDivElement>, mode: 'move' | 'resize', handle?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragMode(mode);
    setResizeHandle(handle || null);
    setDragStart(screenToOriginal(e.clientX, e.clientY));
    setInitialCrop({ ...cropArea });
  }, [screenToOriginal, cropArea]);

  const handleContainerMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const pos = screenToOriginal(e.clientX, e.clientY);
    if (pos.x >= cropArea.x && pos.x <= cropArea.x + cropArea.width &&
        pos.y >= cropArea.y && pos.y <= cropArea.y + cropArea.height) {
      return;
    }
    e.preventDefault();
    setIsDragging(true);
    setDragMode('create');
    setDragStart(pos);
    setInitialCrop({ x: pos.x, y: pos.y, width: 0, height: 0 });
    setCropArea({ x: pos.x, y: pos.y, width: 0, height: 0 });
  }, [screenToOriginal, cropArea]);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragMode) return;
    
    const pos = screenToOriginal(e.clientX, e.clientY);
    const deltaX = pos.x - dragStart.x;
    const deltaY = pos.y - dragStart.y;
    
    let newArea = { ...initialCrop };
    
    if (dragMode === 'create') {
      const startX = Math.min(dragStart.x, pos.x);
      const startY = Math.min(dragStart.y, pos.y);
      let width = Math.abs(pos.x - dragStart.x);
      let height = Math.abs(pos.y - dragStart.y);
      
      if (aspectRatio !== null && width > 0) {
        height = width / aspectRatio;
      }
      
      newArea = { x: startX, y: startY, width, height };
    } else if (dragMode === 'move') {
      newArea.x = initialCrop.x + deltaX;
      newArea.y = initialCrop.y + deltaY;
    } else if (dragMode === 'resize' && resizeHandle) {
      if (resizeHandle.includes('e')) {
        newArea.width = initialCrop.width + deltaX;
      }
      if (resizeHandle.includes('w')) {
        const newWidth = initialCrop.width - deltaX;
        if (newWidth >= 20) {
          newArea.x = initialCrop.x + deltaX;
          newArea.width = newWidth;
        }
      }
      if (resizeHandle.includes('s')) {
        newArea.height = initialCrop.height + deltaY;
      }
      if (resizeHandle.includes('n')) {
        const newHeight = initialCrop.height - deltaY;
        if (newHeight >= 20) {
          newArea.y = initialCrop.y + deltaY;
          newArea.height = newHeight;
        }
      }
      
      if (aspectRatio !== null) {
        if (resizeHandle.includes('e') || resizeHandle.includes('w')) {
          newArea.height = newArea.width / aspectRatio;
        } else {
          newArea.width = newArea.height * aspectRatio;
        }
      }
    }
    
    setCropArea(clampCropArea(newArea));
  }, [isDragging, dragMode, dragStart, initialCrop, resizeHandle, aspectRatio, clampCropArea, screenToOriginal]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragMode(null);
    setResizeHandle(null);
  }, []);

  const resetCropArea = useCallback(() => {
    initializeCropArea();
    setAspectRatio(null);
  }, [initializeCropArea]);

  const handleAspectRatioChange = useCallback((value: number | null) => {
    setAspectRatio(value);
    if (value !== null && cropArea.width > 0) {
      const newHeight = cropArea.width / value;
      setCropArea(prev => clampCropArea({ ...prev, height: newHeight }));
    }
  }, [cropArea.width, clampCropArea]);

  const handleCrop = useCallback(async () => {
    if (!files[0]?.previewUrl || cropArea.width <= 0 || cropArea.height <= 0) return;

    const finalCrop = {
      x: Math.round(Math.max(0, cropArea.x)),
      y: Math.round(Math.max(0, cropArea.y)),
      width: Math.round(Math.max(1, cropArea.width)),
      height: Math.round(Math.max(1, cropArea.height)),
    };

    setError(null);
    setShowResults(false);

    try {
      await stagedProcessing.runStagedProcessing(async () => {
        const blob = await cropImage(
          files[0].previewUrl!,
          finalCrop.x,
          finalCrop.y,
          finalCrop.width,
          finalCrop.height,
          files[0].file.type.includes('png') ? 'png' : 'jpg'
        );
        setResult(blob);
        return blob;
      });
      setShowResults(true);
    } catch {
      setError({ code: 'CROP_FAILED' });
    }
  }, [files, cropArea, setError, setResult, stagedProcessing]);

  const handleDownload = useCallback(() => {
    const ext = files[0]?.file.type.includes('png') ? 'png' : 'jpg';
    downloadResult(`unitools_cropped.${ext}`);
  }, [files, downloadResult]);

  const reset = useCallback(() => {
    resetHandler();
    stagedProcessing.reset();
    setShowResults(false);
    setCropArea({ x: 0, y: 0, width: 0, height: 0 });
    setOriginalDimensions({ width: 0, height: 0 });
    setImageLoaded(false);
  }, [resetHandler, stagedProcessing]);

  const displayCrop = {
    x: displayInfo.offsetX + cropArea.x * displayInfo.scale,
    y: displayInfo.offsetY + cropArea.y * displayInfo.scale,
    width: cropArea.width * displayInfo.scale,
    height: cropArea.height * displayInfo.scale,
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground" data-testid="text-instructions">
        {t('Tools.crop-image.description')}
      </div>

      {!stagedProcessing.isProcessing && !showResults && files.length === 0 && (
        <FileUploadZone
          onFileSelect={handleFilesFromDropzone}
          accept="image/*"
        />
      )}

      {!stagedProcessing.isProcessing && !showResults && files.length > 0 && imageLoaded && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
              <div className="flex gap-2 flex-wrap">
                {ASPECT_PRESETS.map((preset) => (
                  <Button
                    key={preset.label}
                    variant={aspectRatio === preset.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleAspectRatioChange(preset.value)}
                    data-testid={`button-aspect-${preset.label}`}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={resetCropArea} data-testid="button-reset-crop">
                <RotateCcw className="w-4 h-4 mr-2" />
                {t('Common.actions.reset')}
              </Button>
            </div>
            
            <div 
              ref={containerRef}
              className="relative select-none bg-muted rounded overflow-hidden cursor-crosshair"
              style={{ height: 400 }}
              onMouseDown={handleContainerMouseDown}
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
              
              {cropArea.width > 0 && cropArea.height > 0 && displayInfo.scale > 0 && (
                <>
                  <div 
                    className="absolute bg-black/50 pointer-events-none"
                    style={{
                      left: displayInfo.offsetX,
                      top: displayInfo.offsetY,
                      width: originalDimensions.width * displayInfo.scale,
                      height: originalDimensions.height * displayInfo.scale,
                      clipPath: `polygon(
                        0 0, 100% 0, 100% 100%, 0 100%, 0 0,
                        ${cropArea.x * displayInfo.scale}px ${cropArea.y * displayInfo.scale}px,
                        ${cropArea.x * displayInfo.scale}px ${(cropArea.y + cropArea.height) * displayInfo.scale}px,
                        ${(cropArea.x + cropArea.width) * displayInfo.scale}px ${(cropArea.y + cropArea.height) * displayInfo.scale}px,
                        ${(cropArea.x + cropArea.width) * displayInfo.scale}px ${cropArea.y * displayInfo.scale}px,
                        ${cropArea.x * displayInfo.scale}px ${cropArea.y * displayInfo.scale}px
                      )`,
                    }}
                  />
                  
                  <div
                    className="absolute border-2 border-primary cursor-move"
                    style={{
                      left: displayCrop.x,
                      top: displayCrop.y,
                      width: displayCrop.width,
                      height: displayCrop.height,
                    }}
                    onMouseDown={(e) => handleMouseDown(e, 'move')}
                  >
                    {['nw', 'ne', 'sw', 'se'].map((handle) => (
                      <div
                        key={handle}
                        className="absolute w-4 h-4 bg-primary border-2 border-white rounded-sm"
                        style={{
                          left: handle.includes('w') ? -8 : 'auto',
                          right: handle.includes('e') ? -8 : 'auto',
                          top: handle.includes('n') ? -8 : 'auto',
                          bottom: handle.includes('s') ? -8 : 'auto',
                          cursor: handle === 'nw' || handle === 'se' ? 'nwse-resize' : 'nesw-resize',
                        }}
                        onMouseDown={(e) => handleMouseDown(e, 'resize', handle)}
                      />
                    ))}
                    
                    {['n', 's', 'e', 'w'].map((handle) => (
                      <div
                        key={handle}
                        className="absolute bg-primary"
                        style={{
                          left: handle === 'n' || handle === 's' ? '50%' : handle === 'w' ? -4 : 'auto',
                          right: handle === 'e' ? -4 : 'auto',
                          top: handle === 'e' || handle === 'w' ? '50%' : handle === 'n' ? -4 : 'auto',
                          bottom: handle === 's' ? -4 : 'auto',
                          width: handle === 'n' || handle === 's' ? 24 : 4,
                          height: handle === 'e' || handle === 'w' ? 24 : 4,
                          transform: handle === 'n' || handle === 's' ? 'translateX(-50%)' : 'translateY(-50%)',
                          cursor: handle === 'n' || handle === 's' ? 'ns-resize' : 'ew-resize',
                        }}
                        onMouseDown={(e) => handleMouseDown(e, 'resize', handle)}
                      />
                    ))}
                    
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap">
                      {Math.round(cropArea.width)} x {Math.round(cropArea.height)}
                    </div>
                  </div>
                </>
              )}
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
                    className="max-w-full max-h-80 object-contain"
                  />
                </div>
              )}
              <p className="text-sm text-muted-foreground">{Math.round(cropArea.width)} x {Math.round(cropArea.height)} px</p>
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
