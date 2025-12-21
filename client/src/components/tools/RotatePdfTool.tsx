import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler } from '@/hooks/useFileHandler';
import { rotatePdf, type RotationAngle } from '@/lib/engines/pdfRotate';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FileUploadZone } from '@/components/tool-ui';
import { FileText, Download, Loader2, CheckCircle, RotateCw } from 'lucide-react';

export default function RotatePdfTool() {
  const { t } = useTranslation();
  const [rotationAngle, setRotationAngle] = useState<RotationAngle>(90);
  
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

  const handleFilesFromDropzone = useCallback((fileList: FileList) => {
    if (fileList.length > 0) {
      addFiles(fileList);
    }
  }, [addFiles]);

  const handleRotate = useCallback(async () => {
    if (files.length === 0 || !files[0].arrayBuffer) return;

    setStatus('processing');
    setProgress(0);
    setError(null);

    try {
      const rotatedBlob = await rotatePdf(files[0].arrayBuffer, rotationAngle, undefined, (prog) => {
        setProgress(prog.percentage);
      });

      setResult(rotatedBlob);
    } catch {
      setError({ code: 'ROTATION_FAILED' });
      setStatus('error');
    }
  }, [files, rotationAngle, setStatus, setProgress, setError, setResult]);

  const handleDownload = useCallback(() => {
    const originalName = files[0]?.file.name || 'document.pdf';
    const baseName = originalName.replace('.pdf', '');
    downloadResult(`unitools_${baseName}_rotated.pdf`);
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
        {t('Tools.rotate-pdf.description')}
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

          <div className="space-y-3">
            <p className="text-sm font-medium">{t('Tools.rotate-pdf.selectAngle', { defaultValue: 'Select rotation angle' })}</p>
            <div className="flex gap-2">
              {([90, 180, 270] as RotationAngle[]).map((angle) => (
                <Button
                  key={angle}
                  variant={rotationAngle === angle ? 'default' : 'outline'}
                  onClick={() => setRotationAngle(angle)}
                  className="flex-1"
                  data-testid={`button-rotate-${angle}`}
                >
                  <RotateCw className="w-4 h-4 mr-2" style={{ transform: `rotate(${angle}deg)` }} />
                  {angle}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleRotate} className="flex-1" data-testid="button-rotate">
              {t('Tools.rotate-pdf.title')}
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
