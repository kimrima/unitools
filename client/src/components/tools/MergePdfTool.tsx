import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler, type FileHandlerError } from '@/hooks/useFileHandler';
import { useStagedProcessing } from '@/hooks/useStagedProcessing';
import { mergePdfFiles, PdfMergeError } from '@/lib/engines/pdfMerge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StagedLoadingOverlay } from '@/components/StagedLoadingOverlay';
import { FileText, X, Download, GripVertical, RefreshCw, Share2 } from 'lucide-react';
import { FileUploadZone, ResultSuccessHeader, FileResultCard, PrivacyNote, RelatedTools } from '@/components/tool-ui';
import { useToast } from '@/hooks/use-toast';

export default function MergePdfTool() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [showResults, setShowResults] = useState(false);
  
  const {
    files,
    error,
    resultBlob,
    addFiles,
    removeFile,
    clearFiles,
    setError,
    setResult,
    downloadResult,
    reset: resetHandler,
  } = useFileHandler({ accept: '.pdf', multiple: true });
  
  const stagedProcessing = useStagedProcessing({
    minDuration: 3000,
    stages: [
      { name: 'analyzing', duration: 800, message: t('Common.stages.readingPdf', { defaultValue: 'Reading PDF structure...' }) },
      { name: 'processing', duration: 1400, message: t('Common.stages.mergingPages', { defaultValue: 'Merging pages...' }) },
      { name: 'optimizing', duration: 800, message: t('Common.stages.finalizingDocument', { defaultValue: 'Finalizing document...' }) },
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
    }
  }, [files, setError, setResult, stagedProcessing]);

  const handleDownload = useCallback(() => {
    downloadResult('merged.pdf');
  }, [downloadResult]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('Tools.merge-pdf.title'),
          text: t('Common.messages.shareText', { defaultValue: 'Check out this free tool!' }),
          url: window.location.href,
        });
      } catch { }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: t('Common.messages.copied', { defaultValue: 'Link copied!' }) });
    }
  };

  const formatFileSize = useCallback((bytes: number): string => {
    const k = 1024;
    if (bytes < k) return `${bytes} ${t('Common.units.bytes')}`;
    if (bytes < k * k) return `${(bytes / k).toFixed(1)} ${t('Common.units.kb')}`;
    return `${(bytes / (k * k)).toFixed(1)} ${t('Common.units.mb')}`;
  }, [t]);

  const totalSize = files.reduce((sum, f) => sum + f.file.size, 0);

  if (stagedProcessing.isProcessing) {
    return (
      <div className="space-y-6">
        <StagedLoadingOverlay
          stage={stagedProcessing.stage}
          progress={stagedProcessing.progress}
          stageProgress={stagedProcessing.stageProgress}
          message={stagedProcessing.message}
          error={stagedProcessing.error}
          onCancel={stagedProcessing.abort}
        />
      </div>
    );
  }

  if (showResults && resultBlob) {
    return (
      <div className="space-y-6">
        <ResultSuccessHeader
          subtitle={t('Tools.merge-pdf.successMessage', { count: files.length, defaultValue: `${files.length} files merged successfully` })}
          stats={[
            { label: t('Common.messages.files', { defaultValue: 'Files' }), value: files.length },
            { label: t('Common.messages.totalSize', { defaultValue: 'Total Size' }), value: formatFileSize(totalSize) },
            { label: t('Common.messages.outputSize', { defaultValue: 'Output' }), value: formatFileSize(resultBlob.size) },
          ]}
        />
        
        <FileResultCard
          fileName="merged.pdf"
          fileSize={formatFileSize(resultBlob.size)}
          fileType="pdf"
          onDownload={handleDownload}
          onShare={handleShare}
        />

        <div className="flex gap-3">
          <Button variant="outline" size="lg" onClick={reset} className="flex-1 rounded-xl" data-testid="button-new-file">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('Common.actions.processAnother', { defaultValue: 'Process Another' })}
          </Button>
        </div>
        
        <PrivacyNote variant="success" />
        
        <RelatedTools currentToolId="merge-pdf" category="pdf" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        multiple
        onChange={(e) => e.target.files && addFiles(e.target.files)}
        className="hidden"
        data-testid="input-file-pdf"
      />

      {files.length === 0 && (
        <>
          <FileUploadZone
            onFileSelect={(fileList) => addFiles(fileList)}
            accept="application/pdf"
            multiple={true}
          />
          <PrivacyNote />
        </>
      )}

      {files.length > 0 && (
        <Card className="overflow-visible">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <span className="text-sm font-bold uppercase tracking-wide text-muted-foreground" data-testid="text-files-count">
                {files.length} {t('Common.messages.filesSelected')}
              </span>
              <Button variant="ghost" size="sm" onClick={clearFiles} className="rounded-lg" data-testid="button-clear">
                {t('Common.actions.clear')}
              </Button>
            </div>

            <ul className="space-y-2">
              {files.map((file, index) => (
                <li
                  key={file.id}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl border"
                  data-testid={`list-item-file-${index}`}
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium truncate block">{file.file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(file.file.size)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.id)}
                    data-testid={`button-remove-file-${index}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>
            
            {files.length < 2 && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 rounded-xl text-sm">
                {t('Tools.merge-pdf.needMoreFiles', { defaultValue: 'Add at least 2 PDF files to merge' })}
              </div>
            )}
            
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleMerge}
                disabled={files.length < 2}
                size="lg"
                className="flex-1 rounded-xl"
                data-testid="button-merge"
              >
                <FileText className="w-5 h-5 mr-2" />
                {t('Common.actions.merge')}
              </Button>
              <Button variant="outline" size="lg" onClick={reset} className="rounded-xl" data-testid="button-reset">
                {t('Common.actions.reset')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-xl" data-testid="section-error">
          {translateError(error)}
        </div>
      )}
    </div>
  );
}
