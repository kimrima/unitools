import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PDFDocument, PageSizes } from 'pdf-lib';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStagedProcessing } from '@/hooks/useStagedProcessing';
import { StagedLoadingOverlay } from '@/components/StagedLoadingOverlay';
import { FileText, Download, CheckCircle, LayoutGrid, Trash2, Info } from 'lucide-react';
import { FileUploadZone } from '@/components/tool-ui';

type ToolStatus = 'idle' | 'processing' | 'success' | 'error';
type NupLayout = '2' | '4' | '6' | '9';

export default function NupPdfTool() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ToolStatus>('idle');
  const [error, setError] = useState<{ code: string } | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [nupLayout, setNupLayout] = useState<NupLayout>('2');

  const stagedProcessing = useStagedProcessing({
    minDuration: 2500,
    stages: [
      { name: 'analyzing', duration: 600, message: t('Common.stages.loadingDocument', { defaultValue: 'Loading document...' }) },
      { name: 'processing', duration: 1200, message: t('Common.stages.arrangingPages', { defaultValue: 'Arranging pages...' }) },
      { name: 'optimizing', duration: 700, message: t('Common.stages.finalizingDocument', { defaultValue: 'Finalizing document...' }) },
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
    setError(null);

    try {
      await stagedProcessing.runStagedProcessing(async () => {
        const arrayBuffer = await file.arrayBuffer();
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
        }

        const pdfBytes = await newDoc.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
      });
      setResultBlob(stagedProcessing.result as Blob);
      setStatus('success');
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

          <div className="p-3 bg-muted/30 rounded-lg flex items-start gap-3">
            <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              {t('Tools.n-up-pdf.explanation', 'This tool shrinks and arranges multiple pages onto a single sheet, perfect for handouts, reviewing documents, or saving paper when printing.')}
            </p>
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

          <div className="space-y-2">
            <Label>{t('Tools.n-up-pdf.layoutPreview', 'Layout Preview')}</Label>
            <div className="border rounded-lg p-4 bg-muted/10 flex justify-center">
              <div 
                className="border-2 border-primary/50 rounded bg-background aspect-[3/4] w-32 grid gap-1 p-2"
                style={{
                  gridTemplateColumns: `repeat(${getLayoutConfig(nupLayout).cols}, 1fr)`,
                  gridTemplateRows: `repeat(${getLayoutConfig(nupLayout).rows}, 1fr)`,
                }}
                data-testid="layout-preview"
              >
                {Array.from({ length: parseInt(nupLayout) }).map((_, i) => (
                  <div 
                    key={i} 
                    className="border border-muted-foreground/30 rounded-sm bg-primary/10 flex items-center justify-center text-xs text-muted-foreground"
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive" data-testid="text-error">{t(`Common.errors.${error.code}`, { defaultValue: t('Common.messages.error') })}</p>
          )}

          <Button
            className="w-full"
            onClick={handleNup}
            disabled={status === 'processing'}
            data-testid="button-nup"
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            {t('Tools.n-up-pdf.nupButton')}
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
