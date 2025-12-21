import { useCallback, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'wouter';
import { useFileHandler, type FileHandlerError } from '@/hooks/useFileHandler';
import { useStagedProcessing } from '@/hooks/useStagedProcessing';
import { convertImages, ImageConvertError, getFormatExtension, type ConvertResult, type ImageFormat } from '@/lib/engines/imageConvert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Image, X, RefreshCw, Download, Share2, FileDown } from 'lucide-react';
import { StagedLoadingOverlay } from '@/components/StagedLoadingOverlay';
import { allTools, type Tool } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { FileUploadZone, ResultSuccessHeader, FileResultCard, PrivacyNote, RelatedTools } from '@/components/tool-ui';

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
        />
      </div>
    );
  }
  
  if (showResults && results.length > 0) {
    const savedPercent = totalOriginalSize > totalOutputSize 
      ? Math.round((1 - totalOutputSize / totalOriginalSize) * 100)
      : 0;
    
    return (
      <div className="space-y-6">
        <ResultSuccessHeader
          subtitle={results.length === 1 
            ? t('Common.messages.readyToDownload', { defaultValue: 'Your file is ready to download' })
            : t('Common.messages.filesReadyToDownload', { count: results.length, defaultValue: `${results.length} files ready to download` })
          }
          stats={[
            { label: t('Common.messages.files', { defaultValue: 'Files' }), value: results.length },
            { label: t('Common.messages.originalSize', { defaultValue: 'Original' }), value: formatFileSize(totalOriginalSize) },
            { label: t('Common.messages.newSize', { defaultValue: 'New Size' }), value: formatFileSize(totalOutputSize) },
            { label: t('Common.messages.saved', { defaultValue: 'Saved' }), value: savedPercent > 0 ? `-${savedPercent}%` : 'N/A' },
          ]}
        />
        
        {results.length === 1 && (
          <FileResultCard
            fileName={results[0].fileName}
            fileSize={formatFileSize(results[0].outputSize)}
            fileType="image"
            previewUrl={results[0].previewUrl}
            onDownload={() => handleDownload(results[0])}
            onShare={handleShare}
          />
        )}
        
        {results.length > 1 && (
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium mb-4">{t('Common.messages.processedFiles', { defaultValue: 'Processed Files' })}</p>
              <ul className="space-y-2">
                {results.map((result, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl"
                    data-testid={`result-item-${index}`}
                  >
                    {result.previewUrl && (
                      <img src={result.previewUrl} alt="" className="w-12 h-12 object-cover rounded-lg" />
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
        
        {results.length > 1 && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleDownloadAll} size="lg" className="flex-1 rounded-xl" data-testid="button-download-all">
              <FileDown className="w-5 h-5 mr-2" />
              {t('Common.actions.downloadAll', { defaultValue: 'Download All' })} ({results.length})
            </Button>
            <Button variant="outline" size="lg" onClick={reset} className="rounded-xl" data-testid="button-new-file">
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('Common.actions.processAnother', { defaultValue: 'Process Another' })}
            </Button>
            <Button variant="outline" size="lg" onClick={handleShare} className="rounded-xl" data-testid="button-share">
              <Share2 className="w-4 h-4 mr-2" />
              {t('Common.actions.share', { defaultValue: 'Share' })}
            </Button>
          </div>
        )}
        
        {results.length === 1 && (
          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={reset} className="flex-1 rounded-xl" data-testid="button-new-file">
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('Common.actions.processAnother', { defaultValue: 'Process Another' })}
            </Button>
          </div>
        )}
        
        <PrivacyNote variant="success" />
        
        <RelatedTools currentToolId={toolId} category={tool?.category} />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {showFormatSelect && (
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="space-y-2">
              <Label htmlFor="format-select">{t('Common.messages.targetFormat')}</Label>
              <Select value={targetFormat} onValueChange={(v) => setTargetFormat(v as ImageFormat)}>
                <SelectTrigger id="format-select" className="rounded-xl" data-testid="select-format">
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

      {files.length === 0 && (
        <FileUploadZone
          onFileSelect={(fileList) => addFiles(fileList)}
          accept={config.acceptMime}
          multiple={true}
        />
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
                onClick={handleConvert}
                size="lg"
                className="flex-1 rounded-xl"
                data-testid="button-convert"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {t('Common.actions.convert')}
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
      
      {files.length === 0 && (
        <PrivacyNote />
      )}
    </div>
  );
}
