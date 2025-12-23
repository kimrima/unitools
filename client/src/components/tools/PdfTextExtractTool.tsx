import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import * as pdfjs from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useStagedProcessing } from '@/hooks/useStagedProcessing';
import { StagedLoadingOverlay } from '@/components/StagedLoadingOverlay';
import { FileText, Download, CheckCircle, Trash2, Copy, Info } from 'lucide-react';
import { FileUploadZone } from '@/components/tool-ui';
import { useToast } from '@/hooks/use-toast';

type ToolStatus = 'idle' | 'processing' | 'success' | 'error';

export default function PdfTextExtractTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ToolStatus>('idle');
  const [error, setError] = useState<{ code: string } | null>(null);
  const [extractedText, setExtractedText] = useState('');

  const stagedProcessing = useStagedProcessing({
    minDuration: 2000,
    stages: [
      { name: 'analyzing', duration: 500, message: t('Common.stages.loadingDocument', { defaultValue: 'Loading document...' }) },
      { name: 'processing', duration: 1000, message: t('Common.stages.extractingText', { defaultValue: 'Extracting text...' }) },
      { name: 'optimizing', duration: 500, message: t('Common.stages.finalizingDocument', { defaultValue: 'Finalizing...' }) },
    ],
  });

  const handleFilesFromDropzone = useCallback((fileList: FileList) => {
    const selectedFile = fileList[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setStatus('idle');
      setError(null);
      setExtractedText('');
    }
  }, []);

  const handleExtract = async () => {
    if (!file) return;

    setStatus('processing');
    setError(null);

    try {
      const result = await stagedProcessing.runStagedProcessing(async () => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: unknown) => {
              const textItem = item as { str?: string };
              return textItem.str || '';
            })
            .join(' ');
          fullText += `--- Page ${i} ---\n${pageText}\n\n`;
        }
        
        return fullText.trim();
      });
      
      if (result) {
        setExtractedText(result as string);
        setStatus('success');
      } else {
        setError({ code: 'NO_TEXT_FOUND' });
        setStatus('error');
      }
    } catch {
      setError({ code: 'EXTRACT_FAILED' });
      setStatus('error');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(extractedText);
      toast({
        title: t('Common.messages.copied'),
        description: t('Tools.pdf-text-extract.copiedMessage', 'Text copied to clipboard.'),
      });
    } catch {
      toast({
        title: t('Common.errors.COPY_FAILED', 'Failed to copy'),
        variant: 'destructive',
      });
    }
  };

  const handleDownload = () => {
    if (!extractedText || !file) return;
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace('.pdf', '.txt');
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {!file && (
        <>
          <div className="p-4 bg-muted/30 rounded-lg flex items-start gap-3">
            <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {t('Tools.pdf-text-extract.explanation', 'This tool extracts selectable text that is embedded in PDF files. It works for PDFs created from text documents, Word files, or web pages.')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('Tools.pdf-text-extract.ocrHint', 'For scanned documents or image-based PDFs, use the OCR PDF tool instead.')}
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
                setExtractedText('');
              }}
              data-testid="button-remove-file"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg flex items-start gap-3">
            <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              {t('Tools.pdf-text-extract.explanation', 'This tool extracts selectable text that is embedded in PDF files. It works for PDFs created from text documents, Word files, or web pages.')}
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive" data-testid="text-error">{t(`Common.errors.${error.code}`, { defaultValue: t('Common.messages.error') })}</p>
          )}

          <Button
            className="w-full"
            onClick={handleExtract}
            disabled={status === 'processing'}
            data-testid="button-extract"
          >
            <FileText className="w-4 h-4 mr-2" />
            {t('Tools.pdf-text-extract.extractButton', 'Extract Text')}
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

      {status === 'success' && extractedText && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="font-medium">{t('Common.success')}</p>
              <p className="text-sm text-muted-foreground">
                {t('Tools.pdf-text-extract.successMessage', 'Text extracted successfully.')}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label data-testid="label-result-text">{t('Tools.pdf-text-extract.resultLabel', 'Extracted Text')}</Label>
            <Textarea
              value={extractedText}
              readOnly
              className="min-h-[200px] font-mono text-sm"
              data-testid="textarea-result"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleCopy} variant="outline" data-testid="button-copy">
              <Copy className="w-4 h-4 mr-2" />
              {t('Common.copy')}
            </Button>
            <Button onClick={handleDownload} data-testid="button-download">
              <Download className="w-4 h-4 mr-2" />
              {t('Common.download')}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setFile(null);
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
