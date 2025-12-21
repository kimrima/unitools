import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler, type FileHandlerError } from '@/hooks/useFileHandler';
import { splitPdfByPages, getPdfPageCount, PdfSplitError, type SplitResult } from '@/lib/engines/pdfSplit';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FileText, Upload, Download, Loader2, Scissors } from 'lucide-react';
import { downloadBlob } from '@/hooks/useToolEngine';

export default function SplitPdfTool() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [pageCount, setPageCount] = useState<number>(0);
  const [splitResults, setSplitResults] = useState<SplitResult[]>([]);
  
  const {
    files,
    status,
    error,
    progress,
    addFiles,
    clearFiles,
    setStatus,
    setError,
    setProgress,
    reset: resetHandler,
  } = useFileHandler({ accept: '.pdf', multiple: false });

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

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await addFiles(e.target.files);
      setSplitResults([]);
      
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const count = await getPdfPageCount(reader.result as ArrayBuffer);
          setPageCount(count);
        } catch {
          setPageCount(0);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }, [addFiles]);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === 'application/pdf'
    );
    if (droppedFiles.length > 0) {
      await addFiles([droppedFiles[0]]);
      setSplitResults([]);
      
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const count = await getPdfPageCount(reader.result as ArrayBuffer);
          setPageCount(count);
        } catch {
          setPageCount(0);
        }
      };
      reader.readAsArrayBuffer(droppedFiles[0]);
    }
  }, [addFiles]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleSplit = useCallback(async () => {
    if (files.length === 0 || !files[0].arrayBuffer) {
      setError({ code: 'NO_FILES_PROVIDED' });
      return;
    }

    setStatus('processing');
    setProgress(0);
    setError(null);
    setSplitResults([]);

    try {
      const results = await splitPdfByPages(files[0].arrayBuffer, (prog) => {
        setProgress(prog.percentage);
      });

      setSplitResults(results);
      setStatus('success');
    } catch (err) {
      if (err instanceof PdfSplitError) {
        setError({ code: err.code });
      } else {
        setError({ code: 'PROCESSING_FAILED' });
      }
      setStatus('error');
    }
  }, [files, setStatus, setProgress, setError]);

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
    setSplitResults([]);
    setPageCount(0);
  }, [resetHandler]);

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground" data-testid="text-instructions">
        {t('Tools.split-pdf.instructions')}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-file-pdf"
      />

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-muted-foreground/25 rounded-lg min-h-40 flex flex-col items-center justify-center gap-4 hover:border-muted-foreground/50 transition-colors cursor-pointer p-6"
        data-testid="dropzone-pdf"
      >
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Upload className="w-6 h-6 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="font-medium">{t('Common.messages.dragDrop')}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t('Common.messages.noServerUpload')}
          </p>
        </div>
      </div>

      {files.length > 0 && splitResults.length === 0 && (
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

      {status === 'processing' && (
        <div className="space-y-2" data-testid="section-processing">
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{t('Common.messages.splittingPdf')}</span>
          </div>
          <Progress value={progress} className="h-2" data-testid="progress-bar" />
        </div>
      )}

      {splitResults.length > 0 && (
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="font-medium text-green-700 dark:text-green-300">
                {t('Common.messages.complete')} - {splitResults.length} {t('Common.messages.pagesCreated')}
              </p>
              <Button onClick={handleDownloadAll} size="sm" data-testid="button-download-all">
                <Download className="w-4 h-4 mr-2" />
                {t('Common.actions.download')} ({splitResults.length})
              </Button>
            </div>

            <ul className="space-y-2 max-h-60 overflow-y-auto" data-testid="list-results">
              {splitResults.map((result, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 p-2 bg-white dark:bg-background rounded-md border"
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
      )}

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg" data-testid="section-error">
          {translateError(error)}
        </div>
      )}

      <div className="flex gap-4 flex-wrap">
        <Button
          onClick={handleSplit}
          disabled={files.length === 0 || status === 'processing'}
          className="flex-1"
          data-testid="button-split"
        >
          {status === 'processing' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('Common.messages.processing')}
            </>
          ) : (
            <>
              <Scissors className="w-4 h-4 mr-2" />
              {t('Common.actions.split')}
            </>
          )}
        </Button>
        
        {(status === 'success' || status === 'error') && (
          <Button variant="outline" onClick={reset} data-testid="button-reset">
            {t('Common.actions.reset')}
          </Button>
        )}
      </div>
    </div>
  );
}
