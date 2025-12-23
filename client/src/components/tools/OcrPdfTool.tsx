import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { createWorker, Worker } from 'tesseract.js';
import { useStagedProcessing } from '@/hooks/useStagedProcessing';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { StagedLoadingOverlay } from '@/components/StagedLoadingOverlay';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, CheckCircle, Scan, Trash2, Copy, Info } from 'lucide-react';
import { FileUploadZone } from '@/components/tool-ui';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

type ToolStatus = 'idle' | 'processing' | 'success' | 'error';

const LANGUAGES = [
  { code: 'eng', name: 'English' },
  { code: 'kor', name: 'Korean' },
  { code: 'jpn', name: 'Japanese' },
  { code: 'chi_sim', name: 'Chinese (Simplified)' },
  { code: 'spa', name: 'Spanish' },
  { code: 'fra', name: 'French' },
  { code: 'deu', name: 'German' },
];

export default function OcrPdfTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ToolStatus>('idle');
  const [error, setError] = useState<{ code: string } | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [language, setLanguage] = useState('eng');
  const workerRef = useRef<Worker | null>(null);

  const stagedProcessing = useStagedProcessing({
    minDuration: 5000,
    stages: [
      { name: 'analyzing', duration: 1500, message: t('Common.stages.initializingOcr', { defaultValue: 'Initializing OCR engine...' }) },
      { name: 'processing', duration: 2500, message: t('Common.stages.recognizingText', { defaultValue: 'Recognizing text...' }) },
      { name: 'optimizing', duration: 1000, message: t('Common.stages.finalizingDocument', { defaultValue: 'Finalizing document...' }) },
    ],
  });

  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const handleFilesFromDropzone = useCallback((fileList: FileList) => {
    const selectedFile = fileList[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setStatus('idle');
      setError(null);
      setResultBlob(null);
    }
  }, []);

  const handleOcr = async () => {
    if (!file) return;

    setStatus('processing');
    setError(null);

    try {
      await stagedProcessing.runStagedProcessing(async () => {
        const worker = await createWorker(language, 1);
        workerRef.current = worker;

        const arrayBuffer = await file.arrayBuffer();
        const pdfData = new Uint8Array(arrayBuffer);
        
        const pdf = await pdfjs.getDocument({ data: pdfData }).promise;
        const totalPages = pdf.numPages;
        
        const newPdfDoc = await PDFDocument.create();
        const scale = 2;
        const allExtractedText: string[] = [];

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

          const imageData = canvas.toDataURL('image/png');
          
          const { data: { text } } = await worker.recognize(imageData);
          
          if (text.trim()) {
            allExtractedText.push(`--- Page ${i} ---\n${text.trim()}`);
          }

          const pngResponse = await fetch(imageData);
          const pngBytes = new Uint8Array(await pngResponse.arrayBuffer());
          const pngImage = await newPdfDoc.embedPng(pngBytes);
          
          const pageWidth = viewport.width / scale;
          const pageHeight = viewport.height / scale;
          const newPage = newPdfDoc.addPage([pageWidth, pageHeight]);
          
          newPage.drawImage(pngImage, {
            x: 0,
            y: 0,
            width: pageWidth,
            height: pageHeight,
          });
        }
        
        const extractedTextContent = allExtractedText.join('\n\n');

        await worker.terminate();
        workerRef.current = null;

        const pdfBytes = await newPdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        setResultBlob(blob);
        setExtractedText(extractedTextContent);
        return blob;
      });
      setStatus('success');
    } catch (err) {
      console.error('OCR error:', err);
      if (workerRef.current) {
        await workerRef.current.terminate();
        workerRef.current = null;
      }
      setError({ code: 'OCR_FAILED' });
      setStatus('error');
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace('.pdf', '_ocr.pdf');
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setResultBlob(null);
    setExtractedText('');
    setStatus('idle');
    stagedProcessing.reset();
  };

  return (
    <div className="space-y-6">
      {!file && (
        <>
          <div className="p-4 bg-muted/30 rounded-lg flex items-start gap-3">
            <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {t('Tools.ocr-pdf.explanation', 'Use this tool for scanned documents or image-based PDFs where text cannot be selected. The OCR engine recognizes text from images and makes it searchable and copyable.')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('Tools.ocr-pdf.textExtractHint', 'For PDFs where you can already select text, use the PDF Text Extraction tool for faster and more accurate results.')}
              </p>
            </div>
          </div>
          <FileUploadZone
            onFileSelect={handleFilesFromDropzone}
            accept="application/pdf"
            multiple={false}
          />
        </>
      )}

      {file && status === 'idle' && (
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
              onClick={reset}
              data-testid="button-remove-file"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label>{t('Tools.ocr-pdf.language')}</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger data-testid="select-language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="text-sm text-destructive">{t(`Errors.${error.code}`)}</p>
          )}

          <Button
            className="w-full"
            onClick={handleOcr}
            data-testid="button-ocr"
          >
            <Scan className="w-4 h-4 mr-2" />
            {t('Tools.ocr-pdf.ocrButton')}
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
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold">{t('Common.workflow.processingComplete')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('Tools.ocr-pdf.successMessage')}
              </p>
            </div>
          </div>
          
          {extractedText && (
            <Card className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t('Tools.ocr-pdf.extractedText', { defaultValue: 'Extracted Text' })}</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await navigator.clipboard.writeText(extractedText);
                    toast({
                      title: t('Common.messages.complete'),
                      description: t('Common.actions.copy'),
                    });
                  }}
                  data-testid="button-copy-text"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  {t('Common.copy', { defaultValue: 'Copy' })}
                </Button>
              </div>
              <Textarea
                value={extractedText}
                readOnly
                rows={8}
                className="font-mono text-sm"
                data-testid="textarea-extracted-text"
              />
            </Card>
          )}
          
          <div className="flex gap-3">
            <Button size="lg" onClick={handleDownload} className="flex-1" data-testid="button-download">
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
