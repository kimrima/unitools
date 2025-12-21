import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SHAPES = ['circle', 'square', 'rounded', 'hexagon'];
const FONTS = ['Inter', 'Georgia', 'Courier New', 'Impact', 'Comic Sans MS'];

export default function LogoGeneratorTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [text, setText] = useState('');
  const [shape, setShape] = useState('circle');
  const [bgColor, setBgColor] = useState('#3b82f6');
  const [textColor, setTextColor] = useState('#ffffff');
  const [font, setFont] = useState('Inter');
  const [size, setSize] = useState('256');

  useEffect(() => {
    generateLogo();
  }, [text, shape, bgColor, textColor, font, size]);

  const generateLogo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const sizeNum = parseInt(size);
    canvas.width = sizeNum;
    canvas.height = sizeNum;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, sizeNum, sizeNum);

    ctx.fillStyle = bgColor;
    
    switch (shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(sizeNum / 2, sizeNum / 2, sizeNum / 2 - 4, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'square':
        ctx.fillRect(4, 4, sizeNum - 8, sizeNum - 8);
        break;
      case 'rounded':
        ctx.beginPath();
        const radius = sizeNum / 6;
        ctx.roundRect(4, 4, sizeNum - 8, sizeNum - 8, radius);
        ctx.fill();
        break;
      case 'hexagon':
        ctx.beginPath();
        const a = sizeNum / 2;
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          const x = a + (a - 4) * Math.cos(angle);
          const y = a + (a - 4) * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        break;
    }

    if (text) {
      ctx.fillStyle = textColor;
      ctx.font = `bold ${sizeNum / 3}px ${font}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const displayText = text.slice(0, 3).toUpperCase();
      ctx.fillText(displayText, sizeNum / 2, sizeNum / 2);
    }
  };

  const handleDownload = (format: 'png' | 'svg') => {
    if (!canvasRef.current) return;
    
    if (format === 'png') {
      const link = document.createElement('a');
      link.download = `logo-${text || 'custom'}.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    } else {
      const sizeNum = parseInt(size);
      let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${sizeNum}" height="${sizeNum}">`;
      
      switch (shape) {
        case 'circle':
          svgContent += `<circle cx="${sizeNum/2}" cy="${sizeNum/2}" r="${sizeNum/2 - 4}" fill="${bgColor}"/>`;
          break;
        case 'square':
          svgContent += `<rect x="4" y="4" width="${sizeNum-8}" height="${sizeNum-8}" fill="${bgColor}"/>`;
          break;
        case 'rounded':
          svgContent += `<rect x="4" y="4" width="${sizeNum-8}" height="${sizeNum-8}" rx="${sizeNum/6}" fill="${bgColor}"/>`;
          break;
      }
      
      if (text) {
        svgContent += `<text x="${sizeNum/2}" y="${sizeNum/2}" font-family="${font}" font-size="${sizeNum/3}" font-weight="bold" fill="${textColor}" text-anchor="middle" dominant-baseline="central">${text.slice(0, 3).toUpperCase()}</text>`;
      }
      
      svgContent += '</svg>';
      
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const link = document.createElement('a');
      link.download = `logo-${text || 'custom'}.svg`;
      link.href = URL.createObjectURL(blob);
      link.click();
    }
    
    toast({
      title: t('Common.messages.complete'),
      description: t('Common.actions.download'),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('Tools.logo-generator.textLabel')}</Label>
                <Input
                  placeholder={t('Tools.logo-generator.textPlaceholder')}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={3}
                  data-testid="input-text"
                />
                <p className="text-xs text-muted-foreground">
                  {t('Tools.logo-generator.textHint')}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('Tools.logo-generator.shapeLabel')}</Label>
                  <Select value={shape} onValueChange={setShape}>
                    <SelectTrigger data-testid="select-shape">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SHAPES.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>{t('Tools.logo-generator.fontLabel')}</Label>
                  <Select value={font} onValueChange={setFont}>
                    <SelectTrigger data-testid="select-font">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONTS.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('Tools.logo-generator.bgColorLabel')}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-12 h-9 p-1 cursor-pointer"
                    />
                    <Input
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>{t('Tools.logo-generator.textColorLabel')}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-12 h-9 p-1 cursor-pointer"
                    />
                    <Input
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>{t('Tools.logo-generator.sizeLabel')}</Label>
                <Select value={size} onValueChange={setSize}>
                  <SelectTrigger>
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
            </div>
            
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="border rounded-lg p-4 bg-muted/30">
                <canvas 
                  ref={canvasRef} 
                  className="max-w-full"
                  style={{ width: '200px', height: '200px' }}
                  data-testid="canvas-logo" 
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={() => handleDownload('png')} data-testid="button-download-png">
                  <Download className="w-4 h-4 mr-2" />
                  PNG
                </Button>
                <Button variant="outline" onClick={() => handleDownload('svg')} data-testid="button-download-svg">
                  <Download className="w-4 h-4 mr-2" />
                  SVG
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
