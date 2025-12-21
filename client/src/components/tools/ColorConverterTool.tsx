import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Palette, Pipette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ColorValues {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  cmyk: { c: number; m: number; y: number; k: number };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360; s /= 100; l /= 100;
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  r /= 255; g /= 255; b /= 255;
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round((1 - r - k) / (1 - k) * 100),
    m: Math.round((1 - g - k) / (1 - k) * 100),
    y: Math.round((1 - b - k) / (1 - k) * 100),
    k: Math.round(k * 100)
  };
}

export default function ColorConverterTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [color, setColor] = useState<ColorValues>({
    hex: '#3B82F6',
    rgb: { r: 59, g: 130, b: 246 },
    hsl: { h: 217, s: 91, l: 60 },
    cmyk: { c: 76, m: 47, y: 0, k: 4 }
  });

  const updateFromHex = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (rgb) {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
      setColor({ hex: hex.startsWith('#') ? hex : '#' + hex, rgb, hsl, cmyk });
    }
  };

  const updateFromRgb = (r: number, g: number, b: number) => {
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    const cmyk = rgbToCmyk(r, g, b);
    setColor({ hex, rgb: { r, g, b }, hsl, cmyk });
  };

  const updateFromHsl = (h: number, s: number, l: number) => {
    h = Math.max(0, Math.min(360, h));
    s = Math.max(0, Math.min(100, s));
    l = Math.max(0, Math.min(100, l));
    const rgb = hslToRgb(h, s, l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    setColor({ hex, rgb, hsl: { h, s, l }, cmyk });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: t('Tools.color-converter.copied') });
  };

  const hexString = color.hex.toUpperCase();
  const rgbString = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
  const hslString = `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;
  const cmykString = `cmyk(${color.cmyk.c}%, ${color.cmyk.m}%, ${color.cmyk.y}%, ${color.cmyk.k}%)`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div
          className="w-24 h-24 rounded-lg border shadow-inner shrink-0"
          style={{ backgroundColor: color.hex }}
        />
        <div className="flex-1 space-y-2">
          <Label>{t('Tools.color-converter.pickColor')}</Label>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={color.hex}
              onChange={(e) => updateFromHex(e.target.value)}
              className="w-12 h-10 p-1 cursor-pointer"
              data-testid="input-color-picker"
            />
            <Input
              type="text"
              value={color.hex}
              onChange={(e) => updateFromHex(e.target.value)}
              className="font-mono"
              placeholder="#000000"
              data-testid="input-hex"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              HEX
            </Label>
            <Button size="sm" variant="ghost" onClick={() => copyToClipboard(hexString)}>
              <Copy className="w-3 h-3 mr-1" />
              {hexString}
            </Button>
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label>RGB</Label>
            <Button size="sm" variant="ghost" onClick={() => copyToClipboard(rgbString)}>
              <Copy className="w-3 h-3 mr-1" />
              {rgbString}
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">R</Label>
              <Input
                type="number"
                min={0}
                max={255}
                value={color.rgb.r}
                onChange={(e) => updateFromRgb(parseInt(e.target.value) || 0, color.rgb.g, color.rgb.b)}
                className="font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">G</Label>
              <Input
                type="number"
                min={0}
                max={255}
                value={color.rgb.g}
                onChange={(e) => updateFromRgb(color.rgb.r, parseInt(e.target.value) || 0, color.rgb.b)}
                className="font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">B</Label>
              <Input
                type="number"
                min={0}
                max={255}
                value={color.rgb.b}
                onChange={(e) => updateFromRgb(color.rgb.r, color.rgb.g, parseInt(e.target.value) || 0)}
                className="font-mono"
              />
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label>HSL</Label>
            <Button size="sm" variant="ghost" onClick={() => copyToClipboard(hslString)}>
              <Copy className="w-3 h-3 mr-1" />
              {hslString}
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">H</Label>
              <Input
                type="number"
                min={0}
                max={360}
                value={color.hsl.h}
                onChange={(e) => updateFromHsl(parseInt(e.target.value) || 0, color.hsl.s, color.hsl.l)}
                className="font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">S%</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={color.hsl.s}
                onChange={(e) => updateFromHsl(color.hsl.h, parseInt(e.target.value) || 0, color.hsl.l)}
                className="font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">L%</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={color.hsl.l}
                onChange={(e) => updateFromHsl(color.hsl.h, color.hsl.s, parseInt(e.target.value) || 0)}
                className="font-mono"
              />
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label>CMYK</Label>
            <Button size="sm" variant="ghost" onClick={() => copyToClipboard(cmykString)}>
              <Copy className="w-3 h-3 mr-1" />
              {cmykString}
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {(['c', 'm', 'y', 'k'] as const).map((key) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase">{key}</Label>
                <Input
                  type="number"
                  value={color.cmyk[key]}
                  readOnly
                  className="font-mono bg-muted"
                />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
