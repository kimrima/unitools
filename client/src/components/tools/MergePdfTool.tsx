import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler, type FileHandlerError } from '@/hooks/useFileHandler';
import { useStagedProcessing } from '@/hooks/useStagedProcessing';
import { mergePdfFiles, PdfMergeError } from '@/lib/engines/pdfMerge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StagedLoadingOverlay } from '@/components/StagedLoadingOverlay';
import { FileText, Upload, X, Download, GripVertical, CheckCircle } from 'lucide-react';
import { AdSlot } from '@/components/AdSlot';

export default function MergePdfTool() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showResults, setShowResults] = useState(false);
  
  const {
    files,
    status,
    error,
    resultBlob,
    addFiles,
    removeFile,
    clearFiles,
    setStatus,
    setError,
    setResult,
    downloadResult,
    reset: resetHandler,
  } = useFileHandler({ accept: '.pdf', multiple: true });
  
  const stagedProcessing = useStagedProcessing({
    minDuration: 4000,
    stages: [
      { name: 'analyzing', duration: 1200, message: t('Common.stages.readingPdf', { defaultValue: 'Reading PDF structure...' }) },
      { name: 'processing', duration: 1800, message: t('Common.stages.mergingPages', { defaultValue: 'Merging pages...' }) },
      { name: 'optimizing', duration: 1000, message: t('Common.stages.finalizingDocument', { defaultValue: 'Finalizing document...' }) },
    ],
  });

  const translateError = useCallback((err: FileHandlerError | PdfMergeError | null): string => {
    if (!err) return '';
    
    if (err instanceof PdfMergeError) {
      if (err.code === 'FAILED_TO_PROCESS_PDF' && err.fileIndex) {
        return `${t('Common.errors.FAILED_TO_PROCESS_PDF')} #${err.fileIndex}`;
      }
      return t(`Common.errors.${err.code}`);
    }
    
    if ('code' in err) {
      if (err.code === 'FILE_TOO_LARGE' && err.fileName) {
        return `${t('Common.errors.FILE_TOO_LARGE')}: ${err.fileName}`;
      }
      return t(`Common.errors.${err.code}`);
    }
    
    return t('Common.messages.error');
  }, [t]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
  }, [addFiles]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === 'application/pdf'
    );
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  }, [addFiles]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const reset = useCallback(() => {
    resetHandler();
    stagedProcessing.reset();
    setShowResults(false);
  }, [resetHandler, stagedProcessing]);
  
  const handleMerge = useCallback(async () => {
    if (files.length < 2) {
      setError({ code: 'NEED_MORE_FILES' as const } as FileHandlerError);
      return;
    }

    setError(null);
    setShowResults(false);

    try {
      await stagedProcessing.runStagedProcessing(async () => {
        const pdfBuffers = files
          .map((f) => f.arrayBuffer)
          .filter((buffer): buffer is ArrayBuffer => buffer !== null);

        const mergedBlob = await mergePdfFiles(pdfBuffers);
        setResult(mergedBlob);
        return mergedBlob;
      });
      setShowResults(true);
    } catch (err) {
      if (err instanceof PdfMergeError) {
        setError({ code: err.code } as FileHandlerError);
      } else {
        setError({ code: 'NO_FILES_PROVIDED' } as FileHandlerError);
      }
      setStatus('error');
    }
  }, [files, setError, setResult, setStatus, stagedProcessing]);

  const handleDownload = useCallback(() => {
    downloadResult('merged.pdf');
  }, [downloadResult]);

  const formatFileSize = useCallback((bytes: number): string => {
    const k = 1024;
    if (bytes < k) return `${bytes} ${t('Common.units.bytes')}`;
    if (bytes < k * k) return `${(bytes / k).toFixed(1)} ${t('Common.units.kb')}`;
    return `${(bytes / (k * k)).toFixed(1)} ${t('Common.units.mb')}`;
  }, [t]);

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground" data-testid="text-instructions">
        {t('Tools.merge-pdf.instructions')}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-file-pdf"
      />

      {!stagedProcessing.isProcessing && !showResults && (
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
      )}

      {files.length > 0 && !stagedProcessing.isProcessing && !showResults && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-sm font-medium" data-testid="text-files-count">
                {files.length} {t('Common.messages.filesSelected')}
              </span>
              <Button variant="ghost" size="sm" onClick={clearFiles} data-testid="button-clear">
                {t('Common.actions.clear')}
              </Button>
            </div>

            <ul className="space-y-2">
              {files.map((file, index) => (
                <li
                  key={file.id}
                  className="flex items-center gap-3 p-2 bg-muted/50 rounded-md"
                  data-testid={`list-item-file-${index}`}
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <span className="flex-1 text-sm truncate">{file.file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(file.file.size)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.id)}
                    className="h-7 w-7"
                    data-testid={`button-remove-file-${index}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>
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
          showAds={true}
        />
      )}

      {showResults && resultBlob && (
        <div className="space-y-6">
          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-4" data-testid="section-success">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-lg text-green-700 dark:text-green-300">
                    {t('Common.messages.complete')}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {files.length} {t('Tools.merge-pdf.pagesMerged', { defaultValue: 'files merged successfully' })}
                  </p>
                </div>
                <Button size="lg" onClick={handleDownload} data-testid="button-download">
                  <Download className="w-5 h-5 mr-2" />
                  {t('Common.actions.download')}
                </Button>
              </div>
            </CardContent>
          </Card>
          <AdSlot position="results" />
        </div>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg" data-testid="section-error">
          {translateError(error)}
        </div>
      )}

      {!stagedProcessing.isProcessing && !showResults && (
        <div className="flex gap-4 flex-wrap">
          <Button
            onClick={handleMerge}
            disabled={files.length < 2}
            className="flex-1"
            data-testid="button-merge"
          >
            <FileText className="w-4 h-4 mr-2" />
            {t('Common.actions.merge')}
          </Button>
        </div>
      )}
      
      {showResults && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={reset} data-testid="button-reset">
            {t('Common.actions.reset')}
          </Button>
        </div>
      )}
    </div>
  );
}
