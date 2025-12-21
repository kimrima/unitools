import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler } from '@/hooks/useFileHandler';
import { useStagedProcessing } from '@/hooks/useStagedProcessing';
import { compressPdf } from '@/lib/engines/pdfCompress';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StagedLoadingOverlay } from '@/components/StagedLoadingOverlay';
import { FileUploadZone } from '@/components/tool-ui';
import { FileText, Download, CheckCircle } from 'lucide-react';

export default function CompressPdfTool() {
  const { t } = useTranslation();
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
  } = useFileHandler({ accept: '.pdf', multiple: false });
  
  const stagedProcessing = useStagedProcessing({
    minDuration: 3000,
    stages: [
      { name: 'analyzing', duration: 800, message: t('Common.stages.readingPdf', { defaultValue: 'Reading PDF structure...' }) },
      { name: 'processing', duration: 1400, message: t('Common.stages.compressingPdf', { defaultValue: 'Compressing PDF...' }) },
      { name: 'optimizing', duration: 800, message: t('Common.stages.finalizingDocument', { defaultValue: 'Finalizing document...' }) },
    ],
  });

  const reset = useCallback(() => {
    resetHandler();
    stagedProcessing.reset();
    setShowResults(false);
  }, [resetHandler, stagedProcessing]);

  const handleFilesFromDropzone = useCallback((fileList: FileList) => {
    if (fileList.length > 0) {
      addFiles(fileList);
    }
  }, [addFiles]);

  const handleCompress = useCallback(async () => {
    if (files.length === 0 || !files[0].arrayBuffer) return;

    setError(null);
    setShowResults(false);

    try {
      await stagedProcessing.runStagedProcessing(async () => {
        const compressedBlob = await compressPdf(files[0].arrayBuffer!);
        setResult(compressedBlob);
        return compressedBlob;
      });
      setShowResults(true);
    } catch {
      setError({ code: 'COMPRESSION_FAILED' });
    }
  }, [files, setError, setResult, stagedProcessing]);

  const handleDownload = useCallback(() => {
    const originalName = files[0]?.file.name || 'document.pdf';
    const baseName = originalName.replace('.pdf', '');
    downloadResult(`unitools_${baseName}_compressed.pdf`);
  }, [files, downloadResult]);

  const formatFileSize = useCallback((bytes: number): string => {
    const k = 1024;
    if (bytes < k) return `${bytes} ${t('Common.units.bytes')}`;
    if (bytes < k * k) return `${(bytes / k).toFixed(1)} ${t('Common.units.kb')}`;
    return `${(bytes / (k * k)).toFixed(1)} ${t('Common.units.mb')}`;
  }, [t]);

  const originalSize = files[0]?.file.size || 0;
  const compressedSize = resultBlob?.size || 0;
  const savings = originalSize > 0 ? Math.round(((originalSize - compressedSize) / originalSize) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground" data-testid="text-instructions">
        {t('Tools.compress-pdf.description')}
      </div>

      {!stagedProcessing.isProcessing && !showResults && files.length === 0 && (
        <FileUploadZone
          onFileSelect={handleFilesFromDropzone}
          accept="application/pdf"
          multiple={false}
        />
      )}

      {!stagedProcessing.isProcessing && !showResults && files.length > 0 && (
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

          <div className="flex gap-3">
            <Button onClick={handleCompress} className="flex-1" data-testid="button-compress">
              {t('Tools.compress-pdf.title')}
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
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-6 py-8">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">{t('Common.workflow.processingComplete')}</h3>
              <div className="flex items-center justify-center gap-3 text-sm">
                <span className="text-muted-foreground line-through">{formatFileSize(originalSize)}</span>
                <span className="text-green-500 font-medium">{formatFileSize(compressedSize)}</span>
                {savings > 0 && (
                  <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded text-xs font-medium">
                    -{savings}%
                  </span>
                )}
              </div>
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
