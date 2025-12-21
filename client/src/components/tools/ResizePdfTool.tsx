import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PDFDocument, PageSizes } from 'pdf-lib';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Upload, Download, Loader2, CheckCircle, Maximize, Trash2 } from 'lucide-react';

type ToolStatus = 'idle' | 'processing' | 'success' | 'error';

const PAGE_SIZES: Record<string, [number, number]> = {
  'A4': PageSizes.A4,
  'A3': PageSizes.A3,
  'A5': PageSizes.A5,
  'Letter': PageSizes.Letter,
  'Legal': PageSizes.Legal,
  'Tabloid': PageSizes.Tabloid,
  'Executive': PageSizes.Executive,
};

export default function ResizePdfTool() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ToolStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<{ code: string } | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [targetSize, setTargetSize] = useState('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setStatus('idle');
      setError(null);
      setResultBlob(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setStatus('idle');
      setError(null);
      setResultBlob(null);
    }
  }, []);

  const handleResize = async () => {
    if (!file) return;

    setStatus('processing');
    setProgress(10);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      setProgress(30);

      const srcDoc = await PDFDocument.load(arrayBuffer);
      const newDoc = await PDFDocument.create();
      
      let [targetWidth, targetHeight] = PAGE_SIZES[targetSize] || PageSizes.A4;
      if (orientation === 'landscape') {
        [targetWidth, targetHeight] = [targetHeight, targetWidth];
      }

      const pages = srcDoc.getPages();
      
      for (let i = 0; i < pages.length; i++) {
        const srcPage = pages[i];
        const { width: srcWidth, height: srcHeight } = srcPage.getSize();
        
        const [embeddedPage] = await newDoc.embedPages([srcPage]);
        const newPage = newDoc.addPage([targetWidth, targetHeight]);
        
        const scaleX = targetWidth / srcWidth;
        const scaleY = targetHeight / srcHeight;
        const scale = Math.min(scaleX, scaleY);
        
        const scaledWidth = srcWidth * scale;
        const scaledHeight = srcHeight * scale;
        const x = (targetWidth - scaledWidth) / 2;
        const y = (targetHeight - scaledHeight) / 2;

        newPage.drawPage(embeddedPage, {
          x,
          y,
          width: scaledWidth,
          height: scaledHeight,
        });

        setProgress(30 + (60 * (i + 1) / pages.length));
      }

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setResultBlob(blob);
      setStatus('success');
      setProgress(100);
    } catch {
      setError({ code: 'RESIZE_FAILED' });
      setStatus('error');
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace('.pdf', `_${targetSize}.pdf`);
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-file-upload"
      />

      {!file && (
        <Card
          className="border-2 border-dashed p-8 text-center cursor-pointer hover-elevate"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          data-testid="dropzone-pdf"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="font-medium">{t('Common.dropzone.title')}</p>
              <p className="text-sm text-muted-foreground">{t('Common.dropzone.subtitle')}</p>
            </div>
            <Button variant="outline" data-testid="button-browse-files">
              {t('Common.dropzone.button')}
            </Button>
          </div>
        </Card>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('Tools.resize-pdf.pageSize')}</Label>
              <Select value={targetSize} onValueChange={setTargetSize}>
                <SelectTrigger data-testid="select-page-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(PAGE_SIZES).map(size => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('Tools.resize-pdf.orientation')}</Label>
              <Select value={orientation} onValueChange={(v) => setOrientation(v as 'portrait' | 'landscape')}>
                <SelectTrigger data-testid="select-orientation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">{t('Tools.resize-pdf.portrait')}</SelectItem>
                  <SelectItem value="landscape">{t('Tools.resize-pdf.landscape')}</SelectItem>
                </SelectContent>
              </Select>
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
            onClick={handleResize}
            disabled={status === 'processing'}
            data-testid="button-resize"
          >
            {status === 'processing' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('Common.processing')}
              </>
            ) : (
              <>
                <Maximize className="w-4 h-4 mr-2" />
                {t('Tools.resize-pdf.resizeButton')}
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
                {t('Tools.resize-pdf.successMessage')}
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
