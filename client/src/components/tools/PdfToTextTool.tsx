import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import * as pdfjs from 'pdfjs-dist';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { FileText, Download, Loader2, CheckCircle, Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FileUploadZone } from '@/components/tool-ui';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

type ToolStatus = 'idle' | 'processing' | 'success' | 'error';

export default function PdfToTextTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ToolStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<{ code: string } | null>(null);
  const [extractedText, setExtractedText] = useState('');

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
    setProgress(10);
    setError(null);

    try {
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
        setProgress(10 + (80 * i / totalPages));
      }

      setExtractedText(fullText.trim());
      setStatus('success');
      setProgress(100);
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
              onClick={() => {
                setFile(null);
                setExtractedText('');
              }}
              data-testid="button-remove-file"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {status === 'processing' && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">
                {t('Common.processing')} {Math.round(progress)}%
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{t(`Errors.${error.code}`)}</p>
          )}

          <Button
            className="w-full"
            onClick={handleExtract}
            disabled={status === 'processing'}
            data-testid="button-extract"
          >
            {status === 'processing' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('Common.processing')}
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                {t('Tools.pdf-to-text.extractButton')}
              </>
            )}
          </Button>
        </Card>
      )}

      {status === 'success' && extractedText && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{t('Common.success')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('Tools.pdf-to-text.successMessage')}
                </p>
              </div>
            </div>
          </Card>

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
        </div>
      )}
    </div>
  );
}
