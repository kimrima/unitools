import { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler } from '@/hooks/useFileHandler';
import { useStagedProcessing } from '@/hooks/useStagedProcessing';
import { addShadow } from '@/lib/engines/imageEngine';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { StagedLoadingOverlay } from '@/components/StagedLoadingOverlay';
import { FileUploadZone } from '@/components/tool-ui';
import { Download, CheckCircle, Layers } from 'lucide-react';
import { ShareActions } from '@/components/ShareActions';

export default function ShadowAddTool() {
  const { t } = useTranslation();
  const [blur, setBlur] = useState([20]);
  const [offsetX, setOffsetX] = useState([10]);
  const [offsetY, setOffsetY] = useState([10]);
  const [shadowColor, setShadowColor] = useState('#000000');
  const [shadowOpacity, setShadowOpacity] = useState([50]);
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
      { name: 'analyzing', duration: 800, message: t('Common.stages.analyzingFiles', { defaultValue: 'Analyzing image...' }) },
      { name: 'processing', duration: 1400, message: t('Common.stages.addingShadow', { defaultValue: 'Adding shadow...' }) },
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

  const handleFilesFromDropzone = useCallback((fileList: FileList) => {
    addFiles(fileList);
    setShowResults(false);
  }, [addFiles]);

  const hexToRgba = (hex: string, opacity: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${opacity / 100})`;
  };

  const handleApply = useCallback(async () => {
    if (!files[0]?.previewUrl) return;

    setError(null);
    setShowResults(false);

    try {
      await stagedProcessing.runStagedProcessing(async () => {
        const blob = await addShadow(
          files[0].previewUrl!,
          {
            blur: blur[0],
            offsetX: offsetX[0],
            offsetY: offsetY[0],
            color: hexToRgba(shadowColor, shadowOpacity[0]),
          }
        );
        setResult(blob);
        return blob;
      });
      setShowResults(true);
    } catch {
      setError({ code: 'SHADOW_FAILED' });
    }
  }, [files, blur, offsetX, offsetY, shadowColor, shadowOpacity, setError, setResult, stagedProcessing]);

  const handleDownload = useCallback(() => {
    downloadResult('unitools_shadow.png');
  }, [downloadResult]);

  const reset = useCallback(() => {
    resetHandler();
    stagedProcessing.reset();
    setShowResults(false);
  }, [resetHandler, stagedProcessing]);

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground" data-testid="text-instructions">
        {t('Tools.add-shadow.description')}
      </div>

      {!stagedProcessing.isProcessing && !showResults && files.length === 0 && (
        <FileUploadZone onFileSelect={handleFilesFromDropzone} accept="image/*" />
      )}

      {!stagedProcessing.isProcessing && !showResults && files.length > 0 && (
        <div className="space-y-4">
          <Card className="p-4">
            {files[0].previewUrl && (
              <div className="w-full flex justify-center p-4 bg-muted rounded mb-4">
                <img 
                  src={files[0].previewUrl} 
                  alt="Preview" 
                  className="max-w-full max-h-64 object-contain"
                />
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('Common.labels.blur', { defaultValue: 'Blur' })}: {blur[0]}px</Label>
                <Slider
                  value={blur}
                  onValueChange={setBlur}
                  min={0}
                  max={50}
                  step={1}
                  data-testid="slider-blur"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('Common.labels.offsetX', { defaultValue: 'Offset X' })}: {offsetX[0]}px</Label>
                  <Slider
                    value={offsetX}
                    onValueChange={setOffsetX}
                    min={-50}
                    max={50}
                    step={1}
                    data-testid="slider-offset-x"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('Common.labels.offsetY', { defaultValue: 'Offset Y' })}: {offsetY[0]}px</Label>
                  <Slider
                    value={offsetY}
                    onValueChange={setOffsetY}
                    min={-50}
                    max={50}
                    step={1}
                    data-testid="slider-offset-y"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('Common.labels.shadowColor', { defaultValue: 'Shadow Color' })}</Label>
                  <Input
                    type="color"
                    value={shadowColor}
                    onChange={(e) => setShadowColor(e.target.value)}
                    className="h-10 w-full"
                    data-testid="input-shadow-color"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('Common.labels.opacity', { defaultValue: 'Opacity' })}: {shadowOpacity[0]}%</Label>
                  <Slider
                    value={shadowOpacity}
                    onValueChange={setShadowOpacity}
                    min={10}
                    max={100}
                    step={5}
                    data-testid="slider-opacity"
                  />
                </div>
              </div>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button onClick={handleApply} className="flex-1" data-testid="button-apply">
              <Layers className="w-4 h-4 mr-2" />
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
