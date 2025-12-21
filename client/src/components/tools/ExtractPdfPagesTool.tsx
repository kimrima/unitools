import { useCallback, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler } from '@/hooks/useFileHandler';
import { extractPages } from '@/lib/engines/pdfPageOps';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FileText, Upload, Download, Loader2, CheckCircle, FileOutput } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export default function ExtractPdfPagesTool() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  
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

  const togglePage = useCallback((pageIndex: number) => {
    setSelectedPages((prev) =>
      prev.includes(pageIndex)
        ? prev.filter((p) => p !== pageIndex)
        : [...prev, pageIndex]
    );
  }, []);

  const handleExtract = useCallback(async () => {
    if (files.length === 0 || !files[0].arrayBuffer || selectedPages.length === 0) return;

    setStatus('processing');
    setProgress(0);
    setError(null);

    try {
      const resultBlob = await extractPages(files[0].arrayBuffer, selectedPages, (prog) => {
        setProgress(prog.percentage);
      });

      setResult(resultBlob);
    } catch {
      setError({ code: 'EXTRACT_PAGES_FAILED' });
      setStatus('error');
    }
  }, [files, selectedPages, setStatus, setProgress, setError, setResult]);

  const handleDownload = useCallback(() => {
    const originalName = files[0]?.file.name || 'document.pdf';
    const baseName = originalName.replace('.pdf', '');
    downloadResult(`unitools_${baseName}_extracted.pdf`);
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
        {t('Tools.extract-pdf-pages.description')}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-file-pdf"
      />

      {status === 'idle' && files.length === 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-muted-foreground/25 rounded-xl min-h-64 flex flex-col items-center justify-center gap-4 p-8 cursor-pointer hover:border-primary/50 transition-colors"
          data-testid="dropzone"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-medium text-lg">{t('Common.workflow.dropFilesHere')}</p>
            <p className="text-sm text-muted-foreground mt-1">{t('Common.workflow.orClickToBrowse')}</p>
          </div>
          <Button variant="outline" data-testid="button-select-file">
            <Upload className="w-4 h-4 mr-2" />
            {t('Common.workflow.selectFiles')}
          </Button>
        </div>
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
                  {formatFileSize(files[0].file.size)} - {pageCount} {t('Tools.extract-pdf-pages.pages', { defaultValue: 'pages' })}
                </p>
              </div>
            </div>
          </Card>

          {pageCount > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">
                {t('Tools.extract-pdf-pages.selectPages', { defaultValue: 'Select pages to extract' })}
              </p>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2 max-h-48 overflow-auto p-2">
                {Array.from({ length: pageCount }, (_, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-center p-2 rounded border cursor-pointer transition-colors ${
                      selectedPages.includes(i)
                        ? 'bg-primary/10 border-primary text-primary'
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
                {selectedPages.length} {t('Tools.extract-pdf-pages.selected', { defaultValue: 'pages selected' })}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              onClick={handleExtract} 
              className="flex-1" 
              disabled={selectedPages.length === 0}
              data-testid="button-extract"
            >
              <FileOutput className="w-4 h-4 mr-2" />
              {t('Tools.extract-pdf-pages.title')}
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
