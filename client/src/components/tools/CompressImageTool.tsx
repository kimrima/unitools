import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler, type FileHandlerError } from '@/hooks/useFileHandler';
import { useStagedProcessing } from '@/hooks/useStagedProcessing';
import { compressImage, ImageCompressError, getFileSizeData, type CompressionResult } from '@/lib/engines/imageCompress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { StagedLoadingOverlay } from '@/components/StagedLoadingOverlay';
import { Image, Upload, X, Download, Check, CheckCircle } from 'lucide-react';
import { AdSlot } from '@/components/AdSlot';

export default function CompressImageTool() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [quality, setQuality] = useState(80);
  const [maxSize, setMaxSize] = useState(1920);
  const [compressionResults, setCompressionResults] = useState<CompressionResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  const {
    files,
    error,
    addFiles,
    removeFile,
    clearFiles,
    setError,
    reset: resetHandler,
  } = useFileHandler({ accept: 'image/*', multiple: true });

  const stagedProcessing = useStagedProcessing({
    minDuration: 3000,
    stages: [
      { name: 'analyzing', duration: 800, message: t('Common.stages.analyzingFiles', { defaultValue: 'Analyzing files...' }) },
      { name: 'processing', duration: 1400, message: t('Common.stages.processingImage', { defaultValue: 'Processing image...' }) },
      { name: 'optimizing', duration: 800, message: t('Common.stages.optimizingOutput', { defaultValue: 'Optimizing output...' }) },
    ],
  });

  const formatFileSize = useCallback((bytes: number): string => {
    const data = getFileSizeData(bytes);
    return `${data.value} ${t(`Common.units.${data.unit}`)}`;
  }, [t]);

  const translateError = useCallback((err: FileHandlerError | ImageCompressError | null): string => {
    if (!err) return '';
    
    if (err instanceof ImageCompressError) {
      if (err.code === 'COMPRESSION_FAILED' && err.fileName) {
        return `${t('Common.errors.COMPRESSION_FAILED')}: ${err.fileName}`;
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
      setCompressionResults([]);
      setShowResults(false);
    }
  }, [addFiles]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type.startsWith('image/')
    );
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
      setCompressionResults([]);
      setShowResults(false);
    }
  }, [addFiles]);

  const handleCompress = useCallback(async () => {
    if (files.length === 0) {
      setError({ code: 'NO_FILES_SELECTED' });
      return;
    }

    setError(null);
    setCompressionResults([]);
    setShowResults(false);

    try {
      await stagedProcessing.runStagedProcessing(async () => {
        const results: CompressionResult[] = [];
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          
          const result = await compressImage(
            file.file,
            {
              quality: quality / 100,
              maxWidthOrHeight: maxSize,
              maxSizeMB: 10,
            }
          );

          results.push(result);
        }

        setCompressionResults(results);
        return results;
      });
      setShowResults(true);
    } catch (err) {
      if (err instanceof ImageCompressError) {
        setError({ code: err.code } as FileHandlerError);
      } else {
        setError({ code: 'NO_FILES_PROVIDED' } as FileHandlerError);
      }
    }
  }, [files, quality, maxSize, setError, stagedProcessing]);

  const handleDownload = useCallback((result: CompressionResult) => {
    const url = URL.createObjectURL(result.compressedBlob);
    const link = document.createElement('a');
    link.href = url;
    
    const originalName = result.originalFile.name;
    const extension = originalName.substring(originalName.lastIndexOf('.'));
    const baseName = originalName.substring(0, originalName.lastIndexOf('.'));
    link.download = `unitools_${baseName}_compressed${extension}`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const handleDownloadAll = useCallback(() => {
    compressionResults.forEach((result) => {
      handleDownload(result);
    });
  }, [compressionResults, handleDownload]);

  const reset = useCallback(() => {
    resetHandler();
    stagedProcessing.reset();
    setCompressionResults([]);
    setShowResults(false);
  }, [resetHandler, stagedProcessing]);

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground" data-testid="text-instructions">
        {t('Tools.compress-image.instructions')}
      </div>

      {!stagedProcessing.isProcessing && !showResults && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quality-slider">
                {t('Common.messages.quality')}: {quality}%
              </Label>
              <Slider
                id="quality-slider"
                value={[quality]}
                onValueChange={(values) => setQuality(values[0])}
                min={10}
                max={100}
                step={5}
                className="w-full"
                data-testid="slider-quality"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size-slider">
                {t('Common.messages.maxWidth')}: {maxSize}px
              </Label>
              <Slider
                id="size-slider"
                value={[maxSize]}
                onValueChange={(values) => setMaxSize(values[0])}
                min={320}
                max={4096}
                step={64}
                className="w-full"
                data-testid="slider-max-size"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-file-image"
      />

      {!stagedProcessing.isProcessing && !showResults && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg min-h-40 flex flex-col items-center justify-center gap-4 hover:border-muted-foreground/50 transition-colors cursor-pointer p-6"
          data-testid="dropzone-image"
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
                  {file.previewUrl ? (
                    <img
                      src={file.previewUrl}
                      alt={file.file.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <Image className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className="flex-1 text-sm truncate">{file.file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(file.file.size)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
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

      {showResults && compressionResults.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">{t('Common.workflow.processingComplete')}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {compressionResults.length} {t('Common.messages.filesCompressed', { defaultValue: 'files compressed' })}
              </p>
            </div>
          </div>

          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="font-medium">
                    {t('Common.messages.complete')}
                  </span>
                </div>
                {compressionResults.length > 1 && (
                  <Button onClick={handleDownloadAll} size="sm" data-testid="button-download-all">
                    <Download className="w-4 h-4 mr-2" />
                    {t('Common.actions.downloadAll')} ({compressionResults.length})
                  </Button>
                )}
              </div>

              <ul className="space-y-3" data-testid="list-results">
                {compressionResults.map((result, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-md"
                    data-testid={`result-item-${index}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{result.originalFile.name}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground mt-1 flex-wrap">
                        <span>
                          {formatFileSize(result.originalSize)} → {formatFileSize(result.compressedSize)}
                        </span>
                        <span className="text-green-600 font-medium">
                          -{result.compressionRatio}%
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(result)}
                      data-testid={`button-download-${index}`}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <div className="flex justify-center">
            <Button variant="outline" onClick={reset} data-testid="button-reset">
              {t('Common.workflow.startOver')}
            </Button>
          </div>
          
          <AdSlot position="results" />
        </div>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg" data-testid="section-error">
          {translateError(error)}
        </div>
      )}

      {!stagedProcessing.isProcessing && !showResults && files.length > 0 && (
        <div className="flex gap-4 flex-wrap">
          <Button
            onClick={handleCompress}
            disabled={files.length === 0}
            className="flex-1"
            data-testid="button-compress"
          >
            <Image className="w-4 h-4 mr-2" />
            {t('Common.actions.compress')}
          </Button>
          <Button variant="outline" onClick={reset} data-testid="button-reset">
            {t('Common.actions.reset')}
          </Button>
        </div>
      )}
    </div>
  );
}
