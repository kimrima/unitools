import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PDFDocument } from 'pdf-lib';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { FileText, Download, Loader2, CheckCircle, Pen, Type, Trash2 } from 'lucide-react';
import { FileUploadZone } from '@/components/tool-ui';

type ToolStatus = 'idle' | 'processing' | 'success' | 'error';
type SignatureType = 'draw' | 'type';

export default function SignPdfTool() {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ToolStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<{ code: string } | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [signatureType, setSignatureType] = useState<SignatureType>('draw');
  const [typedSignature, setTypedSignature] = useState('');
  const [signatureSize, setSignatureSize] = useState(100);
  const [pageNumber, setPageNumber] = useState(1);
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(90);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const handleFilesFromDropzone = useCallback((fileList: FileList) => {
    const selectedFile = fileList[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setStatus('idle');
      setError(null);
      setResultBlob(null);
    }
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
      }
    }
  };

  const getScaledCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    const { x, y } = getScaledCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getScaledCoords(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getSignatureImage = async (): Promise<Uint8Array | null> => {
    if (signatureType === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas || !hasSignature) return null;
      
      const dataUrl = canvas.toDataURL('image/png');
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      return new Uint8Array(await blob.arrayBuffer());
    } else {
      if (!typedSignature.trim()) return null;
      
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'black';
      ctx.font = 'italic 36px "Brush Script MT", cursive, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedSignature, canvas.width / 2, canvas.height / 2);
      
      const dataUrl = canvas.toDataURL('image/png');
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      return new Uint8Array(await blob.arrayBuffer());
    }
  };

  const handleSign = async () => {
    if (!file) return;
    
    const signatureData = await getSignatureImage();
    if (!signatureData) {
      setError({ code: 'NO_SIGNATURE' });
      return;
    }

    setStatus('processing');
    setProgress(10);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      setProgress(30);

      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const targetPage = pages[Math.min(pageNumber - 1, pages.length - 1)];
      
      setProgress(50);

      const signatureImage = await pdfDoc.embedPng(signatureData);
      const { width, height } = targetPage.getSize();
      
      const sigWidth = (signatureSize / 100) * 150;
      const sigHeight = (signatureSize / 100) * 50;
      const x = (posX / 100) * (width - sigWidth);
      const y = height - ((posY / 100) * height) - sigHeight;

      targetPage.drawImage(signatureImage, {
        x,
        y,
        width: sigWidth,
        height: sigHeight,
      });

      setProgress(80);

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setResultBlob(blob);
      setStatus('success');
      setProgress(100);
    } catch {
      setError({ code: 'SIGNING_FAILED' });
      setStatus('error');
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace('.pdf', '_signed.pdf');
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

          <Tabs value={signatureType} onValueChange={(v) => setSignatureType(v as SignatureType)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="draw" className="gap-2" data-testid="tab-draw">
                <Pen className="w-4 h-4" />
                {t('Tools.sign-pdf.drawSignature')}
              </TabsTrigger>
              <TabsTrigger value="type" className="gap-2" data-testid="tab-type">
                <Type className="w-4 h-4" />
                {t('Tools.sign-pdf.typeSignature')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="draw" className="space-y-4">
              <div className="border rounded-lg overflow-hidden bg-white">
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={100}
                  className="w-full cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  data-testid="canvas-signature"
                />
              </div>
              <Button variant="outline" size="sm" onClick={clearCanvas} data-testid="button-clear">
                {t('Common.clear')}
              </Button>
            </TabsContent>

            <TabsContent value="type" className="space-y-4">
              <Input
                placeholder={t('Tools.sign-pdf.typePlaceholder')}
                value={typedSignature}
                onChange={(e) => setTypedSignature(e.target.value)}
                className="text-xl italic"
                style={{ fontFamily: '"Brush Script MT", cursive, serif' }}
                data-testid="input-typed-signature"
              />
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('Tools.sign-pdf.pageNumber')}</Label>
              <Input
                type="number"
                min={1}
                value={pageNumber}
                onChange={(e) => setPageNumber(parseInt(e.target.value) || 1)}
                data-testid="input-page-number"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('Tools.sign-pdf.signatureSize')}: {signatureSize}%</Label>
              <Slider
                value={[signatureSize]}
                onValueChange={([v]) => setSignatureSize(v)}
                min={50}
                max={200}
                step={10}
                data-testid="slider-size"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('Tools.sign-pdf.positionX')}: {posX}%</Label>
              <Slider
                value={[posX]}
                onValueChange={([v]) => setPosX(v)}
                min={0}
                max={100}
                step={5}
                data-testid="slider-pos-x"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('Tools.sign-pdf.positionY')}: {posY}%</Label>
              <Slider
                value={[posY]}
                onValueChange={([v]) => setPosY(v)}
                min={0}
                max={100}
                step={5}
                data-testid="slider-pos-y"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{t(`Errors.${error.code}`)}</p>
          )}

          <Button
            className="w-full"
            onClick={handleSign}
            disabled={status === 'processing'}
            data-testid="button-sign"
          >
            {status === 'processing' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('Common.processing')} {progress}%
              </>
            ) : (
              <>
                <Pen className="w-4 h-4 mr-2" />
                {t('Tools.sign-pdf.signButton')}
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
                {t('Tools.sign-pdf.successMessage')}
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
