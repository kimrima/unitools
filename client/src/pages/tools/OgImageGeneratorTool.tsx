import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Upload, Type, Image as ImageIcon, Palette } from 'lucide-react';

const FONTS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Times New Roman', label: 'Times New Roman' },
];

const PRESETS = [
  { name: 'Purple Gradient', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Ocean Blue', bg: 'linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)' },
  { name: 'Sunset', bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { name: 'Forest', bg: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { name: 'Night Sky', bg: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
  { name: 'Coral', bg: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
  { name: 'Dark', bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' },
  { name: 'Light', bg: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' },
];

export default function OgImageGeneratorTool() {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('Your Amazing Title');
  const [subtitle, setSubtitle] = useState('Add a compelling description here');
  const [titleSize, setTitleSize] = useState(64);
  const [subtitleSize, setSubtitleSize] = useState(28);
  const [titleColor, setTitleColor] = useState('#ffffff');
  const [subtitleColor, setSubtitleColor] = useState('#e0e0e0');
  const [font, setFont] = useState('Inter');
  const [bgType, setBgType] = useState<'gradient' | 'color' | 'image'>('gradient');
  const [bgColor, setBgColor] = useState('#667eea');
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(80);
  const [logoPosition, setLogoPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('bottom-right');

  const width = 1200;
  const height = 630;

  useEffect(() => {
    renderCanvas();
  }, [title, subtitle, titleSize, subtitleSize, titleColor, subtitleColor, font, bgType, bgColor, selectedPreset, bgImage, logo, logoSize, logoPosition]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    if (bgType === 'image' && bgImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, width, height);
        drawText(ctx);
        drawLogo(ctx);
      };
      img.src = bgImage;
    } else if (bgType === 'gradient') {
      const gradientStr = PRESETS[selectedPreset].bg;
      const colors = gradientStr.match(/#[a-fA-F0-9]{6}/g) || ['#667eea', '#764ba2'];
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(1, colors[colors.length - 1]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      drawText(ctx);
      drawLogo(ctx);
    } else {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
      drawText(ctx);
      drawLogo(ctx);
    }
  };

  const drawText = (ctx: CanvasRenderingContext2D) => {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = `bold ${titleSize}px ${font}`;
    ctx.fillStyle = titleColor;
    
    const titleLines = wrapText(ctx, title, width - 120);
    const lineHeight = titleSize * 1.2;
    const totalTextHeight = titleLines.length * lineHeight + (subtitle ? subtitleSize * 1.5 : 0);
    let startY = (height - totalTextHeight) / 2 + titleSize / 2;

    titleLines.forEach((line, i) => {
      ctx.fillText(line, width / 2, startY + i * lineHeight);
    });

    if (subtitle) {
      ctx.font = `${subtitleSize}px ${font}`;
      ctx.fillStyle = subtitleColor;
      const subtitleY = startY + titleLines.length * lineHeight + subtitleSize;
      ctx.fillText(subtitle, width / 2, subtitleY);
    }
  };

  const drawLogo = (ctx: CanvasRenderingContext2D) => {
    if (!logo) return;

    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      const logoHeight = logoSize;
      const logoWidth = logoSize * aspectRatio;
      const padding = 40;

      let x = padding;
      let y = padding;

      switch (logoPosition) {
        case 'top-right':
          x = width - logoWidth - padding;
          break;
        case 'bottom-left':
          y = height - logoHeight - padding;
          break;
        case 'bottom-right':
          x = width - logoWidth - padding;
          y = height - logoHeight - padding;
          break;
      }

      ctx.drawImage(img, x, y, logoWidth, logoHeight);
    };
    img.src = logo;
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + ' ' + words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setBgImage(reader.result as string);
        setBgType('image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'og-image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <Tabs defaultValue="text">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="text" data-testid="tab-text">
                  <Type className="w-4 h-4 mr-2" />
                  {t('Tools.og-image-generator.text', 'Text')}
                </TabsTrigger>
                <TabsTrigger value="background" data-testid="tab-background">
                  <Palette className="w-4 h-4 mr-2" />
                  {t('Tools.og-image-generator.background', 'Background')}
                </TabsTrigger>
                <TabsTrigger value="logo" data-testid="tab-logo">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {t('Tools.og-image-generator.logo', 'Logo')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>{t('Tools.og-image-generator.titleLabel', 'Title')}</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter title..."
                    data-testid="input-title"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('Tools.og-image-generator.subtitleLabel', 'Subtitle')}</Label>
                  <Input
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Enter subtitle..."
                    data-testid="input-subtitle"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('Tools.og-image-generator.font', 'Font')}</Label>
                  <Select value={font} onValueChange={setFont}>
                    <SelectTrigger data-testid="select-font">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONTS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('Tools.og-image-generator.titleSize', 'Title Size')}: {titleSize}px</Label>
                    <Slider
                      value={[titleSize]}
                      onValueChange={([v]) => setTitleSize(v)}
                      min={32}
                      max={96}
                      step={2}
                      data-testid="slider-title-size"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('Tools.og-image-generator.subtitleSize', 'Subtitle Size')}: {subtitleSize}px</Label>
                    <Slider
                      value={[subtitleSize]}
                      onValueChange={([v]) => setSubtitleSize(v)}
                      min={16}
                      max={48}
                      step={2}
                      data-testid="slider-subtitle-size"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('Tools.og-image-generator.titleColor', 'Title Color')}</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={titleColor}
                        onChange={(e) => setTitleColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer"
                        data-testid="input-title-color"
                      />
                      <Input value={titleColor} onChange={(e) => setTitleColor(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('Tools.og-image-generator.subtitleColor', 'Subtitle Color')}</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={subtitleColor}
                        onChange={(e) => setSubtitleColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer"
                        data-testid="input-subtitle-color"
                      />
                      <Input value={subtitleColor} onChange={(e) => setSubtitleColor(e.target.value)} />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="background" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>{t('Tools.og-image-generator.bgType', 'Background Type')}</Label>
                  <Select value={bgType} onValueChange={(v: 'gradient' | 'color' | 'image') => setBgType(v)}>
                    <SelectTrigger data-testid="select-bg-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gradient">{t('Tools.og-image-generator.gradient', 'Gradient')}</SelectItem>
                      <SelectItem value="color">{t('Tools.og-image-generator.solidColor', 'Solid Color')}</SelectItem>
                      <SelectItem value="image">{t('Tools.og-image-generator.image', 'Image')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {bgType === 'gradient' && (
                  <div className="space-y-2">
                    <Label>{t('Tools.og-image-generator.presets', 'Presets')}</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {PRESETS.map((preset, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedPreset(i)}
                          className={`h-12 rounded-md transition-all ${selectedPreset === i ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                          style={{ background: preset.bg }}
                          title={preset.name}
                          data-testid={`preset-${i}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {bgType === 'color' && (
                  <div className="space-y-2">
                    <Label>{t('Tools.og-image-generator.bgColor', 'Background Color')}</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer"
                        data-testid="input-bg-color"
                      />
                      <Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
                    </div>
                  </div>
                )}

                {bgType === 'image' && (
                  <div className="space-y-2">
                    <Label>{t('Tools.og-image-generator.bgImage', 'Background Image')}</Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleBgImageUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                      data-testid="button-upload-bg"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {t('Tools.og-image-generator.uploadImage', 'Upload Image')}
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="logo" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>{t('Tools.og-image-generator.uploadLogo', 'Upload Logo')}</Label>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full"
                    data-testid="button-upload-logo"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {logo ? t('Tools.og-image-generator.changeLogo', 'Change Logo') : t('Tools.og-image-generator.addLogo', 'Add Logo')}
                  </Button>
                </div>

                {logo && (
                  <>
                    <div className="space-y-2">
                      <Label>{t('Tools.og-image-generator.logoSize', 'Logo Size')}: {logoSize}px</Label>
                      <Slider
                        value={[logoSize]}
                        onValueChange={([v]) => setLogoSize(v)}
                        min={40}
                        max={200}
                        step={10}
                        data-testid="slider-logo-size"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{t('Tools.og-image-generator.logoPosition', 'Logo Position')}</Label>
                      <Select value={logoPosition} onValueChange={(v: any) => setLogoPosition(v)}>
                        <SelectTrigger data-testid="select-logo-position">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top-left">{t('Tools.og-image-generator.topLeft', 'Top Left')}</SelectItem>
                          <SelectItem value="top-right">{t('Tools.og-image-generator.topRight', 'Top Right')}</SelectItem>
                          <SelectItem value="bottom-left">{t('Tools.og-image-generator.bottomLeft', 'Bottom Left')}</SelectItem>
                          <SelectItem value="bottom-right">{t('Tools.og-image-generator.bottomRight', 'Bottom Right')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      variant="ghost"
                      onClick={() => setLogo(null)}
                      className="text-destructive"
                      data-testid="button-remove-logo"
                    >
                      {t('Tools.og-image-generator.removeLogo', 'Remove Logo')}
                    </Button>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">{t('Tools.og-image-generator.preview', 'Preview')} (1200 x 630)</Label>
              <Button onClick={downloadImage} data-testid="button-download">
                <Download className="w-4 h-4 mr-2" />
                {t('Common.actions.download', 'Download')}
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="w-full h-auto"
                data-testid="canvas-preview"
              />
            </div>

            <p className="text-sm text-muted-foreground text-center">
              {t('Tools.og-image-generator.sizeNote', 'Standard OG image size for social media sharing')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
