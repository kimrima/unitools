import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler, type FileHandlerError } from '@/hooks/useFileHandler';
import { convertImages, ImageConvertError, getFormatExtension, type ConvertResult, type ImageFormat } from '@/lib/engines/imageConvert';
import { getFileSizeData } from '@/lib/engines/imageCompress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Image, Upload, X, Download, Loader2, RefreshCw } from 'lucide-react';
import { downloadBlob } from '@/hooks/useToolEngine';

export default function ConvertImageTool() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('jpeg');
  const [convertResults, setConvertResults] = useState<ConvertResult[]>([]);
  
  const {
    files,
    status,
    error,
    progress,
    addFiles,
    removeFile,
    clearFiles,
    setStatus,
    setError,
    setProgress,
    reset: resetHandler,
  } = useFileHandler({ accept: 'image/*', multiple: true });

  const formatFileSize = useCallback((bytes: number): string => {
    const data = getFileSizeData(bytes);
    return `${data.value} ${t(`Common.units.${data.unit}`)}`;
  }, [t]);

  const translateError = useCallback((err: FileHandlerError | ImageConvertError | null): string => {
    if (!err) return '';
    
    if (err instanceof ImageConvertError) {
      if (err.fileName) {
        return `${t(`Common.errors.${err.code}`)}: ${err.fileName}`;
      }
      return t(`Common.errors.${err.code}`);
    }
    
    if ('code' in err) {
      return t(`Common.errors.${err.code}`);
    }
    
    return t('Common.messages.error');
  }, [t]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
      setConvertResults([]);
    }
  }, [addFiles]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type.startsWith('image/')
    );
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
      setConvertResults([]);
    }
  }, [addFiles]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleConvert = useCallback(async () => {
    if (files.length === 0) {
      setError({ code: 'NO_FILES_SELECTED' });
      return;
    }

    setStatus('processing');
    setProgress(0);
    setError(null);
    setConvertResults([]);

    try {
      const results = await convertImages(
        files.map(f => f.file),
        { format: targetFormat, quality: 0.92 },
        (prog) => {
          setProgress(prog.percentage);
        }
      );

      setConvertResults(results);
      setStatus('success');
    } catch (err) {
      if (err instanceof ImageConvertError) {
        setError({ code: err.code });
      } else {
        setError({ code: 'PROCESSING_FAILED' });
      }
      setStatus('error');
    }
  }, [files, targetFormat, setStatus, setProgress, setError]);

  const handleDownload = useCallback((result: ConvertResult) => {
    const baseName = result.originalFile.name.substring(0, result.originalFile.name.lastIndexOf('.'));
    const extension = getFormatExtension(result.newFormat);
    downloadBlob(result.convertedBlob, `unitools_${baseName}${extension}`);
  }, []);

  const handleDownloadAll = useCallback(() => {
    convertResults.forEach((result) => {
      handleDownload(result);
    });
  }, [convertResults, handleDownload]);

  const reset = useCallback(() => {
    resetHandler();
    setConvertResults([]);
  }, [resetHandler]);

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground" data-testid="text-instructions">
        {t('Tools.convert-image.instructions')}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <Label htmlFor="format-select">{t('Common.messages.targetFormat')}</Label>
            <Select value={targetFormat} onValueChange={(v) => setTargetFormat(v as ImageFormat)}>
              <SelectTrigger id="format-select" data-testid="select-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jpeg">JPG</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="webp">WebP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-file-image"
      />

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
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

      {files.length > 0 && convertResults.length === 0 && (
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
                    onClick={() => removeFile(file.id)}
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

      {status === 'processing' && (
        <div className="space-y-2" data-testid="section-processing">
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{t('Common.messages.convertingImage')}</span>
          </div>
          <Progress value={progress} className="h-2" data-testid="progress-bar" />
        </div>
      )}

      {convertResults.length > 0 && (
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="font-medium text-green-700 dark:text-green-300">
                {t('Common.messages.complete')}
              </p>
              {convertResults.length > 1 && (
                <Button onClick={handleDownloadAll} size="sm" data-testid="button-download-all">
                  <Download className="w-4 h-4 mr-2" />
                  {t('Common.actions.download')} ({convertResults.length})
                </Button>
              )}
            </div>

            <ul className="space-y-3" data-testid="list-results">
              {convertResults.map((result, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 p-3 bg-white dark:bg-background rounded-md border"
                  data-testid={`result-item-${index}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{result.originalFile.name}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground mt-1 flex-wrap">
                      <span>{result.originalFormat.toUpperCase()} → {result.newFormat.toUpperCase()}</span>
                      <span>{formatFileSize(result.originalSize)} → {formatFileSize(result.convertedSize)}</span>
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
      )}

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg" data-testid="section-error">
          {translateError(error)}
        </div>
      )}

      <div className="flex gap-4 flex-wrap">
        <Button
          onClick={handleConvert}
          disabled={files.length === 0 || status === 'processing'}
          className="flex-1"
          data-testid="button-convert"
        >
          {status === 'processing' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('Common.messages.processing')}
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('Common.actions.convert')}
            </>
          )}
        </Button>
        
        {(status === 'success' || status === 'error') && (
          <Button variant="outline" onClick={reset} data-testid="button-reset">
            {t('Common.actions.reset')}
          </Button>
        )}
      </div>
    </div>
  );
}
