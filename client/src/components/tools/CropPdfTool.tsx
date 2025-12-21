import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PDFDocument } from 'pdf-lib';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { FileText, Download, Loader2, CheckCircle, Crop, Trash2 } from 'lucide-react';
import { FileUploadZone } from '@/components/tool-ui';

type ToolStatus = 'idle' | 'processing' | 'success' | 'error';

export default function CropPdfTool() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ToolStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<{ code: string } | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [margins, setMargins] = useState({ top: 0, right: 0, bottom: 0, left: 0 });

  const handleFilesFromDropzone = useCallback((fileList: FileList) => {
    const selectedFile = fileList[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setStatus('idle');
      setError(null);
      setResultBlob(null);
    }
  }, []);

  const handleCrop = async () => {
    if (!file) return;

    setStatus('processing');
    setProgress(10);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      setProgress(30);

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
        
        setProgress(30 + (50 * (i + 1) / pages.length));
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setResultBlob(blob);
      setStatus('success');
      setProgress(100);
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
            onClick={handleCrop}
            disabled={status === 'processing'}
            data-testid="button-crop"
          >
            {status === 'processing' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('Common.processing')}
              </>
            ) : (
              <>
                <Crop className="w-4 h-4 mr-2" />
                {t('Tools.crop-pdf.cropButton')}
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
