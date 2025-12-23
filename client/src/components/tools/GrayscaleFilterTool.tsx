import { useCallback, useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { useFileHandler } from '@/hooks/useFileHandler';
import { useStagedProcessing } from '@/hooks/useStagedProcessing';
import { applyGrayscale, applyBrightness, applyOpacity } from '@/lib/engines/imageEngine';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { StagedLoadingOverlay } from '@/components/StagedLoadingOverlay';
import { FileUploadZone } from '@/components/tool-ui';
import { Download, CheckCircle, Contrast, Sun, Eye } from 'lucide-react';
import { ShareActions } from '@/components/ShareActions';

type ToolMode = 'grayscale-filter' | 'image-brightness' | 'image-opacity';

interface ImageFilterToolProps {
  toolId?: string;
}

export default function GrayscaleFilterTool({ toolId: propToolId }: ImageFilterToolProps) {
  const { t } = useTranslation();
  const [location] = useLocation();
  
  const toolId = useMemo(() => {
    if (propToolId) return propToolId as ToolMode;
    const parts = location.split('/');
    return (parts[parts.length - 1] || 'grayscale-filter') as ToolMode;
  }, [propToolId, location]);
  
  const [brightnessValue, setBrightnessValue] = useState(100);
  const [opacityValue, setOpacityValue] = useState(100);
  const [showResults, setShowResults] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const toolConfig = useMemo(() => {
    switch (toolId) {
      case 'image-brightness':
        return { icon: Sun, titleKey: 'image-brightness', hasSlider: true, sliderLabel: 'brightness', stagingMsg: t('Common.stages.adjustingBrightness', { defaultValue: 'Adjusting brightness...' }) };
      case 'image-opacity':
        return { icon: Eye, titleKey: 'image-opacity', hasSlider: true, sliderLabel: 'opacity', stagingMsg: t('Common.stages.adjustingOpacity', { defaultValue: 'Adjusting opacity...' }) };
      default:
        return { icon: Contrast, titleKey: 'grayscale-filter', hasSlider: false, stagingMsg: t('Common.stages.applyingGrayscale', { defaultValue: 'Applying grayscale filter...' }) };
    }
  }, [toolId, t]);
  
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
      { name: 'processing', duration: 1400, message: toolConfig.stagingMsg },
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

  const handleApply = useCallback(async () => {
    if (!files[0]?.previewUrl) return;
    setError(null);
    setShowResults(false);
    
    const format = files[0].file.type.includes('png') ? 'png' : 'jpg';
    
    try {
      await stagedProcessing.runStagedProcessing(async () => {
        let blob: Blob;
        
        switch (toolId) {
          case 'image-brightness':
            blob = await applyBrightness(files[0].previewUrl!, brightnessValue, format);
            break;
          case 'image-opacity':
            blob = await applyOpacity(files[0].previewUrl!, opacityValue);
            break;
          default:
            blob = await applyGrayscale(files[0].previewUrl!, format);
        }
        
        setResult(blob);
        return blob;
      });
      setShowResults(true);
    } catch {
      setError({ code: 'PROCESSING_FAILED' });
    }
  }, [files, toolId, brightnessValue, opacityValue, setError, setResult, stagedProcessing]);

  const handleDownload = useCallback(() => {
    const ext = files[0]?.file.type.includes('png') ? 'png' : 'jpg';
    const prefix = toolId === 'image-brightness' ? 'brightness' : toolId === 'image-opacity' ? 'opacity' : 'grayscale';
    downloadResult(`unitools_${prefix}.${ext}`);
  }, [files, toolId, downloadResult]);

  const reset = useCallback(() => {
    resetHandler();
    stagedProcessing.reset();
    setShowResults(false);
  }, [resetHandler, stagedProcessing]);
  
  const Icon = toolConfig.icon;

  const getPreviewStyle = useMemo(() => {
    switch (toolId) {
      case 'image-brightness':
        return { filter: `brightness(${brightnessValue}%)` };
      case 'image-opacity':
        return { opacity: opacityValue / 100 };
      default:
        return { filter: 'grayscale(100%)' };
    }
  }, [toolId, brightnessValue, opacityValue]);
  
  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">{t(`Tools.${toolConfig.titleKey}.description`)}</div>

      {!stagedProcessing.isProcessing && !showResults && files.length === 0 && (
        <FileUploadZone onFileSelect={handleFilesFromDropzone} accept="image/*" />
      )}

      {!stagedProcessing.isProcessing && !showResults && files.length > 0 && (
        <div className="space-y-4">
          {toolConfig.hasSlider && (
            <Card className="p-4">
              <Label className="text-sm font-medium mb-3 block">
                {toolId === 'image-brightness' ? t('Common.messages.brightness', { defaultValue: 'Brightness' }) : t('Common.messages.opacity', { defaultValue: 'Opacity' })}: {toolId === 'image-brightness' ? brightnessValue : opacityValue}%
              </Label>
              <Slider
                value={[toolId === 'image-brightness' ? brightnessValue : opacityValue]}
                onValueChange={([v]) => toolId === 'image-brightness' ? setBrightnessValue(v) : setOpacityValue(v)}
                min={0}
                max={200}
                step={1}
                className="w-full"
                data-testid="slider-value"
              />
            </Card>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <p className="text-sm font-medium mb-2">{t('Common.messages.original', { defaultValue: 'Original' })}</p>
              {files[0].previewUrl && <img src={files[0].previewUrl} alt="Original" className="w-full h-48 object-contain bg-muted rounded" />}
            </Card>
            <Card className="p-4">
              <p className="text-sm font-medium mb-2">{t('Common.messages.preview', { defaultValue: 'Preview' })}</p>
              {files[0].previewUrl && <img src={files[0].previewUrl} alt="Preview" className="w-full h-48 object-contain bg-muted rounded" style={getPreviewStyle} />}
            </Card>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleApply} className="flex-1" data-testid="button-apply">
              <Icon className="w-4 h-4 mr-2" />
              {t('Common.actions.apply', { defaultValue: 'Apply' })}
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

      {error && <div className="text-center text-destructive py-4">{t('Common.messages.error')}</div>}
    </div>
  );
}
