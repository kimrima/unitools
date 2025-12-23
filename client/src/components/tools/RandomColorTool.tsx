import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shuffle, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function generateRandomColor(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r, g, b } = hexToRgb(hex);
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm: h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6; break;
      case gNorm: h = ((bNorm - rNorm) / d + 2) / 6; break;
      case bNorm: h = ((rNorm - gNorm) / d + 4) / 6; break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export default function RandomColorTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [colors, setColors] = useState<string[]>([generateRandomColor()]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateColors = useCallback((count: number = 1) => {
    const newColors: string[] = [];
    for (let i = 0; i < count; i++) {
      newColors.push(generateRandomColor());
    }
    setColors(newColors);
  }, []);

  const copyToClipboard = useCallback(async (color: string, index: number) => {
    await navigator.clipboard.writeText(color);
    setCopiedIndex(index);
    toast({ title: t('Common.messages.copied', 'Copied!'), description: color });
    setTimeout(() => setCopiedIndex(null), 2000);
  }, [t, toast]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3 mb-6 justify-center">
            <Button onClick={() => generateColors(1)} data-testid="button-generate-1">
              <Shuffle className="mr-2 h-4 w-4" />
              {t('Tools.random-color.generate1', '1 Color')}
            </Button>
            <Button variant="outline" onClick={() => generateColors(5)} data-testid="button-generate-5">
              {t('Tools.random-color.generate5', '5 Colors')}
            </Button>
            <Button variant="outline" onClick={() => generateColors(10)} data-testid="button-generate-10">
              {t('Tools.random-color.generate10', '10 Colors')}
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {colors.map((color, i) => {
              const rgb = hexToRgb(color);
              const hsl = hexToHsl(color);
              const isLight = hsl.l > 50;
              
              return (
                <div key={i} className="space-y-2">
                  <button
                    onClick={() => copyToClipboard(color, i)}
                    className="w-full aspect-square rounded-lg transition-transform hover:scale-105 flex items-center justify-center"
                    style={{ backgroundColor: color }}
                    data-testid={`color-swatch-${i}`}
                  >
                    {copiedIndex === i ? (
                      <Check className={`h-6 w-6 ${isLight ? 'text-black' : 'text-white'}`} />
                    ) : (
                      <Copy className={`h-6 w-6 opacity-0 hover:opacity-100 ${isLight ? 'text-black' : 'text-white'}`} />
                    )}
                  </button>
                  <div className="text-center space-y-1">
                    <div className="font-mono text-sm font-medium">{color.toUpperCase()}</div>
                    <div className="text-xs text-muted-foreground">
                      RGB({rgb.r}, {rgb.g}, {rgb.b})
                    </div>
                    <div className="text-xs text-muted-foreground">
                      HSL({hsl.h}, {hsl.s}%, {hsl.l}%)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
