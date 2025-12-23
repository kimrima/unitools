import { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler } from '@/hooks/useFileHandler';
import { useStagedProcessing } from '@/hooks/useStagedProcessing';
import { flipImage } from '@/lib/engines/imageEngine';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StagedLoadingOverlay } from '@/components/StagedLoadingOverlay';
import { FileUploadZone } from '@/components/tool-ui';
import { Download, CheckCircle, FlipHorizontal, FlipVertical } from 'lucide-react';
import { ShareActions } from '@/components/ShareActions';

export default function FlipImageTool() {
  const { t } = useTranslation();
  const [flipDirection, setFlipDirection] = useState<'horizontal' | 'vertical'>('horizontal');
  const [showResults, setShowResults] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const {
    files,
    error,
    resultBlob,
    addFiles,
    setError,
    setResult,
    downloadResult,
    reset: resetHandler,
  } = useFileHandler({ accept: 'image/*', multiple: false });

  const stagedProcessing = useStagedProcessing({
    minDuration: 3000,
    stages: [
      { name: 'analyzing', duration: 800, message: t('Common.stages.analyzingFiles', { defaultValue: 'Analyzing files...' }) },
      { name: 'processing', duration: 1400, message: t('Common.stages.flippingImage', { defaultValue: 'Flipping image...' }) },
      { name: 'optimizing', duration: 800, message: t('Common.stages.optimizingOutput', { defaultValue: 'Optimizing output...' }) },
    ],
  });

  useEffect(() => {
    if (resultBlob) {
      const url = URL.createObjectURL(resultBlob);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    return undefined;
  }, [resultBlob]);

  const handleFilesFromDropzone = useCallback((fileList: FileList) => {
    addFiles(fileList);
    setShowResults(false);
  }, [addFiles]);

  const handleFlip = useCallback(async () => {
    if (!files[0]?.previewUrl) return;

    setError(null);
    setShowResults(false);

    try {
      await stagedProcessing.runStagedProcessing(async () => {
        const blob = await flipImage(
          files[0].previewUrl!,
          flipDirection === 'horizontal',
          flipDirection === 'vertical',
          files[0].file.type.includes('png') ? 'png' : 'jpg'
        );
        setResult(blob);
        return blob;
      });
      setShowResults(true);
    } catch {
      setError({ code: 'FLIP_FAILED' });
    }
  }, [files, flipDirection, setError, setResult, stagedProcessing]);

  const handleDownload = useCallback(() => {
    const ext = files[0]?.file.type.includes('png') ? 'png' : 'jpg';
    downloadResult(`unitools_flipped_${flipDirection}.${ext}`);
  }, [files, flipDirection, downloadResult]);

  const reset = useCallback(() => {
    resetHandler();
    stagedProcessing.reset();
    setShowResults(false);
    setPreviewUrl(null);
  }, [resetHandler, stagedProcessing]);

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground" data-testid="text-instructions">
        {t('Tools.flip-image.description')}
      </div>

      {!stagedProcessing.isProcessing && !showResults && files.length === 0 && (
        <FileUploadZone
          onFileSelect={handleFilesFromDropzone}
          accept="image/*"
        />
      )}

      {!stagedProcessing.isProcessing && !showResults && files.length > 0 && (
        <div className="space-y-4">
          <Card className="p-4">
            {files[0].previewUrl && (
              <div className="flex justify-center bg-muted rounded p-4">
                <img 
                  src={files[0].previewUrl} 
                  alt="Preview"
                  className="max-w-full max-h-64 object-contain transition-transform duration-300"
                  style={{ 
                    transform: flipDirection === 'horizontal' 
                      ? 'scaleX(-1)' 
                      : 'scaleY(-1)' 
                  }}
                />
              </div>
            )}
          </Card>

          <div className="flex justify-center gap-4">
            <Button
              variant={flipDirection === 'horizontal' ? 'default' : 'outline'}
              onClick={() => setFlipDirection('horizontal')}
              data-testid="button-flip-horizontal"
            >
              <FlipHorizontal className="w-4 h-4 mr-2" />
              {t('Tools.flip-image.horizontal', { defaultValue: 'Horizontal' })}
            </Button>
            <Button
              variant={flipDirection === 'vertical' ? 'default' : 'outline'}
              onClick={() => setFlipDirection('vertical')}
              data-testid="button-flip-vertical"
            >
              <FlipVertical className="w-4 h-4 mr-2" />
              {t('Tools.flip-image.vertical', { defaultValue: 'Vertical' })}
            </Button>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleFlip} className="flex-1" data-testid="button-flip">
              {flipDirection === 'horizontal' ? (
                <FlipHorizontal className="w-4 h-4 mr-2" />
              ) : (
                <FlipVertical className="w-4 h-4 mr-2" />
              )}
              {t('Tools.flip-image.title')}
            </Button>
            <Button variant="outline" onClick={reset} data-testid="button-reset">
              {t('Common.workflow.startOver')}
            </Button>
          </div>
        </div>
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

      {showResults && resultBlob && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">{t('Common.workflow.processingComplete')}</span>
              </div>
              {previewUrl && (
                <div className="w-full flex justify-center p-4 bg-muted rounded">
                  <img 
                    src={previewUrl} 
                    alt="Result" 
                    className="max-w-full max-h-80 object-contain"
                  />
                </div>
              )}
              <div className="flex gap-3">
                <Button onClick={handleDownload} data-testid="button-download">
                  <Download className="w-4 h-4 mr-2" />
                  {t('Common.workflow.download')}
                </Button>
                <Button variant="outline" onClick={reset} data-testid="button-start-over">
                  {t('Common.workflow.startOver')}
                </Button>
              </div>
            </div>
          </Card>
          <ShareActions />
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
