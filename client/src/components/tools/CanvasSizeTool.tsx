import { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler } from '@/hooks/useFileHandler';
import { useStagedProcessing } from '@/hooks/useStagedProcessing';
import { changeCanvasSize } from '@/lib/engines/imageEngine';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StagedLoadingOverlay } from '@/components/StagedLoadingOverlay';
import { FileUploadZone } from '@/components/tool-ui';
import { Download, CheckCircle, Move } from 'lucide-react';
import { ShareActions } from '@/components/ShareActions';

const ANCHOR_OPTIONS = [
  { value: 'center', label: 'Center' },
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-right', label: 'Bottom Right' },
] as const;

const PRESET_SIZES = [
  { label: 'Instagram Post', width: 1080, height: 1080 },
  { label: 'Instagram Story', width: 1080, height: 1920 },
  { label: 'Facebook Cover', width: 820, height: 312 },
  { label: 'Twitter Header', width: 1500, height: 500 },
  { label: 'YouTube Thumbnail', width: 1280, height: 720 },
  { label: 'LinkedIn Banner', width: 1584, height: 396 },
];

export default function CanvasSizeTool() {
  const { t } = useTranslation();
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [newWidth, setNewWidth] = useState(0);
  const [newHeight, setNewHeight] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [anchor, setAnchor] = useState<'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('center');
  const [showResults, setShowResults] = useState(false);
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
      { name: 'analyzing', duration: 800, message: t('Common.stages.analyzingFiles', { defaultValue: 'Analyzing files...' }) },
      { name: 'processing', duration: 1400, message: t('Common.stages.resizingCanvas', { defaultValue: 'Resizing canvas...' }) },
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

  useEffect(() => {
    if (files.length > 0 && files[0].previewUrl) {
      const img = new window.Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
        setNewWidth(img.width);
        setNewHeight(img.height);
      };
      img.src = files[0].previewUrl;
    }
  }, [files]);

  const handleFilesFromDropzone = useCallback((fileList: FileList) => {
    addFiles(fileList);
    setShowResults(false);
  }, [addFiles]);

  const applyPreset = useCallback((width: number, height: number) => {
    setNewWidth(width);
    setNewHeight(height);
  }, []);

  const handleProcess = useCallback(async () => {
    if (!files[0]?.previewUrl || newWidth <= 0 || newHeight <= 0) return;

    setError(null);
    setShowResults(false);

    try {
      await stagedProcessing.runStagedProcessing(async () => {
        const blob = await changeCanvasSize(
          files[0].previewUrl!,
          newWidth,
          newHeight,
          backgroundColor,
          anchor,
          files[0].file.type.includes('png') ? 'png' : 'jpg'
        );
        setResult(blob);
        return blob;
      });
      setShowResults(true);
    } catch {
      setError({ code: 'CANVAS_RESIZE_FAILED' });
    }
  }, [files, newWidth, newHeight, backgroundColor, anchor, setError, setResult, stagedProcessing]);

  const handleDownload = useCallback(() => {
    const ext = files[0]?.file.type.includes('png') ? 'png' : 'jpg';
    downloadResult(`unitools_canvas_${newWidth}x${newHeight}.${ext}`);
  }, [files, newWidth, newHeight, downloadResult]);

  const reset = useCallback(() => {
    resetHandler();
    stagedProcessing.reset();
    setShowResults(false);
    setPreviewUrl(null);
    setOriginalDimensions({ width: 0, height: 0 });
    setNewWidth(0);
    setNewHeight(0);
  }, [resetHandler, stagedProcessing]);

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground" data-testid="text-instructions">
        {t('Tools.canvas-size.description', { defaultValue: 'Change the canvas size of your image. The original image will be placed on a new canvas with your chosen dimensions and background color.' })}
      </div>

      {!stagedProcessing.isProcessing && !showResults && files.length === 0 && (
        <FileUploadZone
          onFileSelect={handleFilesFromDropzone}
          accept="image/*"
        />
      )}

      {!stagedProcessing.isProcessing && !showResults && files.length > 0 && (
        <div className="space-y-4">
          <Card className="p-4">
            {files[0].previewUrl && (
              <div className="flex justify-center bg-muted rounded p-4 mb-4">
                <img 
                  src={files[0].previewUrl} 
                  alt="Preview"
                  className="max-w-full max-h-48 object-contain"
                />
              </div>
            )}
            <p className="text-sm text-muted-foreground text-center mb-4">
              {t('Tools.canvas-size.originalSize', { defaultValue: 'Original size' })}: {originalDimensions.width} x {originalDimensions.height} px
            </p>
          </Card>

          <Card className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>{t('Tools.canvas-size.presets', { defaultValue: 'Presets' })}</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_SIZES.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset(preset.width, preset.height)}
                    data-testid={`button-preset-${preset.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">{t('Common.labels.width', { defaultValue: 'Width' })} (px)</Label>
                <Input
                  id="width"
                  type="number"
                  min={1}
                  max={10000}
                  value={newWidth}
                  onChange={(e) => setNewWidth(Math.max(1, parseInt(e.target.value) || 1))}
                  data-testid="input-width"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">{t('Common.labels.height', { defaultValue: 'Height' })} (px)</Label>
                <Input
                  id="height"
                  type="number"
                  min={1}
                  max={10000}
                  value={newHeight}
                  onChange={(e) => setNewHeight(Math.max(1, parseInt(e.target.value) || 1))}
                  data-testid="input-height"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bgcolor">{t('Tools.canvas-size.backgroundColor', { defaultValue: 'Background Color' })}</Label>
                <div className="flex gap-2">
                  <Input
                    id="bgcolor"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-12 h-9 p-1"
                    data-testid="input-bgcolor"
                  />
                  <Input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1"
                    placeholder="#ffffff"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('Tools.canvas-size.anchor', { defaultValue: 'Image Position' })}</Label>
                <Select value={anchor} onValueChange={(v) => setAnchor(v as typeof anchor)}>
                  <SelectTrigger data-testid="select-anchor">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ANCHOR_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {t(`Tools.canvas-size.anchors.${opt.value}`, { defaultValue: opt.label })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button onClick={handleProcess} className="flex-1" data-testid="button-process">
              <Move className="w-4 h-4 mr-2" />
              {t('Tools.canvas-size.title', { defaultValue: 'Change Canvas Size' })}
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
              <p className="text-sm text-muted-foreground">{newWidth} x {newHeight} px</p>
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
