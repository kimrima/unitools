import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Download, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PLATFORMS = {
  tiktok: { 
    name: 'TikTok', 
    width: 1080, 
    height: 1920,
    safeZones: [
      { name: 'Top UI', y: 0, height: 150, opacity: 0.3 },
      { name: 'Bottom UI', y: 1520, height: 400, opacity: 0.3 },
      { name: 'Right UI', x: 960, y: 800, width: 120, height: 600, opacity: 0.3 },
    ]
  },
  youtubeShorts: { 
    name: 'YouTube Shorts', 
    width: 1080, 
    height: 1920,
    safeZones: [
      { name: 'Top UI', y: 0, height: 120, opacity: 0.3 },
      { name: 'Bottom UI', y: 1600, height: 320, opacity: 0.3 },
      { name: 'Right UI', x: 980, y: 900, width: 100, height: 500, opacity: 0.3 },
    ]
  },
  instagramReels: { 
    name: 'Instagram Reels', 
    width: 1080, 
    height: 1920,
    safeZones: [
      { name: 'Top UI', y: 0, height: 100, opacity: 0.3 },
      { name: 'Bottom UI', y: 1550, height: 370, opacity: 0.3 },
      { name: 'Right UI', x: 960, y: 850, width: 120, height: 550, opacity: 0.3 },
    ]
  },
};

export default function TiktokSafeZoneTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [platform, setPlatform] = useState<keyof typeof PLATFORMS>('tiktok');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new window.Image();
    img.onload = () => {
      setImage(img);
      drawPreview(img, platform);
    };
    img.src = URL.createObjectURL(file);
  };

  const drawPreview = (img: HTMLImageElement, selectedPlatform: keyof typeof PLATFORMS) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const config = PLATFORMS[selectedPlatform];
    canvas.width = config.width;
    canvas.height = config.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = Math.max(config.width / img.width, config.height / img.height);
    const x = (config.width - img.width * scale) / 2;
    const y = (config.height - img.height * scale) / 2;
    
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    config.safeZones.forEach(zone => {
      ctx.fillRect(
        zone.x || 0, 
        zone.y || 0, 
        zone.width || config.width, 
        zone.height || 0
      );
    });

    ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 5]);
    
    const safeTop = 150;
    const safeBottom = config.height - 400;
    const safeLeft = 50;
    const safeRight = config.width - 150;
    
    ctx.strokeRect(safeLeft, safeTop, safeRight - safeLeft, safeBottom - safeTop);
  };

  const handlePlatformChange = (value: keyof typeof PLATFORMS) => {
    setPlatform(value);
    if (image) {
      drawPreview(image, value);
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `safezone-preview-${platform}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    
    toast({
      title: t('Common.messages.complete'),
      description: t('Common.actions.download'),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
            <p className="text-sm">
              {t('Tools.tiktok-safe-zone.notice')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('Tools.tiktok-safe-zone.platformLabel')}</Label>
                <Select value={platform} onValueChange={handlePlatformChange}>
                  <SelectTrigger data-testid="select-platform">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PLATFORMS).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>{t('Tools.tiktok-safe-zone.uploadLabel')}</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    data-testid="input-file"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {t('Tools.tiktok-safe-zone.uploadHint')}
                    </p>
                  </label>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">{t('Tools.tiktok-safe-zone.legend')}</h4>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500/30 border border-red-500"></div>
                    <span>{t('Tools.tiktok-safe-zone.dangerZone')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-dashed border-green-500"></div>
                    <span>{t('Tools.tiktok-safe-zone.safeZone')}</span>
                  </div>
                </div>
              </div>
              
              {image && (
                <Button onClick={handleDownload} className="w-full" data-testid="button-download">
                  <Download className="h-4 w-4 mr-2" />
                  {t('Common.actions.download')}
                </Button>
              )}
            </div>
            
            <div className="flex items-center justify-center">
              <div className="relative border rounded-lg overflow-hidden bg-muted/30" style={{ maxWidth: '270px' }}>
                {!image ? (
                  <div className="w-[270px] h-[480px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-sm">{t('Tools.tiktok-safe-zone.noImage')}</p>
                    </div>
                  </div>
                ) : (
                  <canvas
                    ref={canvasRef}
                    className="w-full h-auto"
                    style={{ maxHeight: '480px' }}
                    data-testid="canvas-preview"
                  />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
