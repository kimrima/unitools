import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { useStagedProcessing } from '@/hooks/useStagedProcessing';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StagedLoadingOverlay } from '@/components/StagedLoadingOverlay';
import { FileText, Download, CheckCircle, Trash2 } from 'lucide-react';
import { FileUploadZone } from '@/components/tool-ui';

type ToolStatus = 'idle' | 'processing' | 'success' | 'error';

export default function GrayscalePdfTool() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ToolStatus>('idle');
  const [error, setError] = useState<{ code: string } | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const stagedProcessing = useStagedProcessing({
    minDuration: 3000,
    stages: [
      { name: 'analyzing', duration: 800, message: t('Common.stages.analyzingDocument', { defaultValue: 'Analyzing document...' }) },
      { name: 'processing', duration: 1400, message: t('Common.stages.convertingGrayscale', { defaultValue: 'Converting to grayscale...' }) },
      { name: 'optimizing', duration: 800, message: t('Common.stages.finalizingDocument', { defaultValue: 'Finalizing document...' }) },
    ],
  });

  const handleFilesFromDropzone = useCallback((fileList: FileList) => {
    const selectedFile = fileList[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setStatus('idle');
      setError(null);
      setResultBlob(null);
    }
  }, []);

  const handleConvert = async () => {
    if (!file) return;

    setStatus('processing');
    setError(null);

    try {
      await stagedProcessing.runStagedProcessing(async () => {
        const arrayBuffer = await file.arrayBuffer();
        const pdfData = new Uint8Array(arrayBuffer);
        
        const pdf = await pdfjs.getDocument({ data: pdfData }).promise;
        const totalPages = pdf.numPages;
        
        const newPdfDoc = await PDFDocument.create();
        const scale = 2;

        for (let i = 1; i <= totalPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale });
          
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Canvas context not available');
          
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: ctx,
            viewport,
            canvas,
          } as any).promise;

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          for (let j = 0; j < data.length; j += 4) {
            const gray = 0.299 * data[j] + 0.587 * data[j + 1] + 0.114 * data[j + 2];
            data[j] = gray;
            data[j + 1] = gray;
            data[j + 2] = gray;
          }
          
          ctx.putImageData(imageData, 0, 0);

          const pngDataUrl = canvas.toDataURL('image/png');
          const pngResponse = await fetch(pngDataUrl);
          const pngBytes = new Uint8Array(await pngResponse.arrayBuffer());
          
          const pngImage = await newPdfDoc.embedPng(pngBytes);
          const newPage = newPdfDoc.addPage([viewport.width / scale, viewport.height / scale]);
          newPage.drawImage(pngImage, {
            x: 0,
            y: 0,
            width: viewport.width / scale,
            height: viewport.height / scale,
          });
        }

        const pdfBytes = await newPdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        setResultBlob(blob);
        return blob;
      });
      setStatus('success');
    } catch {
      setError({ code: 'CONVERSION_FAILED' });
      setStatus('error');
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace('.pdf', '_grayscale.pdf');
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setResultBlob(null);
    setStatus('idle');
    stagedProcessing.reset();
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

      {file && status === 'idle' && (
        <Card className="p-6 space-y-4">
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
              onClick={reset}
              data-testid="button-remove-file"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {error && (
            <p className="text-sm text-destructive">{t(`Errors.${error.code}`)}</p>
          )}

          <Button
            className="w-full"
            onClick={handleConvert}
            data-testid="button-convert"
          >
            {t('Tools.grayscale-pdf.convertButton')}
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
        <div className="flex flex-col items-center gap-6 py-8">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">{t('Common.workflow.processingComplete')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('Tools.grayscale-pdf.successMessage')}
            </p>
          </div>
          <div className="flex gap-3">
            <Button size="lg" onClick={handleDownload} data-testid="button-download">
              <Download className="w-5 h-5 mr-2" />
              {t('Common.download')}
            </Button>
            <Button variant="outline" size="lg" onClick={reset} data-testid="button-new">
              {t('Common.processAnother')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
