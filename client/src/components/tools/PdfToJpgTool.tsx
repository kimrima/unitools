import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler } from '@/hooks/useFileHandler';
import { useStagedProcessing } from '@/hooks/useStagedProcessing';
import { pdfToImages, imagesToZip } from '@/lib/engines/pdfToImage';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { StagedLoadingOverlay } from '@/components/StagedLoadingOverlay';
import { FileText, Download, CheckCircle, Image } from 'lucide-react';
import { FileUploadZone } from '@/components/tool-ui';

export default function PdfToJpgTool() {
  const { t } = useTranslation();
  const [quality, setQuality] = useState(90);
  const [scale, setScale] = useState(2);
  const [resultImages, setResultImages] = useState<Blob[]>([]);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  
  const {
    files,
    status,
    error,
    addFiles,
    setStatus,
    setError,
    reset: resetHandler,
  } = useFileHandler({ accept: '.pdf', multiple: false });

  const stagedProcessing = useStagedProcessing({
    minDuration: 3000,
    stages: [
      { name: 'analyzing', duration: 800, message: t('Common.stages.readingPdf', { defaultValue: 'Reading PDF structure...' }) },
      { name: 'processing', duration: 1400, message: t('Common.stages.convertingImages', { defaultValue: 'Converting pages to images...' }) },
      { name: 'optimizing', duration: 800, message: t('Common.stages.finalizingDocument', { defaultValue: 'Finalizing images...' }) },
    ],
  });

  const handleFilesFromDropzone = useCallback((fileList: FileList) => {
    addFiles(fileList);
    setResultImages([]);
    setZipBlob(null);
  }, [addFiles]);

  const handleConvert = useCallback(async () => {
    if (files.length === 0 || !files[0].arrayBuffer) return;

    setStatus('processing');
    setError(null);

    try {
      await stagedProcessing.runStagedProcessing(async () => {
        const options = { format: 'jpeg' as const, quality: quality / 100, scale };
        const baseName = files[0].file.name.replace('.pdf', '');
        
        const images = await pdfToImages(files[0].arrayBuffer!, options);
        setResultImages(images);

        if (images.length > 1) {
          const zip = await imagesToZip(images, 'jpeg', baseName);
          setZipBlob(zip);
        }

        return images;
      });
      setStatus('success');
    } catch {
      setError({ code: 'CONVERSION_FAILED' });
      setStatus('error');
    }
  }, [files, quality, scale, setStatus, setError, stagedProcessing]);

  const handleDownloadSingle = useCallback((blob: Blob, index: number) => {
    const baseName = files[0]?.file.name.replace('.pdf', '') || 'document';
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseName}_page_${index + 1}.jpg`;
    a.click();
    URL.revokeObjectURL(url);
  }, [files]);

  const handleDownloadAll = useCallback(() => {
    if (!zipBlob) return;
    const baseName = files[0]?.file.name.replace('.pdf', '') || 'document';
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseName}_images.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }, [zipBlob, files]);

  const reset = useCallback(() => {
    resetHandler();
    stagedProcessing.reset();
    setResultImages([]);
    setZipBlob(null);
  }, [resetHandler, stagedProcessing]);

  const formatFileSize = (bytes: number): string => {
    const k = 1024;
    if (bytes < k) return `${bytes} B`;
    if (bytes < k * k) return `${(bytes / k).toFixed(1)} KB`;
    return `${(bytes / (k * k)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground" data-testid="text-instructions">
        {t('Tools.pdf-to-jpg.description')}
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

          <Card className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>{t('Common.workflow.quality', 'Quality')}: {quality}%</Label>
              <Slider
                value={[quality]}
                onValueChange={([v]) => setQuality(v)}
                min={10}
                max={100}
                step={5}
                className="w-full"
                data-testid="slider-quality"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('Common.workflow.resolution', 'Resolution')}: {scale}x</Label>
              <Slider
                value={[scale]}
                onValueChange={([v]) => setScale(v)}
                min={1}
                max={4}
                step={0.5}
                className="w-full"
                data-testid="slider-scale"
              />
            </div>
          </Card>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleConvert} data-testid="button-convert">
              <Image className="w-4 h-4 mr-2" />
              {t('Common.actions.convert')}
            </Button>
            <Button variant="outline" onClick={reset} data-testid="button-reset">
              {t('Common.actions.reset')}
            </Button>
          </div>
        </div>
      )}

      <StagedLoadingOverlay
        stage={stagedProcessing.stage}
        progress={stagedProcessing.progress}
        stageProgress={stagedProcessing.stageProgress}
        message={stagedProcessing.message}
        error={stagedProcessing.error}
      />

      {status === 'success' && resultImages.length > 0 && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{t('Common.messages.complete')}</p>
                <p className="text-sm text-muted-foreground">
                  {resultImages.length} {t('Common.workflow.pagesConverted', 'pages converted')}
                </p>
              </div>
            </div>
          </Card>

          {resultImages.length > 1 && zipBlob && (
            <Button onClick={handleDownloadAll} className="w-full" data-testid="button-download-all">
              <Download className="w-4 h-4 mr-2" />
              {t('Common.workflow.downloadAllAsZip', 'Download All as ZIP')}
            </Button>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {resultImages.map((blob, index) => (
              <Card 
                key={index} 
                className="p-2 cursor-pointer hover-elevate"
                onClick={() => handleDownloadSingle(blob, index)}
                data-testid={`card-image-${index}`}
              >
                <div className="aspect-[3/4] bg-muted rounded overflow-hidden mb-2">
                  <img 
                    src={URL.createObjectURL(blob)} 
                    alt={`Page ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  {t('Common.workflow.page', 'Page')} {index + 1}
                </p>
              </Card>
            ))}
          </div>

          <Button variant="outline" onClick={reset} className="w-full" data-testid="button-convert-another">
            {t('Common.workflow.convertAnother', 'Convert Another')}
          </Button>
        </div>
      )}

      {status === 'error' && (
        <Card className="p-4 border-destructive">
          <p className="text-destructive">{t(`Common.errors.${error?.code}`, t('Common.messages.error'))}</p>
          <Button variant="outline" onClick={reset} className="mt-4" data-testid="button-try-again">
            {t('Common.workflow.tryAgain', 'Try Again')}
          </Button>
        </Card>
      )}
    </div>
  );
}
