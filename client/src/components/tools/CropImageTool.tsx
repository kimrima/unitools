import { useCallback, useRef, useState, useEffect, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler } from '@/hooks/useFileHandler';
import { useStagedProcessing } from '@/hooks/useStagedProcessing';
import { cropImage } from '@/lib/engines/imageEngine';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StagedLoadingOverlay } from '@/components/StagedLoadingOverlay';
import { Upload, Download, CheckCircle, Crop, RotateCcw } from 'lucide-react';
import { AdSlot } from '@/components/AdSlot';
import { ShareActions } from '@/components/ShareActions';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [displayDimensions, setDisplayDimensions] = useState({ width: 0, height: 0 });
  const [displayScale, setDisplayScale] = useState(1);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOrigin, setDragOrigin] = useState({ x: 0, y: 0 });
  const [initialCropArea, setInitialCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
  const [dragMode, setDragMode] = useState<'move' | 'resize' | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
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

  const realCropArea = {
    x: Math.max(0, Math.round(cropArea.x / displayScale)),
    y: Math.max(0, Math.round(cropArea.y / displayScale)),
    width: Math.max(1, Math.round(cropArea.width / displayScale)),
    height: Math.max(1, Math.round(cropArea.height / displayScale)),
  };

  const clampCropArea = useCallback((area: CropArea, maxWidth: number, maxHeight: number): CropArea => {
    let { x, y, width, height } = area;
    
    width = Math.max(50, Math.min(maxWidth, width));
    height = Math.max(50, Math.min(maxHeight, height));
    x = Math.max(0, Math.min(maxWidth - width, x));
    y = Math.max(0, Math.min(maxHeight - height, y));
    
    return { x, y, width, height };
  }, []);

  const initializeCropArea = useCallback((imgWidth: number, imgHeight: number) => {
    const padding = Math.min(40, imgWidth * 0.1, imgHeight * 0.1);
    setCropArea({
      x: padding,
      y: padding,
      width: imgWidth - padding * 2,
      height: imgHeight - padding * 2,
    });
  }, []);

  useEffect(() => {
    if (files.length > 0 && files[0].previewUrl) {
      const img = new window.Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
      };
      img.src = files[0].previewUrl;
    }
  }, [files]);

  useEffect(() => {
    if (imageRef.current && originalDimensions.width > 0) {
      const updateDimensions = () => {
        const img = imageRef.current;
        if (img) {
          const rect = img.getBoundingClientRect();
          const scale = rect.width / originalDimensions.width;
          setDisplayScale(scale);
          setDisplayDimensions({ width: rect.width, height: rect.height });
          initializeCropArea(rect.width, rect.height);
        }
      };
      
      const timer = setTimeout(updateDimensions, 100);
      window.addEventListener('resize', updateDimensions);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updateDimensions);
      };
    }
  }, [originalDimensions, initializeCropArea]);

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

  const getMousePosition = (e: MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>, mode: 'move' | 'resize', handle?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragMode(mode);
    setResizeHandle(handle || null);
    const pos = getMousePosition(e);
    setDragOrigin(pos);
    setInitialCropArea({ ...cropArea });
  };

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragMode) return;

    const pos = getMousePosition(e);
    const deltaX = pos.x - dragOrigin.x;
    const deltaY = pos.y - dragOrigin.y;
    
    const maxWidth = displayDimensions.width;
    const maxHeight = displayDimensions.height;

    let newArea = { ...initialCropArea };

    if (dragMode === 'move') {
      newArea.x = initialCropArea.x + deltaX;
      newArea.y = initialCropArea.y + deltaY;
    } else if (dragMode === 'resize' && resizeHandle) {
      if (resizeHandle.includes('e')) {
        newArea.width = initialCropArea.width + deltaX;
      }
      if (resizeHandle.includes('w')) {
        const newWidth = initialCropArea.width - deltaX;
        if (newWidth >= 50) {
          newArea.x = initialCropArea.x + deltaX;
          newArea.width = newWidth;
        }
      }
      if (resizeHandle.includes('s')) {
        newArea.height = initialCropArea.height + deltaY;
      }
      if (resizeHandle.includes('n')) {
        const newHeight = initialCropArea.height - deltaY;
        if (newHeight >= 50) {
          newArea.y = initialCropArea.y + deltaY;
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
    
    setCropArea(clampCropArea(newArea, maxWidth, maxHeight));
  }, [isDragging, dragMode, dragOrigin, initialCropArea, resizeHandle, aspectRatio, displayDimensions, clampCropArea]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragMode(null);
    setResizeHandle(null);
  }, []);

  const resetCropArea = useCallback(() => {
    initializeCropArea(displayDimensions.width, displayDimensions.height);
    setAspectRatio(null);
  }, [displayDimensions, initializeCropArea]);

  const handleCrop = useCallback(async () => {
    if (!files[0]?.previewUrl || realCropArea.width <= 0 || realCropArea.height <= 0) return;

    setError(null);
    setShowResults(false);

    try {
      await stagedProcessing.runStagedProcessing(async () => {
        const blob = await cropImage(
          files[0].previewUrl!,
          realCropArea.x,
          realCropArea.y,
          realCropArea.width,
          realCropArea.height,
          files[0].file.type.includes('png') ? 'png' : 'jpg'
        );
        setResult(blob);
        return blob;
      });
      setShowResults(true);
    } catch {
      setError({ code: 'CROP_FAILED' });
    }
  }, [files, realCropArea, setError, setResult, stagedProcessing]);

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
    setDisplayDimensions({ width: 0, height: 0 });
  }, [resetHandler, stagedProcessing]);

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

      {!stagedProcessing.isProcessing && !showResults && files.length === 0 && (
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

      {!stagedProcessing.isProcessing && !showResults && files.length > 0 && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
              <div className="flex gap-2 flex-wrap">
                {ASPECT_PRESETS.map((preset) => (
                  <Button
                    key={preset.label}
                    variant={aspectRatio === preset.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAspectRatio(preset.value)}
                    data-testid={`button-aspect-${preset.label}`}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={resetCropArea}>
                <RotateCcw className="w-4 h-4 mr-2" />
                {t('Common.actions.reset')}
              </Button>
            </div>
            
            <div 
              ref={containerRef}
              className="relative select-none bg-muted rounded overflow-hidden inline-block w-full"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {files[0].previewUrl && (
                <img 
                  ref={imageRef}
                  src={files[0].previewUrl} 
                  alt="Original"
                  className="w-full h-auto max-h-96 object-contain pointer-events-none"
                  draggable={false}
                />
              )}
              
              {displayDimensions.width > 0 && (
                <>
                  <div 
                    className="absolute inset-0 bg-black/50 pointer-events-none"
                    style={{
                      clipPath: `polygon(
                        0 0, 100% 0, 100% 100%, 0 100%, 0 0,
                        ${cropArea.x}px ${cropArea.y}px,
                        ${cropArea.x}px ${cropArea.y + cropArea.height}px,
                        ${cropArea.x + cropArea.width}px ${cropArea.y + cropArea.height}px,
                        ${cropArea.x + cropArea.width}px ${cropArea.y}px,
                        ${cropArea.x}px ${cropArea.y}px
                      )`,
                    }}
                  />
                  
                  <div
                    className="absolute border-2 border-primary cursor-move"
                    style={{
                      left: cropArea.x,
                      top: cropArea.y,
                      width: cropArea.width,
                      height: cropArea.height,
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
                    
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded pointer-events-none">
                      {realCropArea.width} x {realCropArea.height}
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
          showAds={true}
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
              <p className="text-sm text-muted-foreground">{realCropArea.width} x {realCropArea.height} px</p>
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
          <AdSlot position="results" />
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
