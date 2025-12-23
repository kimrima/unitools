import { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler } from '@/hooks/useFileHandler';
import { useStagedProcessing } from '@/hooks/useStagedProcessing';
import { deletePages } from '@/lib/engines/pdfPageOps';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StagedLoadingOverlay } from '@/components/StagedLoadingOverlay';
import { FileText, Download, CheckCircle, Trash2 } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { FileUploadZone } from '@/components/tool-ui';

export default function DeletePdfPagesTool() {
  const { t } = useTranslation();
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  
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
      { name: 'processing', duration: 1400, message: t('Common.stages.deletingPages', { defaultValue: 'Deleting pages...' }) },
      { name: 'optimizing', duration: 800, message: t('Common.stages.finalizingDocument', { defaultValue: 'Finalizing document...' }) },
    ],
  });

  useEffect(() => {
    async function loadPageCount() {
      if (files.length > 0 && files[0].arrayBuffer) {
        try {
          const pdfDoc = await PDFDocument.load(files[0].arrayBuffer);
          setPageCount(pdfDoc.getPageCount());
          setSelectedPages([]);
        } catch {
          setPageCount(0);
        }
      }
    }
    loadPageCount();
  }, [files]);

  const handleFilesFromDropzone = useCallback((fileList: FileList) => {
    addFiles(fileList);
  }, [addFiles]);

  const togglePage = useCallback((pageIndex: number) => {
    setSelectedPages((prev) =>
      prev.includes(pageIndex)
        ? prev.filter((p) => p !== pageIndex)
        : [...prev, pageIndex]
    );
  }, []);

  const handleDeletePages = useCallback(async () => {
    if (files.length === 0 || !files[0].arrayBuffer || selectedPages.length === 0) return;

    setStatus('processing');
    setError(null);

    try {
      await stagedProcessing.runStagedProcessing(async () => {
        const result = await deletePages(files[0].arrayBuffer!, selectedPages);
        setResult(result);
        return result;
      });
      setStatus('success');
    } catch {
      setError({ code: 'DELETE_PAGES_FAILED' });
      setStatus('error');
    }
  }, [files, selectedPages, setStatus, setError, setResult, stagedProcessing]);

  const handleDownload = useCallback(() => {
    const originalName = files[0]?.file.name || 'document.pdf';
    const baseName = originalName.replace('.pdf', '');
    downloadResult(`unitools_${baseName}_edited.pdf`);
  }, [files, downloadResult]);

  const reset = useCallback(() => {
    resetHandler();
    stagedProcessing.reset();
    setSelectedPages([]);
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
        {t('Tools.delete-pdf-pages.description')}
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
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(files[0].file.size)} - {pageCount} {t('Tools.delete-pdf-pages.pages', { defaultValue: 'pages' })}
                </p>
              </div>
            </div>
          </Card>

          {pageCount > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">
                {t('Tools.delete-pdf-pages.selectPages', { defaultValue: 'Select pages to delete' })}
              </p>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2 max-h-48 overflow-auto p-2">
                {Array.from({ length: pageCount }, (_, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-center p-2 rounded border cursor-pointer transition-colors ${
                      selectedPages.includes(i)
                        ? 'bg-destructive/10 border-destructive text-destructive'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => togglePage(i)}
                    data-testid={`page-checkbox-${i}`}
                  >
                    <span className="text-sm font-medium">{i + 1}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedPages.length} {t('Tools.delete-pdf-pages.selected', { defaultValue: 'pages selected' })}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              onClick={handleDeletePages} 
              className="flex-1" 
              variant="destructive"
              disabled={selectedPages.length === 0 || selectedPages.length >= pageCount}
              data-testid="button-delete"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('Tools.delete-pdf-pages.title')}
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
