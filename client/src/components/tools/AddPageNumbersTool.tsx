import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler } from '@/hooks/useFileHandler';
import { useStagedProcessing } from '@/hooks/useStagedProcessing';
import { addPageNumbers, type PageNumberOptions } from '@/lib/engines/pdfAddPageNumbers';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StagedLoadingOverlay } from '@/components/StagedLoadingOverlay';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FileText, Download, CheckCircle } from 'lucide-react';
import { FileUploadZone } from '@/components/tool-ui';

type Position = PageNumberOptions['position'];

export default function AddPageNumbersTool() {
  const { t } = useTranslation();
  const [position, setPosition] = useState<Position>('bottom-center');
  const [format, setFormat] = useState<'number' | 'of-total'>('number');
  
  const {
    files,
    status,
    error,
    resultBlob,
    addFiles,
    setStatus,
    setError,
    setResult,
    downloadResult,
    reset: resetHandler,
  } = useFileHandler({ accept: '.pdf', multiple: false });

  const stagedProcessing = useStagedProcessing({
    minDuration: 3000,
    stages: [
      { name: 'analyzing', duration: 800, message: t('Common.stages.analyzingDocument', { defaultValue: 'Analyzing document...' }) },
      { name: 'processing', duration: 1400, message: t('Common.stages.addingPageNumbers', { defaultValue: 'Adding page numbers...' }) },
      { name: 'optimizing', duration: 800, message: t('Common.stages.finalizingDocument', { defaultValue: 'Finalizing document...' }) },
    ],
  });

  const handleFilesFromDropzone = useCallback((fileList: FileList) => {
    addFiles(fileList);
  }, [addFiles]);

  const handleAddPageNumbers = useCallback(async () => {
    if (files.length === 0 || !files[0].arrayBuffer) return;

    setStatus('processing');
    setError(null);

    try {
      await stagedProcessing.runStagedProcessing(async () => {
        const result = await addPageNumbers(
          files[0].arrayBuffer!,
          { position, format }
        );
        setResult(result);
        return result;
      });
      setStatus('success');
    } catch {
      setError({ code: 'ADD_PAGE_NUMBERS_FAILED' });
      setStatus('error');
    }
  }, [files, position, format, setStatus, setError, setResult, stagedProcessing]);

  const handleDownload = useCallback(() => {
    const originalName = files[0]?.file.name || 'document.pdf';
    const baseName = originalName.replace('.pdf', '');
    downloadResult(`unitools_${baseName}_numbered.pdf`);
  }, [files, downloadResult]);

  const reset = useCallback(() => {
    resetHandler();
    stagedProcessing.reset();
  }, [resetHandler, stagedProcessing]);

  const formatFileSize = useCallback((bytes: number): string => {
    const k = 1024;
    if (bytes < k) return `${bytes} B`;
    if (bytes < k * k) return `${(bytes / k).toFixed(1)} KB`;
    return `${(bytes / (k * k)).toFixed(1)} MB`;
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground" data-testid="text-instructions">
        {t('Tools.add-page-numbers.description')}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('Tools.add-page-numbers.positionLabel', { defaultValue: 'Position' })}</Label>
              <Select value={position} onValueChange={(v) => setPosition(v as Position)}>
                <SelectTrigger data-testid="select-position">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom-center">Bottom Center</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  <SelectItem value="top-center">Top Center</SelectItem>
                  <SelectItem value="top-left">Top Left</SelectItem>
                  <SelectItem value="top-right">Top Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('Tools.add-page-numbers.formatLabel', { defaultValue: 'Format' })}</Label>
              <Select value={format} onValueChange={(v) => setFormat(v as 'number' | 'of-total')}>
                <SelectTrigger data-testid="select-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="number">1, 2, 3...</SelectItem>
                  <SelectItem value="of-total">1 / 10, 2 / 10...</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleAddPageNumbers} className="flex-1" data-testid="button-add-numbers">
              {t('Tools.add-page-numbers.title')}
            </Button>
            <Button variant="outline" onClick={reset} data-testid="button-reset">
              {t('Common.workflow.startOver')}
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
