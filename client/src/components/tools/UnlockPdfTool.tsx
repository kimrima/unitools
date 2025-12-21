import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PDFDocument } from 'pdf-lib';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { FileText, Download, Loader2, CheckCircle, Unlock, Trash2 } from 'lucide-react';
import { FileUploadZone } from '@/components/tool-ui';

type ToolStatus = 'idle' | 'processing' | 'success' | 'error';

export default function UnlockPdfTool() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<ToolStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<{ code: string } | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFilesFromDropzone = useCallback((fileList: FileList) => {
    const selectedFile = fileList[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setStatus('idle');
      setError(null);
      setResultBlob(null);
    }
  }, []);

  const handleUnlock = useCallback(async () => {
    if (!file) return;

    setStatus('processing');
    setProgress(10);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      setProgress(30);

      const pdfDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
        updateMetadata: false,
      });

      setProgress(60);

      const pdfBytes = await pdfDoc.save();
      setProgress(90);

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setResultBlob(blob);
      setStatus('success');
      setProgress(100);
    } catch {
      setError({ code: 'UNLOCK_FAILED' });
      setStatus('error');
    }
  }, [file]);

  const handleDownload = useCallback(() => {
    if (!resultBlob || !file) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    const baseName = file.name.replace('.pdf', '');
    a.download = `unitools_${baseName}_unlocked.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }, [resultBlob, file]);

  const reset = useCallback(() => {
    setFile(null);
    setPassword('');
    setStatus('idle');
    setProgress(0);
    setError(null);
    setResultBlob(null);
  }, []);

  const formatFileSize = (bytes: number): string => {
    const k = 1024;
    if (bytes < k) return `${bytes} B`;
    if (bytes < k * k) return `${(bytes / k).toFixed(1)} KB`;
    return `${(bytes / (k * k)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {!file && status === 'idle' && (
        <FileUploadZone
          onFileSelect={handleFilesFromDropzone}
          accept="application/pdf"
          multiple={false}
        />
      )}

      {file && status === 'idle' && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
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
          </Card>

          <div className="space-y-2">
            <Label htmlFor="password">{t('Tools.unlock-pdf.passwordLabel')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('Tools.unlock-pdf.noPasswordNeeded')}
              data-testid="input-password"
            />
            <p className="text-xs text-muted-foreground">
              {t('Tools.unlock-pdf.noPasswordNeeded')}
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleUnlock} className="flex-1" data-testid="button-unlock">
              <Unlock className="w-4 h-4 mr-2" />
              {t('Tools.unlock-pdf.unlockButton')}
            </Button>
            <Button variant="outline" onClick={reset} data-testid="button-reset">
              {t('Common.workflow.startOver')}
            </Button>
          </div>
        </div>
      )}

      {status === 'processing' && (
        <div className="space-y-6 py-8">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="font-medium">{t('Common.workflow.processing')}</p>
          </div>
          <Progress value={progress} className="h-2" data-testid="progress-bar" />
        </div>
      )}

      {status === 'success' && resultBlob && (
        <div className="flex flex-col items-center gap-6 py-8">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">{t('Common.workflow.processingComplete')}</h3>
            <p className="text-muted-foreground">{t('Tools.unlock-pdf.successNote')}</p>
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

      {status === 'error' && error && (
        <Card className="p-6">
          <div className="text-center text-destructive py-4">
            <p>{t(`Common.errors.${error.code}`, { defaultValue: t('Common.messages.error') })}</p>
          </div>
          <Button variant="outline" onClick={reset} className="w-full mt-4" data-testid="button-retry">
            {t('Common.workflow.startOver')}
          </Button>
        </Card>
      )}
    </div>
  );
}
