import { useCallback, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'wouter';
import { useFileHandler, type FileHandlerError } from '@/hooks/useFileHandler';
import { useStagedProcessing } from '@/hooks/useStagedProcessing';
import { convertImages, ImageConvertError, getFormatExtension, type ConvertResult, type ImageFormat } from '@/lib/engines/imageConvert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Image, Upload, X, RefreshCw, Download, CheckCircle, Share2, ExternalLink, FileDown } from 'lucide-react';
import { StagedLoadingOverlay } from '@/components/StagedLoadingOverlay';
import { AdSlot } from '@/components/AdSlot';
import { allTools, type Tool } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

interface ToolFormatConfig {
  acceptedFormats: string[];
  defaultTarget: ImageFormat;
  availableTargets: ImageFormat[];
  acceptMime: string;
}

const toolFormatConfigs: Record<string, ToolFormatConfig> = {
  'png-to-jpg': {
    acceptedFormats: ['PNG'],
    defaultTarget: 'jpeg',
    availableTargets: ['jpeg'],
    acceptMime: 'image/png',
  },
  'jpg-to-png': {
    acceptedFormats: ['JPG', 'JPEG'],
    defaultTarget: 'png',
    availableTargets: ['png'],
    acceptMime: 'image/jpeg',
  },
  'webp-to-jpg': {
    acceptedFormats: ['WebP'],
    defaultTarget: 'jpeg',
    availableTargets: ['jpeg'],
    acceptMime: 'image/webp',
  },
  'webp-to-png': {
    acceptedFormats: ['WebP'],
    defaultTarget: 'png',
    availableTargets: ['png'],
    acceptMime: 'image/webp',
  },
  'png-to-webp': {
    acceptedFormats: ['PNG'],
    defaultTarget: 'webp',
    availableTargets: ['webp'],
    acceptMime: 'image/png',
  },
  'jpg-to-webp': {
    acceptedFormats: ['JPG', 'JPEG'],
    defaultTarget: 'webp',
    availableTargets: ['webp'],
    acceptMime: 'image/jpeg',
  },
  'webp-converter': {
    acceptedFormats: ['JPG', 'PNG', 'GIF', 'BMP'],
    defaultTarget: 'webp',
    availableTargets: ['webp'],
    acceptMime: 'image/jpeg,image/png,image/gif,image/bmp',
  },
  'convert-image': {
    acceptedFormats: ['JPG', 'PNG', 'WebP', 'GIF', 'BMP'],
    defaultTarget: 'jpeg',
    availableTargets: ['jpeg', 'png', 'webp'],
    acceptMime: 'image/*',
  },
  'bulk-convert': {
    acceptedFormats: ['JPG', 'PNG', 'WebP', 'GIF', 'BMP'],
    defaultTarget: 'jpeg',
    availableTargets: ['jpeg', 'png', 'webp'],
    acceptMime: 'image/*',
  },
  'bulk-convert-image': {
    acceptedFormats: ['JPG', 'PNG', 'WebP', 'GIF', 'BMP'],
    defaultTarget: 'jpeg',
    availableTargets: ['jpeg', 'png', 'webp'],
    acceptMime: 'image/*',
  },
  'gif-to-png': {
    acceptedFormats: ['GIF'],
    defaultTarget: 'png',
    availableTargets: ['png'],
    acceptMime: 'image/gif',
  },
  'svg-to-png': {
    acceptedFormats: ['SVG'],
    defaultTarget: 'png',
    availableTargets: ['png'],
    acceptMime: 'image/svg+xml',
  },
};

interface ProcessedResult {
  blob: Blob;
  fileName: string;
  originalSize: number;
  outputSize: number;
  mimeType: string;
  previewUrl?: string;
}

interface ConvertImageToolProps {
  toolId?: string;
}

export default function ConvertImageTool({ toolId = 'convert-image' }: ConvertImageToolProps) {
  const { t, i18n } = useTranslation();
  const params = useParams<{ locale: string }>();
  const locale = params.locale || i18n.language;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const config = toolFormatConfigs[toolId] || toolFormatConfigs['convert-image'];
  const [targetFormat, setTargetFormat] = useState<ImageFormat>(config.defaultTarget);
  const [results, setResults] = useState<ProcessedResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  const tool = allTools.find((t: Tool) => t.id === toolId);
  const relatedTools = tool?.relatedTools?.slice(0, 4).map((id: string) => allTools.find((t: Tool) => t.id === id)).filter(Boolean) as Tool[] || [];
  
  const {
    files,
    error,
    addFiles,
    removeFile,
    clearFiles,
    setError,
    reset: resetHandler,
  } = useFileHandler({ accept: config.acceptMime, multiple: true });
  
  const stagedProcessing = useStagedProcessing({
    minDuration: 4500,
    stages: [
      { name: 'analyzing', duration: 1200, message: t('Common.stages.analyzingFiles', { defaultValue: 'Analyzing files...' }) },
      { name: 'processing', duration: 2000, message: t('Common.stages.convertingFormat', { defaultValue: 'Converting format...' }) },
      { name: 'optimizing', duration: 1300, message: t('Common.stages.optimizing', { defaultValue: 'Optimizing output...' }) },
    ],
  });
  
  useEffect(() => {
    return () => {
      results.forEach(r => {
        if (r.previewUrl) URL.revokeObjectURL(r.previewUrl);
      });
    };
  }, [results]);

  const showFormatSelect = config.availableTargets.length > 1;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const translateError = (err: FileHandlerError): string => {
    const messages: Record<string, string> = {
      'INVALID_TYPE': t('Common.errors.invalidFileType'),
      'TOO_LARGE': t('Common.errors.fileTooLarge'),
      'TOO_MANY_FILES': t('Common.errors.tooManyFiles'),
      'NO_FILES_SELECTED': t('Common.errors.noFilesSelected'),
      'PROCESSING_FAILED': t('Common.errors.processingFailed'),
    };
    return messages[err.code] || t('Common.errors.unknownError');
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
  }, [addFiles]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const acceptedMimes = config.acceptMime === 'image/*' 
      ? null 
      : config.acceptMime.split(',');
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) => {
      if (!file.type.startsWith('image/')) return false;
      if (!acceptedMimes) return true;
      return acceptedMimes.some(mime => file.type === mime.trim());
    });
    
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  }, [addFiles, config.acceptMime]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleConvert = useCallback(async () => {
    if (files.length === 0) {
      setError({ code: 'NO_FILES_SELECTED' });
      return;
    }

    setError(null);

    try {
      await stagedProcessing.runStagedProcessing(
        async () => {
          const convertResults = await convertImages(
            files.map(f => f.file),
            { format: targetFormat, quality: 0.92 },
            () => {}
          );
          return convertResults;
        },
        (convertResults) => {
          if (convertResults.length > 0) {
            const processed: ProcessedResult[] = convertResults.map(r => {
              const previewUrl = URL.createObjectURL(r.convertedBlob);
              return {
                blob: r.convertedBlob,
                fileName: `unitools_${r.originalFile.name.substring(0, r.originalFile.name.lastIndexOf('.'))}.${getFormatExtension(r.newFormat).slice(1)}`,
                originalSize: r.originalSize,
                outputSize: r.convertedSize,
                mimeType: r.convertedBlob.type,
                previewUrl,
              };
            });
            setResults(processed);
            setShowResults(true);
          }
        }
      );
    } catch (err) {
      if (err instanceof ImageConvertError) {
        setError({ code: err.code });
      } else {
        setError({ code: 'PROCESSING_FAILED' });
      }
    }
  }, [files, targetFormat, setError, stagedProcessing]);

  const reset = useCallback(() => {
    results.forEach(r => {
      if (r.previewUrl) URL.revokeObjectURL(r.previewUrl);
    });
    setResults([]);
    setShowResults(false);
    resetHandler();
    stagedProcessing.reset();
  }, [resetHandler, stagedProcessing, results]);

  const handleDownload = (result: ProcessedResult) => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: t('Common.messages.downloadStarted', { defaultValue: 'Download started' }),
      description: result.fileName,
    });
  };
  
  const handleDownloadAll = () => {
    results.forEach((result, index) => {
      setTimeout(() => handleDownload(result), index * 300);
    });
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t(`Tools.${toolId}.title`),
          text: t('Common.messages.shareText', { defaultValue: 'Check out this free tool!' }),
          url: window.location.href,
        });
      } catch { }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: t('Common.messages.copied', { defaultValue: 'Link copied!' }),
      });
    }
  };

  const formatLabels: Record<ImageFormat, string> = {
    jpeg: 'JPG',
    png: 'PNG',
    webp: 'WebP',
  };
  
  const totalOriginalSize = results.reduce((sum, r) => sum + r.originalSize, 0);
  const totalOutputSize = results.reduce((sum, r) => sum + r.outputSize, 0);

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
          showAds={true}
        />
      </div>
    );
  }
  
  if (showResults && results.length > 0) {
    return (
      <div className="space-y-6">
        <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-green-700 dark:text-green-300">
                  {t('Common.messages.processingComplete', { defaultValue: 'Processing Complete!' })}
                </CardTitle>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {results.length === 1 
                    ? t('Common.messages.readyToDownload', { defaultValue: 'Your file is ready to download' })
                    : t('Common.messages.filesReadyToDownload', { count: results.length, defaultValue: `${results.length} files ready to download` })}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-background/50 rounded-lg">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">{t('Common.messages.files', { defaultValue: 'Files' })}</p>
                <p className="font-medium">{results.length}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">{t('Common.messages.originalSize', { defaultValue: 'Original' })}</p>
                <p className="font-medium">{formatFileSize(totalOriginalSize)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">{t('Common.messages.newSize', { defaultValue: 'New Size' })}</p>
                <p className="font-medium">{formatFileSize(totalOutputSize)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">{t('Common.messages.saved', { defaultValue: 'Saved' })}</p>
                <p className="font-medium text-green-600">
                  {totalOriginalSize > totalOutputSize 
                    ? `-${Math.round((1 - totalOutputSize / totalOriginalSize) * 100)}%`
                    : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {results.length === 1 && results[0].previewUrl && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('Common.messages.preview', { defaultValue: 'Preview' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <img src={results[0].previewUrl} alt="Result preview" className="max-h-64 mx-auto rounded-lg object-contain" />
            </CardContent>
          </Card>
        )}
        
        {results.length > 1 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('Common.messages.processedFiles', { defaultValue: 'Processed Files' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {results.map((result, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-md"
                    data-testid={`result-item-${index}`}
                  >
                    {result.previewUrl && (
                      <img src={result.previewUrl} alt="" className="w-10 h-10 object-cover rounded" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{result.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(result.originalSize)} → {formatFileSize(result.outputSize)}
                      </p>
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
        
        <div className="flex flex-col sm:flex-row gap-3">
          {results.length === 1 ? (
            <Button onClick={() => handleDownload(results[0])} size="lg" className="flex-1" data-testid="button-download-result">
              <Download className="w-5 h-5 mr-2" />
              {t('Common.actions.download', { defaultValue: 'Download' })}
            </Button>
          ) : (
            <Button onClick={handleDownloadAll} size="lg" className="flex-1" data-testid="button-download-all">
              <FileDown className="w-5 h-5 mr-2" />
              {t('Common.actions.downloadAll', { defaultValue: 'Download All' })} ({results.length})
            </Button>
          )}
          <Button variant="outline" size="lg" onClick={reset} data-testid="button-new-file">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('Common.actions.processAnother', { defaultValue: 'Process Another' })}
          </Button>
          <Button variant="outline" size="lg" onClick={handleShare} data-testid="button-share">
            <Share2 className="w-4 h-4 mr-2" />
            {t('Common.actions.share', { defaultValue: 'Share' })}
          </Button>
        </div>
        
        <div className="flex justify-center">
          <AdSlot position="results" />
        </div>
        
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground text-center">
              {t('Common.messages.thankYou', { defaultValue: 'Thank you for using UniTools! Your support helps us maintain and improve this free service.' })}
            </p>
          </CardContent>
        </Card>
        
        {relatedTools.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {t('Common.messages.relatedTools', { defaultValue: 'You might also like' })}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {relatedTools.map(relatedTool => (
                <Link key={relatedTool.id} href={`/${locale}/${relatedTool.id}`}>
                  <Card className="p-3 hover-elevate cursor-pointer h-full">
                    <div className="flex flex-col items-center text-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {t(`Categories.${relatedTool.category}`)}
                      </Badge>
                      <span className="text-sm font-medium line-clamp-2">
                        {t(`Tools.${relatedTool.id}.title`)}
                      </span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-center">
          <AdSlot position="footer" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground" data-testid="text-instructions">
        {t(`Tools.${toolId}.instructions`, { defaultValue: t('Tools.convert-image.instructions') })}
      </div>

      {showFormatSelect && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <Label htmlFor="format-select">{t('Common.messages.targetFormat')}</Label>
              <Select value={targetFormat} onValueChange={(v) => setTargetFormat(v as ImageFormat)}>
                <SelectTrigger id="format-select" data-testid="select-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {config.availableTargets.map((format) => (
                    <SelectItem key={format} value={format}>
                      {formatLabels[format]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={config.acceptMime}
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

      {files.length > 0 && (
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

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg" data-testid="section-error">
          {translateError(error)}
        </div>
      )}

      <div className="flex gap-4 flex-wrap">
        <Button
          onClick={handleConvert}
          disabled={files.length === 0}
          className="flex-1"
          data-testid="button-convert"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('Common.actions.convert')}
        </Button>
        
        {files.length > 0 && (
          <Button variant="outline" onClick={reset} data-testid="button-reset">
            {t('Common.actions.reset')}
          </Button>
        )}
      </div>
    </div>
  );
}
