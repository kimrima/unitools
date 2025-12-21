import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler } from '@/hooks/useFileHandler';
import { addWatermark } from '@/lib/engines/pdfWatermark';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { FileText, Download, Loader2, CheckCircle } from 'lucide-react';
import { FileUploadZone } from '@/components/tool-ui';

export default function WatermarkPdfTool() {
  const { t } = useTranslation();
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [opacity, setOpacity] = useState([30]);
  const [fontSize, setFontSize] = useState([50]);
  
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
  } = useFileHandler({ accept: '.pdf', multiple: false });

  const handleFilesFromDropzone = useCallback((fileList: FileList) => {
    addFiles(fileList);
  }, [addFiles]);

  const handleAddWatermark = useCallback(async () => {
    if (files.length === 0 || !files[0].arrayBuffer || !watermarkText.trim()) return;

    setStatus('processing');
    setProgress(0);
    setError(null);

    try {
      const watermarkedBlob = await addWatermark(
        files[0].arrayBuffer,
        {
          text: watermarkText,
          opacity: opacity[0] / 100,
          fontSize: fontSize[0],
          position: 'diagonal',
          rotation: 45,
        },
        (prog) => {
          setProgress(prog.percentage);
        }
      );

      setResult(watermarkedBlob);
    } catch {
      setError({ code: 'WATERMARK_FAILED' });
      setStatus('error');
    }
  }, [files, watermarkText, opacity, fontSize, setStatus, setProgress, setError, setResult]);

  const handleDownload = useCallback(() => {
    const originalName = files[0]?.file.name || 'document.pdf';
    const baseName = originalName.replace('.pdf', '');
    downloadResult(`unitools_${baseName}_watermarked.pdf`);
  }, [files, downloadResult]);

  const formatFileSize = useCallback((bytes: number): string => {
    const k = 1024;
    if (bytes < k) return `${bytes} B`;
    if (bytes < k * k) return `${(bytes / k).toFixed(1)} KB`;
    return `${(bytes / (k * k)).toFixed(1)} MB`;
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground" data-testid="text-instructions">
        {t('Tools.watermark-pdf.description')}
      </div>

      {status === 'idle' && files.length === 0 && (
        <FileUploadZone
          onFileSelect={handleFilesFromDropzone}
          accept="application/pdf"
          multiple={false}
        />
      )}

      {status === 'idle' && files.length > 0 && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{files[0].file.name}</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(files[0].file.size)}</p>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="watermark-text">{t('Tools.watermark-pdf.textLabel', { defaultValue: 'Watermark Text' })}</Label>
              <Input
                id="watermark-text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="Enter watermark text"
                data-testid="input-watermark-text"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('Tools.watermark-pdf.opacityLabel', { defaultValue: 'Opacity' })}: {opacity[0]}%</Label>
              <Slider
                value={opacity}
                onValueChange={setOpacity}
                min={10}
                max={100}
                step={5}
                data-testid="slider-opacity"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('Tools.watermark-pdf.fontSizeLabel', { defaultValue: 'Font Size' })}: {fontSize[0]}px</Label>
              <Slider
                value={fontSize}
                onValueChange={setFontSize}
                min={20}
                max={100}
                step={5}
                data-testid="slider-font-size"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleAddWatermark} 
              className="flex-1" 
              disabled={!watermarkText.trim()}
              data-testid="button-add-watermark"
            >
              {t('Tools.watermark-pdf.title')}
            </Button>
            <Button variant="outline" onClick={reset} data-testid="button-reset">
              {t('Common.workflow.startOver')}
            </Button>
          </div>
        </div>
      )}

      {status === 'processing' && (
        <div className="space-y-6 py-8">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="font-medium">{t('Common.workflow.processing')}</p>
          </div>
          <Progress value={progress} className="h-2" data-testid="progress-bar" />
        </div>
      )}

      {status === 'success' && resultBlob && (
        <div className="flex flex-col items-center gap-6 py-8">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">{t('Common.workflow.processingComplete')}</h3>
          </div>
          <div className="flex gap-3">
            <Button size="lg" onClick={handleDownload} data-testid="button-download">
              <Download className="w-5 h-5 mr-2" />
              {t('Common.workflow.download')}
            </Button>
            <Button variant="outline" size="lg" onClick={reset} data-testid="button-start-over">
              {t('Common.workflow.startOver')}
            </Button>
          </div>
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
