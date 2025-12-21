import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Share2, Barcode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BARCODE_FORMATS = [
  { id: 'code128', name: 'Code 128', pattern: /^[\x00-\x7F]+$/, description: 'Alphanumeric' },
  { id: 'code39', name: 'Code 39', pattern: /^[A-Z0-9\-\.\ \$\/\+\%]+$/, description: 'Alphanumeric limited' },
  { id: 'ean13', name: 'EAN-13', pattern: /^\d{12,13}$/, description: '12-13 digits' },
  { id: 'ean8', name: 'EAN-8', pattern: /^\d{7,8}$/, description: '7-8 digits' },
  { id: 'upc', name: 'UPC-A', pattern: /^\d{11,12}$/, description: '11-12 digits' },
];

const CODE128_PATTERNS: Record<string, string> = {
  '0': '11011001100', '1': '11001101100', '2': '11001100110', '3': '10010011000',
  '4': '10010001100', '5': '10001001100', '6': '10011001000', '7': '10011000100',
  '8': '10001100100', '9': '11001001000', 'A': '11001000100', 'B': '11000100100',
  'START': '11010000100', 'STOP': '1100011101011',
};

export default function BarcodeGeneratorTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [text, setText] = useState('');
  const [format, setFormat] = useState('code128');
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    if (text) {
      generateBarcode();
    }
  }, [text, format]);

  const generateBarcode = () => {
    if (!text || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 300;
    canvas.height = 100;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let binaryString = CODE128_PATTERNS['START'];
    for (const char of text.toUpperCase()) {
      if (CODE128_PATTERNS[char]) {
        binaryString += CODE128_PATTERNS[char];
      }
    }
    binaryString += CODE128_PATTERNS['STOP'];

    const barWidth = 2;
    const startX = 20;
    const barHeight = 60;
    
    ctx.fillStyle = '#000000';
    
    for (let i = 0; i < binaryString.length; i++) {
      if (binaryString[i] === '1') {
        ctx.fillRect(startX + i * barWidth, 10, barWidth, barHeight);
      }
    }

    ctx.fillStyle = '#000000';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(text, canvas.width / 2, 85);

    setGenerated(true);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `barcode-${format}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    
    toast({
      title: t('Common.messages.complete'),
      description: t('Common.actions.download'),
    });
  };

  const handleShare = async () => {
    if (!canvasRef.current) return;
    
    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvasRef.current!.toBlob((blob) => resolve(blob!), 'image/png');
      });
      
      if (navigator.share && navigator.canShare({ files: [new File([blob], 'barcode.png', { type: 'image/png' })] })) {
        await navigator.share({
          files: [new File([blob], 'barcode.png', { type: 'image/png' })],
          title: 'Barcode',
        });
      } else {
        handleDownload();
      }
    } catch {
      handleDownload();
    }
  };

  const currentFormat = BARCODE_FORMATS.find(f => f.id === format);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('Tools.barcode-generator.formatLabel')}</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger data-testid="select-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BARCODE_FORMATS.map((fmt) => (
                      <SelectItem key={fmt.id} value={fmt.id}>
                        {fmt.name} ({fmt.description})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>{t('Tools.barcode-generator.textLabel')}</Label>
                <Input
                  placeholder={t('Tools.barcode-generator.textPlaceholder')}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  data-testid="input-text"
                />
                {currentFormat && (
                  <p className="text-xs text-muted-foreground">
                    {currentFormat.description}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="border rounded-lg p-4 bg-white">
                {!text ? (
                  <div className="w-64 h-24 flex items-center justify-center text-muted-foreground">
                    <Barcode className="w-16 h-16" />
                  </div>
                ) : (
                  <canvas ref={canvasRef} data-testid="canvas-barcode" />
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
