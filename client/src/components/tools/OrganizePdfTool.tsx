import { useCallback, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler } from '@/hooks/useFileHandler';
import { reorderPages } from '@/lib/engines/pdfPageOps';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FileText, Upload, Download, Loader2, CheckCircle, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export default function OrganizePdfTool() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  
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
          const count = pdfDoc.getPageCount();
          setPageCount(count);
          setPageOrder(Array.from({ length: count }, (_, i) => i));
        } catch {
          setPageCount(0);
          setPageOrder([]);
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

  const movePage = useCallback((fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= pageOrder.length) return;

    setPageOrder((prev) => {
      const newOrder = [...prev];
      [newOrder[fromIndex], newOrder[toIndex]] = [newOrder[toIndex], newOrder[fromIndex]];
      return newOrder;
    });
  }, [pageOrder.length]);

  const handleOrganize = useCallback(async () => {
    if (files.length === 0 || !files[0].arrayBuffer) return;

    setStatus('processing');
    setProgress(0);
    setError(null);

    try {
      const resultBlob = await reorderPages(files[0].arrayBuffer, pageOrder, (prog) => {
        setProgress(prog.percentage);
      });

      setResult(resultBlob);
    } catch {
      setError({ code: 'REORDER_PAGES_FAILED' });
      setStatus('error');
    }
  }, [files, pageOrder, setStatus, setProgress, setError, setResult]);

  const handleDownload = useCallback(() => {
    const originalName = files[0]?.file.name || 'document.pdf';
    const baseName = originalName.replace('.pdf', '');
    downloadResult(`unitools_${baseName}_organized.pdf`);
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
        {t('Tools.organize-pdf.description')}
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
                  {formatFileSize(files[0].file.size)} - {pageCount} {t('Tools.organize-pdf.pages', { defaultValue: 'pages' })}
                </p>
              </div>
            </div>
          </Card>

          {pageCount > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">
                {t('Tools.organize-pdf.reorderPages', { defaultValue: 'Reorder pages' })}
              </p>
              <div className="space-y-2 max-h-64 overflow-auto">
                {pageOrder.map((originalIndex, currentIndex) => (
                  <div
                    key={currentIndex}
                    className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
                    data-testid={`page-item-${currentIndex}`}
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1 text-sm font-medium">
                      {t('Tools.organize-pdf.pageLabel', { defaultValue: 'Page' })} {originalIndex + 1}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => movePage(currentIndex, 'up')}
                        disabled={currentIndex === 0}
                        data-testid={`button-move-up-${currentIndex}`}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => movePage(currentIndex, 'down')}
                        disabled={currentIndex === pageOrder.length - 1}
                        data-testid={`button-move-down-${currentIndex}`}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={handleOrganize} className="flex-1" data-testid="button-organize">
              {t('Tools.organize-pdf.title')}
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
