import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useStagedProcessing } from '@/hooks/useStagedProcessing';
import { StagedLoadingOverlay } from '@/components/StagedLoadingOverlay';
import { FileText, Download, CheckCircle, Crop, Trash2 } from 'lucide-react';
import { FileUploadZone } from '@/components/tool-ui';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

type ToolStatus = 'idle' | 'processing' | 'success' | 'error';

export default function CropPdfTool() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ToolStatus>('idle');
  const [error, setError] = useState<{ code: string } | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [margins, setMargins] = useState({ top: 0, right: 0, bottom: 0, left: 0 });
  const [pdfPageImage, setPdfPageImage] = useState<string | null>(null);
  const [pageDimensions, setPageDimensions] = useState({ width: 0, height: 0 });

  const stagedProcessing = useStagedProcessing({
    minDuration: 2500,
    stages: [
      { name: 'analyzing', duration: 600, message: t('Common.stages.loadingDocument', { defaultValue: 'Loading document...' }) },
      { name: 'processing', duration: 1200, message: t('Common.stages.croppingPages', { defaultValue: 'Cropping pages...' }) },
      { name: 'optimizing', duration: 700, message: t('Common.stages.finalizingDocument', { defaultValue: 'Finalizing document...' }) },
    ],
  });

  const renderPdfPage = useCallback(async (pdfFile: File) => {
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const scale = 1.5;
      const viewport = page.getViewport({ scale });
      
      setPageDimensions({ width: viewport.width / scale, height: viewport.height / scale });
      
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
      setPdfPageImage(canvas.toDataURL('image/png'));
    } catch {
      console.error('Failed to render PDF page');
    }
  }, []);

  useEffect(() => {
    if (file) {
      renderPdfPage(file);
    }
  }, [file, renderPdfPage]);

  const handleFilesFromDropzone = useCallback((fileList: FileList) => {
    const selectedFile = fileList[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setStatus('idle');
      setError(null);
      setResultBlob(null);
      setPdfPageImage(null);
    }
  }, []);

  const handleCrop = async () => {
    if (!file) return;

    setStatus('processing');
    setError(null);

    try {
      await stagedProcessing.runStagedProcessing(async () => {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();

        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          const { width, height } = page.getSize();
          
          const newX = margins.left;
          const newY = margins.bottom;
          const newWidth = width - margins.left - margins.right;
          const newHeight = height - margins.top - margins.bottom;

          if (newWidth > 0 && newHeight > 0) {
            page.setCropBox(newX, newY, newWidth, newHeight);
          }
        }

        const pdfBytes = await pdfDoc.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
      });
      setResultBlob(stagedProcessing.result as Blob);
      setStatus('success');
    } catch {
      setError({ code: 'CROP_FAILED' });
      setStatus('error');
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace('.pdf', '_cropped.pdf');
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {!file && (
        <FileUploadZone
          onFileSelect={handleFilesFromDropzone}
          accept="application/pdf"
          multiple={false}
        />
      )}

      {file && status !== 'success' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setFile(null);
                setResultBlob(null);
              }}
              data-testid="button-remove-file"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>{t('Tools.crop-pdf.marginTop')} (pt)</Label>
              <Input
                type="number"
                min={0}
                value={margins.top}
                onChange={(e) => setMargins(m => ({ ...m, top: parseInt(e.target.value) || 0 }))}
                data-testid="input-margin-top"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('Tools.crop-pdf.marginRight')} (pt)</Label>
              <Input
                type="number"
                min={0}
                value={margins.right}
                onChange={(e) => setMargins(m => ({ ...m, right: parseInt(e.target.value) || 0 }))}
                data-testid="input-margin-right"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('Tools.crop-pdf.marginBottom')} (pt)</Label>
              <Input
                type="number"
                min={0}
                value={margins.bottom}
                onChange={(e) => setMargins(m => ({ ...m, bottom: parseInt(e.target.value) || 0 }))}
                data-testid="input-margin-bottom"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('Tools.crop-pdf.marginLeft')} (pt)</Label>
              <Input
                type="number"
                min={0}
                value={margins.left}
                onChange={(e) => setMargins(m => ({ ...m, left: parseInt(e.target.value) || 0 }))}
                data-testid="input-margin-left"
              />
            </div>
          </div>

          {pdfPageImage && pageDimensions.width > 0 && (
            <div className="space-y-2">
              <Label>{t('Tools.crop-pdf.preview', 'Preview')}</Label>
              <div className="relative border rounded-lg overflow-hidden bg-muted/20 max-h-80 flex items-center justify-center">
                <div className="relative">
                  <img 
                    src={pdfPageImage} 
                    alt="PDF Preview" 
                    className="max-h-72 object-contain"
                    data-testid="img-pdf-preview"
                  />
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      borderTop: `${(margins.top / pageDimensions.height) * 100}%`,
                      borderBottom: `${(margins.bottom / pageDimensions.height) * 100}%`,
                      borderLeft: `${(margins.left / pageDimensions.width) * 100}%`,
                      borderRight: `${(margins.right / pageDimensions.width) * 100}%`,
                    }}
                  >
                    <div 
                      className="absolute border-2 border-dashed border-primary bg-primary/10"
                      style={{
                        top: `${(margins.top / pageDimensions.height) * 100}%`,
                        left: `${(margins.left / pageDimensions.width) * 100}%`,
                        right: `${(margins.right / pageDimensions.width) * 100}%`,
                        bottom: `${(margins.bottom / pageDimensions.height) * 100}%`,
                      }}
                      data-testid="crop-preview-overlay"
                    />
                    <div 
                      className="absolute bg-red-500/30"
                      style={{
                        top: 0,
                        left: 0,
                        right: 0,
                        height: `${(margins.top / pageDimensions.height) * 100}%`,
                      }}
                    />
                    <div 
                      className="absolute bg-red-500/30"
                      style={{
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: `${(margins.bottom / pageDimensions.height) * 100}%`,
                      }}
                    />
                    <div 
                      className="absolute bg-red-500/30"
                      style={{
                        top: `${(margins.top / pageDimensions.height) * 100}%`,
                        left: 0,
                        bottom: `${(margins.bottom / pageDimensions.height) * 100}%`,
                        width: `${(margins.left / pageDimensions.width) * 100}%`,
                      }}
                    />
                    <div 
                      className="absolute bg-red-500/30"
                      style={{
                        top: `${(margins.top / pageDimensions.height) * 100}%`,
                        right: 0,
                        bottom: `${(margins.bottom / pageDimensions.height) * 100}%`,
                        width: `${(margins.right / pageDimensions.width) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {t('Tools.crop-pdf.previewHint', 'Red areas will be cropped')}
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{t(`Errors.${error.code}`)}</p>
          )}

          <Button
            className="w-full"
            onClick={handleCrop}
            disabled={status === 'processing'}
            data-testid="button-crop"
          >
            <Crop className="w-4 h-4 mr-2" />
            {t('Tools.crop-pdf.cropButton')}
          </Button>
        </Card>
      )}

      <StagedLoadingOverlay
        stage={stagedProcessing.stage}
        progress={stagedProcessing.progress}
        stageProgress={stagedProcessing.stageProgress}
        message={stagedProcessing.message}
        error={stagedProcessing.error}
      />

      {status === 'success' && resultBlob && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="font-medium">{t('Common.success')}</p>
              <p className="text-sm text-muted-foreground">
                {t('Tools.crop-pdf.successMessage')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleDownload} className="flex-1" data-testid="button-download">
              <Download className="w-4 h-4 mr-2" />
              {t('Common.download')}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setFile(null);
                setResultBlob(null);
                setStatus('idle');
              }}
              data-testid="button-new"
            >
              {t('Common.processAnother')}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
