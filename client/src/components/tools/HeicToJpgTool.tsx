import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler } from '@/hooks/useFileHandler';
import { convertHeicToJpg } from '@/lib/engines/heicConverter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Smartphone, Upload, Download, Loader2, CheckCircle, X } from 'lucide-react';

export default function HeicToJpgTool() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
  } = useFileHandler({ accept: '.heic,.heif,image/heic,image/heif', multiple: true });

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
  }, [addFiles]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')
    );
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  }, [addFiles]);

  const handleConvert = useCallback(async () => {
    if (files.length === 0) return;

    setStatus('processing');
    setProgress(0);
    setError(null);

    try {
      const blob = await convertHeicToJpg(files[0].file, 0.92, (prog) => {
        setProgress(prog.percentage);
      });
      setResult(blob);
    } catch {
      setError({ code: 'HEIC_CONVERSION_FAILED' });
      setStatus('error');
    }
  }, [files, setStatus, setProgress, setError, setResult]);

  const handleDownload = useCallback(() => {
    const originalName = files[0]?.file.name || 'image';
    const baseName = originalName.replace(/\.(heic|heif)$/i, '');
    downloadResult(`unitools_${baseName}.jpg`);
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
        {t('Tools.heic-to-jpg.description')}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".heic,.heif"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-file-heic"
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
            <Smartphone className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-medium text-lg">{t('Common.workflow.dropFilesHere')}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('Tools.heic-to-jpg.supportedFormats', { defaultValue: 'Supports HEIC/HEIF files from iPhone' })}
            </p>
          </div>
          <Button variant="outline" data-testid="button-select-file">
            <Upload className="w-4 h-4 mr-2" />
            {t('Common.workflow.selectFiles')}
          </Button>
        </div>
      )}

      {status === 'idle' && files.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-2">
            {files.map((file) => (
              <Card key={file.id} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.file.name}</p>
                    <p className="text-sm text-muted-foreground">{formatFileSize(file.file.size)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.id)}
                    data-testid={`button-remove-${file.id}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex gap-3">
            <Button onClick={handleConvert} className="flex-1" data-testid="button-convert">
              {t('Tools.heic-to-jpg.title')}
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
