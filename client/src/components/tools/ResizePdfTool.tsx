import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PDFDocument, PageSizes } from 'pdf-lib';
import { useStagedProcessing } from '@/hooks/useStagedProcessing';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { StagedLoadingOverlay } from '@/components/StagedLoadingOverlay';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, CheckCircle, Maximize, Trash2 } from 'lucide-react';
import { FileUploadZone } from '@/components/tool-ui';

type ToolStatus = 'idle' | 'processing' | 'success' | 'error';

const PAGE_SIZES: Record<string, [number, number]> = {
  'A4': PageSizes.A4,
  'A3': PageSizes.A3,
  'A5': PageSizes.A5,
  'Letter': PageSizes.Letter,
  'Legal': PageSizes.Legal,
  'Tabloid': PageSizes.Tabloid,
  'Executive': PageSizes.Executive,
};

export default function ResizePdfTool() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ToolStatus>('idle');
  const [error, setError] = useState<{ code: string } | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [targetSize, setTargetSize] = useState('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  const stagedProcessing = useStagedProcessing({
    minDuration: 3000,
    stages: [
      { name: 'analyzing', duration: 800, message: t('Common.stages.analyzingDocument', { defaultValue: 'Analyzing document...' }) },
      { name: 'processing', duration: 1400, message: t('Common.stages.resizingPages', { defaultValue: 'Resizing pages...' }) },
      { name: 'optimizing', duration: 800, message: t('Common.stages.finalizingDocument', { defaultValue: 'Finalizing document...' }) },
    ],
  });

  const handleFilesFromDropzone = useCallback((fileList: FileList) => {
    const selectedFile = fileList[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setStatus('idle');
      setError(null);
      setResultBlob(null);
    }
  }, []);

  const handleResize = async () => {
    if (!file) return;

    setStatus('processing');
    setError(null);

    try {
      await stagedProcessing.runStagedProcessing(async () => {
        const arrayBuffer = await file.arrayBuffer();

        const srcDoc = await PDFDocument.load(arrayBuffer);
        const newDoc = await PDFDocument.create();
        
        let [targetWidth, targetHeight] = PAGE_SIZES[targetSize] || PageSizes.A4;
        if (orientation === 'landscape') {
          [targetWidth, targetHeight] = [targetHeight, targetWidth];
        }

        const pages = srcDoc.getPages();
        
        for (let i = 0; i < pages.length; i++) {
          const srcPage = pages[i];
          const { width: srcWidth, height: srcHeight } = srcPage.getSize();
          
          const [embeddedPage] = await newDoc.embedPages([srcPage]);
          const newPage = newDoc.addPage([targetWidth, targetHeight]);
          
          const scaleX = targetWidth / srcWidth;
          const scaleY = targetHeight / srcHeight;
          const scale = Math.min(scaleX, scaleY);
          
          const scaledWidth = srcWidth * scale;
          const scaledHeight = srcHeight * scale;
          const x = (targetWidth - scaledWidth) / 2;
          const y = (targetHeight - scaledHeight) / 2;

          newPage.drawPage(embeddedPage, {
            x,
            y,
            width: scaledWidth,
            height: scaledHeight,
          });
        }

        const pdfBytes = await newDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        setResultBlob(blob);
        return blob;
      });
      setStatus('success');
    } catch {
      setError({ code: 'RESIZE_FAILED' });
      setStatus('error');
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace('.pdf', `_${targetSize}.pdf`);
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setResultBlob(null);
    setStatus('idle');
    stagedProcessing.reset();
  };

  return (
    <div className="space-y-6">
      {!file && (
        <FileUploadZone
          onFileSelect={handleFilesFromDropzone}
          accept="application/pdf"
          multiple={false}
        />
      )}

      {file && status === 'idle' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={reset}
              data-testid="button-remove-file"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('Tools.resize-pdf.pageSize')}</Label>
              <Select value={targetSize} onValueChange={setTargetSize}>
                <SelectTrigger data-testid="select-page-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(PAGE_SIZES).map(size => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('Tools.resize-pdf.orientation')}</Label>
              <Select value={orientation} onValueChange={(v) => setOrientation(v as 'portrait' | 'landscape')}>
                <SelectTrigger data-testid="select-orientation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">{t('Tools.resize-pdf.portrait')}</SelectItem>
                  <SelectItem value="landscape">{t('Tools.resize-pdf.landscape')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{t(`Errors.${error.code}`)}</p>
          )}

          <Button
            className="w-full"
            onClick={handleResize}
            data-testid="button-resize"
          >
            <Maximize className="w-4 h-4 mr-2" />
            {t('Tools.resize-pdf.resizeButton')}
          </Button>
        </Card>
      )}

      <StagedLoadingOverlay
        stage={stagedProcessing.stage}
        progress={stagedProcessing.progress}
        stageProgress={stagedProcessing.stageProgress}
        message={stagedProcessing.message}
        error={stagedProcessing.error}
      />

      {status === 'success' && resultBlob && (
        <div className="flex flex-col items-center gap-6 py-8">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">{t('Common.workflow.processingComplete')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('Tools.resize-pdf.successMessage')}
            </p>
          </div>
          <div className="flex gap-3">
            <Button size="lg" onClick={handleDownload} data-testid="button-download">
              <Download className="w-5 h-5 mr-2" />
              {t('Common.download')}
            </Button>
            <Button variant="outline" size="lg" onClick={reset} data-testid="button-new">
              {t('Common.processAnother')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
