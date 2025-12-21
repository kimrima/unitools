import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Share2, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

export default function QrCodeTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [text, setText] = useState('');
  const [size, setSize] = useState('256');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    if (text && canvasRef.current) {
      generateQR();
    }
  }, [text, size, fgColor, bgColor]);

  const generateQR = async () => {
    if (!text || !canvasRef.current) return;
    
    try {
      await QRCode.toCanvas(canvasRef.current, text, {
        width: parseInt(size),
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });
      setGenerated(true);
    } catch (error) {
      console.error('QR generation error:', error);
      toast({
        title: t('Common.errors.PROCESSING_FAILED'),
        variant: 'destructive',
      });
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    
    toast({
      title: t('Common.messages.complete'),
      description: t('Tools.qr-code-generator.downloaded'),
    });
  };

  const handleShare = async () => {
    if (!canvasRef.current) return;
    
    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvasRef.current!.toBlob((blob) => resolve(blob!), 'image/png');
      });
      
      if (navigator.share && navigator.canShare({ files: [new File([blob], 'qrcode.png', { type: 'image/png' })] })) {
        await navigator.share({
          files: [new File([blob], 'qrcode.png', { type: 'image/png' })],
          title: 'QR Code',
        });
      } else {
        handleDownload();
      }
    } catch (error) {
      handleDownload();
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('Tools.qr-code-generator.urlLabel')}</Label>
                <Input
                  placeholder={t('Tools.qr-code-generator.urlPlaceholder')}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  data-testid="input-url"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('Tools.qr-code-generator.sizeLabel')}</Label>
                  <Select value={size} onValueChange={setSize}>
                    <SelectTrigger data-testid="select-size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="128">128px</SelectItem>
                      <SelectItem value="256">256px</SelectItem>
                      <SelectItem value="512">512px</SelectItem>
                      <SelectItem value="1024">1024px</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>{t('Tools.qr-code-generator.fgColorLabel')}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-12 h-9 p-1 cursor-pointer"
                      data-testid="input-fg-color"
                    />
                    <Input
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>{t('Tools.qr-code-generator.bgColorLabel')}</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-12 h-9 p-1 cursor-pointer"
                    data-testid="input-bg-color"
                  />
                  <Input
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 font-mono"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="border rounded-lg p-4 bg-white">
                {!text ? (
                  <div className="w-64 h-64 flex items-center justify-center text-muted-foreground">
                    <QrCode className="w-16 h-16" />
                  </div>
                ) : (
                  <canvas ref={canvasRef} data-testid="canvas-qr" />
                )}
              </div>
              
              {generated && text && (
                <div className="flex gap-2">
                  <Button onClick={handleDownload} data-testid="button-download">
                    <Download className="w-4 h-4 mr-2" />
                    {t('Common.actions.download')}
                  </Button>
                  <Button variant="outline" onClick={handleShare} data-testid="button-share">
                    <Share2 className="w-4 h-4 mr-2" />
                    {t('Common.actions.share')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
