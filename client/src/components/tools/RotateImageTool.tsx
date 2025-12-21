import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler } from '@/hooks/useFileHandler';
import { rotateImage } from '@/lib/engines/imageEngine';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FileUploadZone } from '@/components/tool-ui';
import { Download, Loader2, CheckCircle, RotateCw, RotateCcw } from 'lucide-react';

export default function RotateImageTool() {
  const { t } = useTranslation();
  const [rotation, setRotation] = useState(90);
  
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
  } = useFileHandler({ accept: 'image/*', multiple: false });

  const handleFilesFromDropzone = useCallback((files: FileList) => {
    addFiles(files);
  }, [addFiles]);

  const handleRotate = useCallback(async () => {
    if (!files[0]?.previewUrl) return;

    setStatus('processing');
    setProgress(0);
    setError(null);

    try {
      const blob = await rotateImage(
        files[0].previewUrl,
        rotation,
        files[0].file.type.includes('png') ? 'png' : 'jpg',
        (prog) => setProgress(prog.percentage)
      );
      setResult(blob);
    } catch {
      setError({ code: 'ROTATE_FAILED' });
      setStatus('error');
    }
  }, [files, rotation, setStatus, setProgress, setError, setResult]);

  const handleDownload = useCallback(() => {
    const ext = files[0]?.file.type.includes('png') ? 'png' : 'jpg';
    downloadResult(`unitools_rotated_${rotation}deg.${ext}`);
  }, [files, rotation, downloadResult]);

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground" data-testid="text-instructions">
        {t('Tools.rotate-image.description')}
      </div>

      {status === 'idle' && files.length === 0 && (
        <FileUploadZone
          onFileSelect={handleFilesFromDropzone}
          accept="image/*"
        />
      )}

      {status === 'idle' && files.length > 0 && (
        <div className="space-y-4">
          <Card className="p-4">
            {files[0].previewUrl && (
              <img 
                src={files[0].previewUrl} 
                alt="Preview"
                className="w-full max-h-64 object-contain bg-muted rounded"
                style={{ transform: `rotate(${rotation}deg)` }}
              />
            )}
          </Card>

          <div className="flex justify-center gap-4">
            <Button
              variant={rotation === 90 ? 'default' : 'outline'}
              onClick={() => setRotation(90)}
              data-testid="button-rotate-90"
            >
              <RotateCw className="w-4 h-4 mr-2" />
              90
            </Button>
            <Button
              variant={rotation === 180 ? 'default' : 'outline'}
              onClick={() => setRotation(180)}
              data-testid="button-rotate-180"
            >
              <RotateCw className="w-4 h-4 mr-2" />
              180
            </Button>
            <Button
              variant={rotation === 270 ? 'default' : 'outline'}
              onClick={() => setRotation(270)}
              data-testid="button-rotate-270"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              270
            </Button>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleRotate} className="flex-1" data-testid="button-rotate">
              {t('Tools.rotate-image.title')}
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
