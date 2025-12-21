import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { createWorker, Worker } from 'tesseract.js';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Loader2, CheckCircle, Scan, Trash2, Copy } from 'lucide-react';
import { FileUploadZone } from '@/components/tool-ui';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

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
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [error, setError] = useState<{ code: string } | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [language, setLanguage] = useState('eng');
  const workerRef = useRef<Worker | null>(null);

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
    setProgress(5);
    setProgressText(t('Tools.ocr-pdf.loadingPdf'));
    setError(null);

    try {
      setProgressText(t('Tools.ocr-pdf.initializingOcr', { defaultValue: 'Initializing OCR engine...' }));
      
      const worker = await createWorker(language, 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(25 + (60 * m.progress));
          }
        }
      });
      workerRef.current = worker;

      const arrayBuffer = await file.arrayBuffer();
      const pdfData = new Uint8Array(arrayBuffer);
      
      setProgressText(t('Tools.ocr-pdf.loadingPdf'));
      const pdf = await pdfjs.getDocument({ data: pdfData }).promise;
      const totalPages = pdf.numPages;
      
      const newPdfDoc = await PDFDocument.create();
      const scale = 2;
      const allExtractedText: string[] = [];

      for (let i = 1; i <= totalPages; i++) {
        setProgressText(t('Tools.ocr-pdf.processingPage', { current: i, total: totalPages }));
        
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

        setProgress(5 + (20 * i / totalPages));
        
        const imageData = canvas.toDataURL('image/png');
        
        setProgressText(t('Tools.ocr-pdf.recognizing', { current: i, total: totalPages }));
        
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

        setProgress(25 + (60 * i / totalPages));
      }
      
      const extractedTextContent = allExtractedText.join('\n\n');

      await worker.terminate();
      workerRef.current = null;

      setProgressText(t('Tools.ocr-pdf.saving'));
      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setResultBlob(blob);
      setExtractedText(extractedTextContent);
      setStatus('success');
      setProgress(100);
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

          {status === 'processing' && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">
                {progressText}
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{t(`Errors.${error.code}`)}</p>
          )}

          <Button
            className="w-full"
            onClick={handleOcr}
            disabled={status === 'processing'}
            data-testid="button-ocr"
          >
            {status === 'processing' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('Common.processing')}
              </>
            ) : (
              <>
                <Scan className="w-4 h-4 mr-2" />
                {t('Tools.ocr-pdf.ocrButton')}
              </>
            )}
          </Button>
        </Card>
      )}

      {status === 'success' && resultBlob && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="font-medium">{t('Common.success')}</p>
              <p className="text-sm text-muted-foreground">
                {t('Tools.ocr-pdf.successMessage')}
              </p>
            </div>
          </div>
          
          {extractedText && (
            <div className="space-y-2">
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
            </div>
          )}
          
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
                setExtractedText('');
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
