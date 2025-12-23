import { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler } from '@/hooks/useFileHandler';
import { useStagedProcessing } from '@/hooks/useStagedProcessing';
import { removeExif } from '@/lib/engines/imageEngine';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StagedLoadingOverlay } from '@/components/StagedLoadingOverlay';
import { FileUploadZone } from '@/components/tool-ui';
import { Download, CheckCircle, ShieldCheck, FileImage, Calendar, Camera, MapPin } from 'lucide-react';
import { ShareActions } from '@/components/ShareActions';

interface ExifData {
  make?: string;
  model?: string;
  dateTime?: string;
  gps?: boolean;
  software?: string;
}

export default function RemoveExifTool() {
  const { t } = useTranslation();
  const [showResults, setShowResults] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [newSize, setNewSize] = useState(0);
  const [exifData, setExifData] = useState<ExifData | null>(null);

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
      { name: 'analyzing', duration: 800, message: t('Common.stages.analyzingMetadata', { defaultValue: 'Analyzing metadata...' }) },
      { name: 'processing', duration: 1400, message: t('Common.stages.removingExif', { defaultValue: 'Removing EXIF data...' }) },
      { name: 'optimizing', duration: 800, message: t('Common.stages.optimizingOutput', { defaultValue: 'Saving clean image...' }) },
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

  const analyzeExif = useCallback((file: File): Promise<ExifData | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const view = new DataView(e.target?.result as ArrayBuffer);
        
        if (view.getUint16(0, false) !== 0xFFD8) {
          resolve(null);
          return;
        }
        
        let offset = 2;
        while (offset < view.byteLength) {
          if (view.getUint8(offset) !== 0xFF) break;
          const marker = view.getUint8(offset + 1);
          
          if (marker === 0xE1) {
            const exifLength = view.getUint16(offset + 2, false);
            if (exifLength > 6) {
              resolve({
                make: t('Common.labels.detected', { defaultValue: 'Detected' }),
                dateTime: t('Common.labels.detected', { defaultValue: 'Detected' }),
                gps: true,
              });
              return;
            }
          }
          
          if (marker === 0xD9 || marker === 0xDA) break;
          offset += 2 + view.getUint16(offset + 2, false);
        }
        
        resolve(null);
      };
      reader.onerror = () => resolve(null);
      reader.readAsArrayBuffer(file.slice(0, 65536));
    });
  }, [t]);

  const handleFilesFromDropzone = useCallback(async (fileList: FileList) => {
    addFiles(fileList);
    setShowResults(false);
    
    if (fileList[0]) {
      setOriginalSize(fileList[0].size);
      const exif = await analyzeExif(fileList[0]);
      setExifData(exif);
    }
  }, [addFiles, analyzeExif]);

  const handleApply = useCallback(async () => {
    if (!files[0]?.previewUrl) return;

    setError(null);
    setShowResults(false);

    try {
      await stagedProcessing.runStagedProcessing(async () => {
        const format = files[0].file.type.includes('png') ? 'png' : 'jpg';
        const blob = await removeExif(files[0].previewUrl!, format);
        setNewSize(blob.size);
        setResult(blob);
        return blob;
      });
      setShowResults(true);
    } catch {
      setError({ code: 'EXIF_REMOVAL_FAILED' });
    }
  }, [files, setError, setResult, stagedProcessing]);

  const handleDownload = useCallback(() => {
    const ext = files[0]?.file.type.includes('png') ? 'png' : 'jpg';
    downloadResult(`unitools_clean.${ext}`);
  }, [files, downloadResult]);

  const reset = useCallback(() => {
    resetHandler();
    stagedProcessing.reset();
    setShowResults(false);
    setExifData(null);
    setOriginalSize(0);
    setNewSize(0);
  }, [resetHandler, stagedProcessing]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground" data-testid="text-instructions">
        {t('Tools.remove-exif.description')}
      </div>

      {!stagedProcessing.isProcessing && !showResults && files.length === 0 && (
        <FileUploadZone onFileSelect={handleFilesFromDropzone} accept="image/*" />
      )}

      {!stagedProcessing.isProcessing && !showResults && files.length > 0 && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {files[0].previewUrl && (
                <div className="flex-shrink-0 flex justify-center p-4 bg-muted rounded">
                  <img 
                    src={files[0].previewUrl} 
                    alt="Preview" 
                    className="max-w-full max-h-48 object-contain"
                  />
                </div>
              )}

              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <FileImage className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{files[0].file.name}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {t('Common.labels.fileSize', { defaultValue: 'File Size' })}: {formatSize(originalSize)}
                </div>
                
                {exifData ? (
                  <div className="space-y-2 pt-2 border-t">
                    <div className="text-sm font-medium text-amber-600 dark:text-amber-400">
                      {t('Common.labels.metadataFound', { defaultValue: 'Metadata Found:' })}
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      {exifData.make && (
                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4 text-muted-foreground" />
                          <span>{t('Common.labels.cameraInfo', { defaultValue: 'Camera Information' })}</span>
                        </div>
                      )}
                      {exifData.dateTime && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{t('Common.labels.dateTime', { defaultValue: 'Date/Time' })}</span>
                        </div>
                      )}
                      {exifData.gps && (
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                          <MapPin className="w-4 h-4" />
                          <span>{t('Common.labels.locationData', { defaultValue: 'Location Data (GPS)' })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-green-600 dark:text-green-400 pt-2 border-t">
                    {t('Common.labels.noMetadataDetected', { defaultValue: 'No sensitive metadata detected' })}
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button onClick={handleApply} className="flex-1" data-testid="button-apply">
              <ShieldCheck className="w-4 h-4 mr-2" />
              {t('Tools.remove-exif.title', { defaultValue: 'Remove EXIF Data' })}
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
                <span className="font-medium">{t('Common.labels.exifRemoved', { defaultValue: 'EXIF data successfully removed!' })}</span>
              </div>
              
              {previewUrl && (
                <div className="w-full flex justify-center p-4 bg-muted rounded">
                  <img src={previewUrl} alt="Result" className="max-w-full max-h-80 object-contain" />
                </div>
              )}
              
              <div className="text-sm text-muted-foreground">
                {t('Common.labels.originalSize', { defaultValue: 'Original' })}: {formatSize(originalSize)} → {t('Common.labels.newSize', { defaultValue: 'Clean' })}: {formatSize(newSize)}
              </div>
              
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
