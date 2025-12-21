import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler } from '@/hooks/useFileHandler';
import { imagesToPdf } from '@/lib/engines/imageToPdf';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Image, Download, Loader2, CheckCircle, X } from 'lucide-react';
import { FileUploadZone } from '@/components/tool-ui';

export default function JpgToPdfTool() {
  const { t } = useTranslation();
  
  const {
    files,
    status,
    error,
    progress,
    resultBlob,
    addFiles,
    removeFile,
    setStatus,
    setError,
    setResult,
    setProgress,
    downloadResult,
    reset,
  } = useFileHandler({ accept: 'image/jpeg,image/jpg,image/png', multiple: true });

  const handleFilesFromDropzone = useCallback((fileList: FileList) => {
    addFiles(fileList);
  }, [addFiles]);

  const handleConvert = useCallback(async () => {
    if (files.length === 0) return;

    setStatus('processing');
    setProgress(0);
    setError(null);

    try {
      const buffers = files
        .map((f) => f.arrayBuffer)
        .filter((buffer): buffer is ArrayBuffer => buffer !== null);
      
      const fileTypes = files.map((f) => f.file.type);

      const pdfBlob = await imagesToPdf(buffers, fileTypes, (prog) => {
        setProgress(prog.percentage);
      });

      setResult(pdfBlob);
    } catch {
      setError({ code: 'CONVERSION_FAILED' });
      setStatus('error');
    }
  }, [files, setStatus, setProgress, setError, setResult]);

  const handleDownload = useCallback(() => {
    downloadResult(`unitools_images_converted.pdf`);
  }, [downloadResult]);

  const formatFileSize = useCallback((bytes: number): string => {
    const k = 1024;
    if (bytes < k) return `${bytes} B`;
    if (bytes < k * k) return `${(bytes / k).toFixed(1)} KB`;
    return `${(bytes / (k * k)).toFixed(1)} MB`;
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground" data-testid="text-instructions">
        {t('Tools.jpg-to-pdf.description')}
      </div>

      {status === 'idle' && (
        <>
          <FileUploadZone
            onFileSelect={handleFilesFromDropzone}
            accept="image/*"
            multiple={true}
          />

          {files.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">
                {t('Common.workflow.filesSelected', { count: files.length })}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-64 overflow-auto">
                {files.map((file) => (
                  <Card key={file.id} className="p-2 relative group">
                    {file.previewUrl && (
                      <img 
                        src={file.previewUrl} 
                        alt={file.file.name}
                        className="w-full h-24 object-cover rounded"
                      />
                    )}
                    <p className="text-xs truncate mt-1">{file.file.name}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                      data-testid={`button-remove-${file.id}`}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Card>
                ))}
              </div>

              <div className="flex gap-3">
                <Button onClick={handleConvert} className="flex-1" data-testid="button-convert">
                  {t('Tools.jpg-to-pdf.title')}
                </Button>
                <Button variant="outline" onClick={reset} data-testid="button-reset">
                  {t('Common.workflow.startOver')}
                </Button>
              </div>
            </div>
          )}
        </>
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
            <p className="text-muted-foreground">{formatFileSize(resultBlob.size)}</p>
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
