import { useCallback, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { useFileHandler } from '@/hooks/useFileHandler';
import { applyGrayscale, applyBrightness, applyOpacity } from '@/lib/engines/imageEngine';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { FileUploadZone } from '@/components/tool-ui';
import { Download, Loader2, CheckCircle, Contrast, Sun, Eye } from 'lucide-react';

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
  
  const toolConfig = useMemo(() => {
    switch (toolId) {
      case 'image-brightness':
        return { icon: Sun, titleKey: 'image-brightness', hasSlider: true, sliderLabel: 'brightness' };
      case 'image-opacity':
        return { icon: Eye, titleKey: 'image-opacity', hasSlider: true, sliderLabel: 'opacity' };
      default:
        return { icon: Contrast, titleKey: 'grayscale-filter', hasSlider: false };
    }
  }, [toolId]);
  
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

  const handleFilesFromDropzone = useCallback((files: FileList) => {
    addFiles(files);
  }, [addFiles]);

  const handleApply = useCallback(async () => {
    if (!files[0]?.previewUrl) return;
    setStatus('processing');
    setProgress(0);
    setError(null);
    
    const format = files[0].file.type.includes('png') ? 'png' : 'jpg';
    
    try {
      let blob: Blob;
      
      switch (toolId) {
        case 'image-brightness':
          blob = await applyBrightness(
            files[0].previewUrl,
            brightnessValue,
            format,
            (prog) => setProgress(prog.percentage)
          );
          break;
        case 'image-opacity':
          blob = await applyOpacity(
            files[0].previewUrl,
            opacityValue,
            (prog) => setProgress(prog.percentage)
          );
          break;
        default:
          blob = await applyGrayscale(
            files[0].previewUrl,
            format,
            (prog) => setProgress(prog.percentage)
          );
      }
      
      setResult(blob);
    } catch {
      setError({ code: 'PROCESSING_FAILED' });
      setStatus('error');
    }
  }, [files, toolId, brightnessValue, opacityValue, setStatus, setProgress, setError, setResult]);

  const handleDownload = useCallback(() => {
    const ext = files[0]?.file.type.includes('png') ? 'png' : 'jpg';
    const prefix = toolId === 'image-brightness' ? 'brightness' : toolId === 'image-opacity' ? 'opacity' : 'grayscale';
    downloadResult(`unitools_${prefix}.${ext}`);
  }, [files, toolId, downloadResult]);
  
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

      {status === 'idle' && files.length === 0 && (
        <FileUploadZone
          onFileSelect={handleFilesFromDropzone}
          accept="image/*"
        />
      )}

      {status === 'idle' && files.length > 0 && (
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
            <Button onClick={handleApply} className="flex-1">{t('Common.actions.apply', { defaultValue: 'Apply' })}</Button>
            <Button variant="outline" onClick={reset}>{t('Common.workflow.startOver')}</Button>
          </div>
        </div>
      )}

      {status === 'processing' && (
        <div className="space-y-6 py-8">
          <div className="flex flex-col items-center gap-4"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {status === 'success' && resultBlob && (
        <div className="flex flex-col items-center gap-6 py-8">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <div className="flex gap-3">
            <Button size="lg" onClick={handleDownload}><Download className="w-5 h-5 mr-2" />{t('Common.workflow.download')}</Button>
            <Button variant="outline" size="lg" onClick={reset}>{t('Common.workflow.startOver')}</Button>
          </div>
        </div>
      )}

      {error && <div className="text-center text-destructive py-4">{t('Common.messages.error')}</div>}
    </div>
  );
}
