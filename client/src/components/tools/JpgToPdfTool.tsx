import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler } from '@/hooks/useFileHandler';
import { useStagedProcessing } from '@/hooks/useStagedProcessing';
import { imagesToPdf, imageToIndividualPdfs } from '@/lib/engines/imageToPdf';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { StagedLoadingOverlay } from '@/components/StagedLoadingOverlay';
import { Download, CheckCircle, X, FileStack, Files } from 'lucide-react';
import { FileUploadZone } from '@/components/tool-ui';

type ConversionMode = 'merge' | 'individual';

export default function JpgToPdfTool() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<ConversionMode>('merge');
  const [individualPdfs, setIndividualPdfs] = useState<Blob[]>([]);
  
  const {
    files,
    status,
    error,
    resultBlob,
    addFiles,
    removeFile,
    setStatus,
    setError,
    setResult,
    downloadResult,
    reset: resetHandler,
  } = useFileHandler({ accept: 'image/jpeg,image/jpg,image/png', multiple: true });

  const stagedProcessing = useStagedProcessing({
    minDuration: 3000,
    stages: [
      { name: 'analyzing', duration: 800, message: t('Common.stages.readingImages', { defaultValue: 'Reading images...' }) },
      { name: 'processing', duration: 1400, message: t('Common.stages.creatingPdf', { defaultValue: 'Creating PDF document...' }) },
      { name: 'optimizing', duration: 800, message: t('Common.stages.finalizingDocument', { defaultValue: 'Finalizing document...' }) },
    ],
  });

  const handleFilesFromDropzone = useCallback((fileList: FileList) => {
    addFiles(fileList);
  }, [addFiles]);

  const handleConvert = useCallback(async () => {
    if (files.length === 0) return;

    setStatus('processing');
    setError(null);
    setIndividualPdfs([]);

    try {
      await stagedProcessing.runStagedProcessing(async () => {
        const buffers = files
          .map((f) => f.arrayBuffer)
          .filter((buffer): buffer is ArrayBuffer => buffer !== null);
        
        const fileTypes = files.map((f) => f.file.type);

        if (mode === 'merge') {
          const pdfBlob = await imagesToPdf(buffers, fileTypes);
          setResult(pdfBlob);
          return pdfBlob;
        } else {
          const pdfs = await imageToIndividualPdfs(buffers, fileTypes);
          setIndividualPdfs(pdfs);
          return pdfs;
        }
      });
      setStatus('success');
    } catch {
      setError({ code: 'CONVERSION_FAILED' });
      setStatus('error');
    }
  }, [files, mode, setStatus, setError, setResult, stagedProcessing]);

  const handleDownload = useCallback(() => {
    downloadResult(`unitools_images_converted.pdf`);
  }, [downloadResult]);

  const handleDownloadIndividual = useCallback((blob: Blob, index: number) => {
    const originalName = files[index]?.file.name.replace(/\.[^/.]+$/, '') || `image_${index + 1}`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unitools_${originalName}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }, [files]);

  const handleDownloadAllZip = useCallback(async () => {
    if (individualPdfs.length === 0) return;
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    individualPdfs.forEach((blob, index) => {
      const originalName = files[index]?.file.name.replace(/\.[^/.]+$/, '') || `image_${index + 1}`;
      zip.file(`${originalName}.pdf`, blob);
    });
    
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'unitools_converted_pdfs.zip';
    a.click();
    URL.revokeObjectURL(url);
  }, [individualPdfs, files]);

  const reset = useCallback(() => {
    resetHandler();
    stagedProcessing.reset();
    setIndividualPdfs([]);
  }, [resetHandler, stagedProcessing]);

  const formatFileSize = useCallback((bytes: number): string => {
    const k = 1024;
    if (bytes < k) return `${bytes} B`;
    if (bytes < k * k) return `${(bytes / k).toFixed(1)} KB`;
    return `${(bytes / (k * k)).toFixed(1)} MB`;
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground" data-testid="text-instructions">
        {t('Tools.jpg-to-pdf.description')}
      </div>

      {status === 'idle' && (
        <>
          <FileUploadZone
            onFileSelect={handleFilesFromDropzone}
            accept="image/*"
            multiple={true}
          />

          {files.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm font-medium">
                {t('Common.workflow.filesSelected', { count: files.length })}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-64 overflow-auto">
                {files.map((file) => (
                  <Card key={file.id} className="p-2 relative group">
                    {file.previewUrl && (
                      <img 
                        src={file.previewUrl} 
                        alt={file.file.name}
                        className="w-full h-24 object-cover rounded"
                      />
                    )}
                    <p className="text-xs truncate mt-1">{file.file.name}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                      data-testid={`button-remove-${file.id}`}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Card>
                ))}
              </div>

              {files.length > 1 && (
                <Card className="p-4">
                  <Label className="text-sm font-medium mb-3 block">{t('Tools.jpg-to-pdf.conversionMode', '변환 모드')}</Label>
                  <RadioGroup
                    value={mode}
                    onValueChange={(value) => setMode(value as ConversionMode)}
                    className="grid grid-cols-2 gap-3"
                    data-testid="radio-conversion-mode"
                  >
                    <Label
                      htmlFor="merge"
                      className={`flex flex-col items-center gap-2 p-4 rounded-md border-2 cursor-pointer transition-colors ${
                        mode === 'merge' ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <RadioGroupItem value="merge" id="merge" className="sr-only" />
                      <FileStack className="w-5 h-5" />
                      <span className="text-sm font-medium">{t('Tools.jpg-to-pdf.mergeMode', '하나로 병합')}</span>
                      <span className="text-xs text-muted-foreground text-center">{t('Tools.jpg-to-pdf.mergeDesc', '모든 이미지를 하나의 PDF로')}</span>
                    </Label>
                    <Label
                      htmlFor="individual"
                      className={`flex flex-col items-center gap-2 p-4 rounded-md border-2 cursor-pointer transition-colors ${
                        mode === 'individual' ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <RadioGroupItem value="individual" id="individual" className="sr-only" />
                      <Files className="w-5 h-5" />
                      <span className="text-sm font-medium">{t('Tools.jpg-to-pdf.individualMode', '개별 변환')}</span>
                      <span className="text-xs text-muted-foreground text-center">{t('Tools.jpg-to-pdf.individualDesc', '각 이미지를 별도의 PDF로')}</span>
                    </Label>
                  </RadioGroup>
                </Card>
              )}

              <div className="flex gap-3">
                <Button onClick={handleConvert} className="flex-1" data-testid="button-convert">
                  {t('Tools.jpg-to-pdf.title')}
                </Button>
                <Button variant="outline" onClick={reset} data-testid="button-reset">
                  {t('Common.workflow.startOver')}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <StagedLoadingOverlay
        stage={stagedProcessing.stage}
        progress={stagedProcessing.progress}
        stageProgress={stagedProcessing.stageProgress}
        message={stagedProcessing.message}
        error={stagedProcessing.error}
      />

      {status === 'success' && resultBlob && mode === 'merge' && (
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

      {status === 'success' && individualPdfs.length > 0 && mode === 'individual' && (
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold">{t('Common.workflow.processingComplete')}</h3>
              <p className="text-muted-foreground">
                {individualPdfs.length} {t('Tools.jpg-to-pdf.pdfsCreated', 'PDF 파일 생성됨')}
              </p>
            </div>
          </div>

          <Button onClick={handleDownloadAllZip} className="w-full" data-testid="button-download-all-zip">
            <Download className="w-4 h-4 mr-2" />
            {t('Common.workflow.downloadAllAsZip', 'ZIP으로 모두 다운로드')}
          </Button>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {individualPdfs.map((blob, index) => {
              const originalName = files[index]?.file.name.replace(/\.[^/.]+$/, '') || `image_${index + 1}`;
              return (
                <Card 
                  key={index} 
                  className="p-3 cursor-pointer hover-elevate"
                  onClick={() => handleDownloadIndividual(blob, index)}
                  data-testid={`card-pdf-${index}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                      <FileStack className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{originalName}.pdf</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(blob.size)}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Button variant="outline" onClick={reset} className="w-full" data-testid="button-convert-more">
            {t('Common.workflow.startOver')}
          </Button>
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
