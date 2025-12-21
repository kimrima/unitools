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
import { Image, X, Download, RefreshCw, FileDown, Share2 } from 'lucide-react';
import { FileUploadZone, ResultSuccessHeader, FileResultCard, PrivacyNote, RelatedTools } from '@/components/tool-ui';
import { useToast } from '@/hooks/use-toast';

export default function CompressImageTool() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('Tools.compress-image.title'),
          text: t('Common.messages.shareText', { defaultValue: 'Check out this free tool!' }),
          url: window.location.href,
        });
      } catch { }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: t('Common.messages.copied', { defaultValue: 'Link copied!' }) });
    }
  };

  const reset = useCallback(() => {
    resetHandler();
    stagedProcessing.reset();
    setCompressionResults([]);
    setShowResults(false);
  }, [resetHandler, stagedProcessing]);

  const totalOriginalSize = compressionResults.reduce((sum, r) => sum + r.originalSize, 0);
  const totalCompressedSize = compressionResults.reduce((sum, r) => sum + r.compressedSize, 0);
  const avgCompressionRatio = compressionResults.length > 0 
    ? Math.round(compressionResults.reduce((sum, r) => sum + r.compressionRatio, 0) / compressionResults.length)
    : 0;

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

  if (showResults && compressionResults.length > 0) {
    return (
      <div className="space-y-6">
        <ResultSuccessHeader
          subtitle={compressionResults.length === 1 
            ? t('Common.messages.readyToDownload', { defaultValue: 'Your file is ready to download' })
            : t('Common.messages.filesReadyToDownload', { count: compressionResults.length, defaultValue: `${compressionResults.length} files ready to download` })
          }
          stats={[
            { label: t('Common.messages.files', { defaultValue: 'Files' }), value: compressionResults.length },
            { label: t('Common.messages.originalSize', { defaultValue: 'Original' }), value: formatFileSize(totalOriginalSize) },
            { label: t('Common.messages.newSize', { defaultValue: 'New Size' }), value: formatFileSize(totalCompressedSize) },
            { label: t('Common.messages.saved', { defaultValue: 'Saved' }), value: `-${avgCompressionRatio}%` },
          ]}
        />
        
        {compressionResults.length === 1 && (
          <FileResultCard
            fileName={`compressed_${compressionResults[0].originalFile.name}`}
            fileSize={formatFileSize(compressionResults[0].compressedSize)}
            fileType="image"
            onDownload={() => handleDownload(compressionResults[0])}
            onShare={handleShare}
          />
        )}
        
        {compressionResults.length > 1 && (
          <Card className="overflow-visible">
            <CardContent className="p-6">
              <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-4">
                {t('Common.messages.processedFiles', { defaultValue: 'Processed Files' })}
              </p>
              <ul className="space-y-2">
                {compressionResults.map((result, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl border"
                    data-testid={`result-item-${index}`}
                  >
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <Image className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{result.originalFile.name}</p>
                      <div className="flex gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                        <span>{formatFileSize(result.originalSize)} → {formatFileSize(result.compressedSize)}</span>
                        <span className="text-green-600 font-medium">-{result.compressionRatio}%</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg"
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
        )}
        
        <div className="flex flex-col sm:flex-row gap-3">
          {compressionResults.length > 1 && (
            <Button onClick={handleDownloadAll} size="lg" className="flex-1 rounded-xl" data-testid="button-download-all">
              <FileDown className="w-5 h-5 mr-2" />
              {t('Common.actions.downloadAll', { defaultValue: 'Download All' })} ({compressionResults.length})
            </Button>
          )}
          <Button variant="outline" size="lg" onClick={reset} className={`rounded-xl ${compressionResults.length === 1 ? 'flex-1' : ''}`} data-testid="button-new-file">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('Common.actions.processAnother', { defaultValue: 'Process Another' })}
          </Button>
          {compressionResults.length > 1 && (
            <Button variant="outline" size="lg" onClick={handleShare} className="rounded-xl" data-testid="button-share">
              <Share2 className="w-4 h-4 mr-2" />
              {t('Common.actions.share', { defaultValue: 'Share' })}
            </Button>
          )}
        </div>
        
        <PrivacyNote variant="success" />
        
        <RelatedTools currentToolId="compress-image" category="image-edit" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => e.target.files && addFiles(e.target.files)}
        className="hidden"
        data-testid="input-file-image"
      />

      <Card className="bg-muted/30 overflow-visible">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Label className="font-medium">{t('Common.messages.quality', { defaultValue: 'Quality' })}</Label>
              <span className="text-xl font-bold text-primary">{quality}%</span>
            </div>
            <Slider
              value={[quality]}
              onValueChange={(values) => setQuality(values[0])}
              min={10}
              max={100}
              step={5}
              className="w-full"
              data-testid="slider-quality"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Label className="font-medium">{t('Common.messages.maxWidth', { defaultValue: 'Max Width' })}</Label>
              <span className="text-xl font-bold text-primary">{maxSize}px</span>
            </div>
            <Slider
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

      {files.length === 0 && (
        <>
          <FileUploadZone
            onFileSelect={(fileList) => addFiles(fileList)}
            accept="image/*"
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
                  {file.previewUrl ? (
                    <img
                      src={file.previewUrl}
                      alt={file.file.name}
                      className="w-12 h-12 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <Image className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium truncate block">{file.file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(file.file.size)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                    data-testid={`button-remove-file-${index}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>
            
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleCompress}
                size="lg"
                className="flex-1 rounded-xl"
                data-testid="button-compress"
              >
                <Image className="w-5 h-5 mr-2" />
                {t('Common.actions.compress')}
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
