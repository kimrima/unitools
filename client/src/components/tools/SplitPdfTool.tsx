import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler, type FileHandlerError } from '@/hooks/useFileHandler';
import { useStagedProcessing } from '@/hooks/useStagedProcessing';
import { splitPdfByPages, getPdfPageCount, PdfSplitError, type SplitResult } from '@/lib/engines/pdfSplit';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StagedLoadingOverlay } from '@/components/StagedLoadingOverlay';
import { FileUploadZone } from '@/components/tool-ui';
import { FileText, Download, CheckCircle } from 'lucide-react';
import { downloadBlob } from '@/hooks/useToolEngine';

export default function SplitPdfTool() {
  const { t } = useTranslation();
  
  const [pageCount, setPageCount] = useState<number>(0);
  const [splitResults, setSplitResults] = useState<SplitResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  const {
    files,
    error,
    addFiles,
    clearFiles,
    setError,
    reset: resetHandler,
  } = useFileHandler({ accept: '.pdf', multiple: false });

  const stagedProcessing = useStagedProcessing({
    minDuration: 3000,
    stages: [
      { name: 'analyzing', duration: 800, message: t('Common.stages.readingPdf', { defaultValue: 'Reading PDF structure...' }) },
      { name: 'processing', duration: 1400, message: t('Common.stages.splittingPdf', { defaultValue: 'Splitting PDF...' }) },
      { name: 'optimizing', duration: 800, message: t('Common.stages.finalizingDocument', { defaultValue: 'Finalizing document...' }) },
    ],
  });

  const translateError = useCallback((err: FileHandlerError | PdfSplitError | null): string => {
    if (!err) return '';
    
    if (err instanceof PdfSplitError) {
      return t(`Common.errors.${err.code}`);
    }
    
    if ('code' in err) {
      return t(`Common.errors.${err.code}`);
    }
    
    return t('Common.messages.error');
  }, [t]);

  const formatFileSize = useCallback((bytes: number): string => {
    const k = 1024;
    if (bytes < k) return `${bytes} ${t('Common.units.bytes')}`;
    if (bytes < k * k) return `${(bytes / k).toFixed(1)} ${t('Common.units.kb')}`;
    return `${(bytes / (k * k)).toFixed(1)} ${t('Common.units.mb')}`;
  }, [t]);

  const handleFilesFromDropzone = useCallback(async (fileList: FileList) => {
    if (fileList.length > 0) {
      const file = fileList[0];
      if (!(file instanceof Blob)) {
        setError({ code: 'INVALID_FILE_TYPE' });
        return;
      }
      
      await addFiles(fileList);
      setSplitResults([]);
      setShowResults(false);
      
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const count = await getPdfPageCount(reader.result as ArrayBuffer);
          setPageCount(count);
        } catch {
          setPageCount(0);
        }
      };
      reader.onerror = () => {
        setPageCount(0);
      };
      reader.readAsArrayBuffer(file);
    }
  }, [addFiles, setError]);

  const handleSplit = useCallback(async () => {
    if (files.length === 0 || !files[0].arrayBuffer) {
      setError({ code: 'NO_FILES_PROVIDED' });
      return;
    }

    setError(null);
    setSplitResults([]);
    setShowResults(false);

    try {
      await stagedProcessing.runStagedProcessing(async () => {
        const results = await splitPdfByPages(files[0].arrayBuffer!);
        setSplitResults(results);
        return results;
      });
      setShowResults(true);
    } catch (err) {
      if (err instanceof PdfSplitError) {
        setError({ code: err.code });
      } else {
        setError({ code: 'PROCESSING_FAILED' });
      }
    }
  }, [files, setError, stagedProcessing]);

  const handleDownload = useCallback((result: SplitResult) => {
    downloadBlob(result.blob, `unitools_${result.filename}`);
  }, []);

  const handleDownloadAll = useCallback(() => {
    splitResults.forEach((result) => {
      downloadBlob(result.blob, `unitools_${result.filename}`);
    });
  }, [splitResults]);

  const reset = useCallback(() => {
    resetHandler();
    stagedProcessing.reset();
    setSplitResults([]);
    setPageCount(0);
    setShowResults(false);
  }, [resetHandler, stagedProcessing]);

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground" data-testid="text-instructions">
        {t('Tools.split-pdf.instructions')}
      </div>

      {!stagedProcessing.isProcessing && !showResults && files.length === 0 && (
        <FileUploadZone
          onFileSelect={handleFilesFromDropzone}
          accept="application/pdf"
          multiple={false}
        />
      )}

      {files.length > 0 && !stagedProcessing.isProcessing && !showResults && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">{files[0].file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(files[0].file.size)} | {pageCount} {t('Common.messages.pages')}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={clearFiles}>
                {t('Common.actions.clear')}
              </Button>
            </div>
          </CardContent>
        </Card>
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

      {showResults && splitResults.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">{t('Common.workflow.processingComplete')}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {splitResults.length} {t('Common.messages.pagesCreated')}
              </p>
            </div>
          </div>

          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-medium">{t('Common.actions.download')}</span>
                <Button onClick={handleDownloadAll} size="sm" data-testid="button-download-all">
                  <Download className="w-4 h-4 mr-2" />
                  {t('Common.actions.downloadAll')} ({splitResults.length})
                </Button>
              </div>

              <ul className="space-y-2 max-h-60 overflow-y-auto" data-testid="list-results">
                {splitResults.map((result, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 p-2 bg-muted/50 rounded-md"
                    data-testid={`result-item-${index}`}
                  >
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1 text-sm">{result.filename}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(result.blob.size)}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(result)}
                      data-testid={`button-download-${index}`}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <div className="flex justify-center">
            <Button variant="outline" onClick={reset} data-testid="button-reset">
              {t('Common.workflow.startOver')}
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg" data-testid="section-error">
          {translateError(error)}
        </div>
      )}

      {!stagedProcessing.isProcessing && !showResults && files.length > 0 && (
        <div className="flex gap-4 flex-wrap">
          <Button
            onClick={handleSplit}
            disabled={files.length === 0 || pageCount < 2}
            className="flex-1"
            data-testid="button-split"
          >
            {t('Common.actions.split')}
          </Button>
          <Button variant="outline" onClick={reset} data-testid="button-reset">
            {t('Common.actions.reset')}
          </Button>
        </div>
      )}
    </div>
  );
}
