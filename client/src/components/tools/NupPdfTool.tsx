import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PDFDocument, PageSizes } from 'pdf-lib';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Upload, Download, Loader2, CheckCircle, LayoutGrid, Trash2 } from 'lucide-react';

type ToolStatus = 'idle' | 'processing' | 'success' | 'error';
type NupLayout = '2' | '4' | '6' | '9';

export default function NupPdfTool() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ToolStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<{ code: string } | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [nupLayout, setNupLayout] = useState<NupLayout>('2');

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

  const getLayoutConfig = (layout: NupLayout): { cols: number; rows: number } => {
    switch (layout) {
      case '2': return { cols: 2, rows: 1 };
      case '4': return { cols: 2, rows: 2 };
      case '6': return { cols: 3, rows: 2 };
      case '9': return { cols: 3, rows: 3 };
      default: return { cols: 2, rows: 1 };
    }
  };

  const handleNup = async () => {
    if (!file) return;

    setStatus('processing');
    setProgress(10);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      setProgress(20);

      const srcDoc = await PDFDocument.load(arrayBuffer);
      const newDoc = await PDFDocument.create();
      
      const { cols, rows } = getLayoutConfig(nupLayout);
      const pagesPerSheet = cols * rows;
      const srcPages = srcDoc.getPages();
      const totalSheets = Math.ceil(srcPages.length / pagesPerSheet);

      const [targetWidth, targetHeight] = PageSizes.A4;
      const cellWidth = targetWidth / cols;
      const cellHeight = targetHeight / rows;
      const padding = 10;

      for (let sheetIdx = 0; sheetIdx < totalSheets; sheetIdx++) {
        const newPage = newDoc.addPage([targetWidth, targetHeight]);
        
        for (let cellIdx = 0; cellIdx < pagesPerSheet; cellIdx++) {
          const srcPageIdx = sheetIdx * pagesPerSheet + cellIdx;
          if (srcPageIdx >= srcPages.length) break;

          const srcPage = srcPages[srcPageIdx];
          const [embeddedPage] = await newDoc.embedPages([srcPage]);
          
          const { width: srcWidth, height: srcHeight } = srcPage.getSize();
          const scaleX = (cellWidth - padding * 2) / srcWidth;
          const scaleY = (cellHeight - padding * 2) / srcHeight;
          const scale = Math.min(scaleX, scaleY);
          
          const scaledWidth = srcWidth * scale;
          const scaledHeight = srcHeight * scale;
          
          const col = cellIdx % cols;
          const row = Math.floor(cellIdx / cols);
          
          const x = col * cellWidth + (cellWidth - scaledWidth) / 2;
          const y = targetHeight - (row + 1) * cellHeight + (cellHeight - scaledHeight) / 2;

          newPage.drawPage(embeddedPage, {
            x,
            y,
            width: scaledWidth,
            height: scaledHeight,
          });
        }

        setProgress(20 + (70 * (sheetIdx + 1) / totalSheets));
      }

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setResultBlob(blob);
      setStatus('success');
      setProgress(100);
    } catch {
      setError({ code: 'NUP_FAILED' });
      setStatus('error');
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace('.pdf', `_${nupLayout}up.pdf`);
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

          <div className="space-y-2">
            <Label>{t('Tools.n-up-pdf.pagesPerSheet')}</Label>
            <Select value={nupLayout} onValueChange={(v) => setNupLayout(v as NupLayout)}>
              <SelectTrigger data-testid="select-layout">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 {t('Tools.n-up-pdf.pages')} (1x2)</SelectItem>
                <SelectItem value="4">4 {t('Tools.n-up-pdf.pages')} (2x2)</SelectItem>
                <SelectItem value="6">6 {t('Tools.n-up-pdf.pages')} (2x3)</SelectItem>
                <SelectItem value="9">9 {t('Tools.n-up-pdf.pages')} (3x3)</SelectItem>
              </SelectContent>
            </Select>
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
            onClick={handleNup}
            disabled={status === 'processing'}
            data-testid="button-nup"
          >
            {status === 'processing' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('Common.processing')}
              </>
            ) : (
              <>
                <LayoutGrid className="w-4 h-4 mr-2" />
                {t('Tools.n-up-pdf.nupButton')}
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
                {t('Tools.n-up-pdf.successMessage')}
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
