import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import * as pdfjs from 'pdfjs-dist';
import { useStagedProcessing } from '@/hooks/useStagedProcessing';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StagedLoadingOverlay } from '@/components/StagedLoadingOverlay';
import { FileText, Download, CheckCircle, Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FileUploadZone } from '@/components/tool-ui';

type ToolStatus = 'idle' | 'processing' | 'success' | 'error';

export default function PdfToTextTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ToolStatus>('idle');
  const [error, setError] = useState<{ code: string } | null>(null);
  const [extractedText, setExtractedText] = useState('');

  const stagedProcessing = useStagedProcessing({
    minDuration: 3000,
    stages: [
      { name: 'analyzing', duration: 800, message: t('Common.stages.analyzingDocument', { defaultValue: 'Analyzing document...' }) },
      { name: 'processing', duration: 1400, message: t('Common.stages.extractingText', { defaultValue: 'Extracting text...' }) },
      { name: 'optimizing', duration: 800, message: t('Common.stages.finalizingOutput', { defaultValue: 'Finalizing output...' }) },
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
      await stagedProcessing.runStagedProcessing(async () => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const totalPages = pdf.numPages;
        let fullText = '';

        for (let i = 1; i <= totalPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          
          fullText += `--- Page ${i} ---\n${pageText}\n\n`;
        }

        setExtractedText(fullText.trim());
        return fullText;
      });
      setStatus('success');
    } catch {
      setError({ code: 'EXTRACTION_FAILED' });
      setStatus('error');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(extractedText);
      toast({
        title: t('Common.copied'),
        description: t('Tools.pdf-to-text.copiedMessage'),
      });
    } catch {
      toast({
        title: t('Common.error'),
        description: t('Errors.COPY_FAILED'),
        variant: 'destructive',
      });
    }
  };

  const handleDownload = () => {
    if (!extractedText || !file) return;
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace('.pdf', '.txt');
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setExtractedText('');
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
            onClick={handleExtract}
            data-testid="button-extract"
          >
            <FileText className="w-4 h-4 mr-2" />
            {t('Tools.pdf-to-text.extractButton')}
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
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold">{t('Common.workflow.processingComplete')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('Tools.pdf-to-text.successMessage')}
              </p>
            </div>
          </div>

          <Card className="p-4 space-y-4">
            <Textarea
              value={extractedText}
              readOnly
              rows={15}
              className="font-mono text-sm"
              data-testid="textarea-result"
            />
            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleCopy} variant="outline" data-testid="button-copy">
                <Copy className="w-4 h-4 mr-2" />
                {t('Common.copy')}
              </Button>
              <Button onClick={handleDownload} data-testid="button-download">
                <Download className="w-4 h-4 mr-2" />
                {t('Common.download')}
              </Button>
              <Button variant="outline" onClick={reset} data-testid="button-new">
                {t('Common.processAnother')}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
