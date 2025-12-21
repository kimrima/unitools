import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Download, RectangleHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BANNER_SIZES = {
  google: [
    { name: 'Leaderboard', width: 728, height: 90, popular: true },
    { name: 'Large Rectangle', width: 336, height: 280, popular: true },
    { name: 'Medium Rectangle', width: 300, height: 250, popular: true },
    { name: 'Wide Skyscraper', width: 160, height: 600, popular: false },
    { name: 'Half Page', width: 300, height: 600, popular: true },
    { name: 'Billboard', width: 970, height: 250, popular: false },
    { name: 'Large Leaderboard', width: 970, height: 90, popular: false },
    { name: 'Mobile Banner', width: 320, height: 50, popular: true },
    { name: 'Large Mobile Banner', width: 320, height: 100, popular: true },
  ],
  facebook: [
    { name: 'Feed Image', width: 1200, height: 628, popular: true },
    { name: 'Stories', width: 1080, height: 1920, popular: true },
    { name: 'Carousel', width: 1080, height: 1080, popular: true },
    { name: 'Collection', width: 1200, height: 628, popular: false },
    { name: 'Messenger', width: 1200, height: 628, popular: false },
  ],
  instagram: [
    { name: 'Square Post', width: 1080, height: 1080, popular: true },
    { name: 'Portrait Post', width: 1080, height: 1350, popular: true },
    { name: 'Landscape Post', width: 1080, height: 566, popular: false },
    { name: 'Stories', width: 1080, height: 1920, popular: true },
    { name: 'Reels', width: 1080, height: 1920, popular: true },
  ],
  naver: [
    { name: 'Main Banner', width: 1200, height: 600, popular: true },
    { name: 'Side Banner', width: 160, height: 600, popular: false },
    { name: 'Blog Banner', width: 250, height: 250, popular: true },
    { name: 'Shopping Banner', width: 300, height: 250, popular: true },
    { name: 'Search AD', width: 970, height: 280, popular: true },
  ],
  youtube: [
    { name: 'Channel Banner', width: 2560, height: 1440, popular: true },
    { name: 'Thumbnail', width: 1280, height: 720, popular: true },
    { name: 'Display Ad', width: 300, height: 250, popular: true },
    { name: 'Overlay Ad', width: 480, height: 70, popular: false },
    { name: 'Skippable Video', width: 1920, height: 1080, popular: true },
  ],
};

export default function AdBannerGuideTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedPlatform, setSelectedPlatform] = useState('google');

  const handleCopySize = async (width: number, height: number) => {
    await navigator.clipboard.writeText(`${width}x${height}`);
    toast({
      title: t('Common.messages.complete'),
      description: t('Common.actions.copy'),
    });
  };

  const handleDownloadCanvas = (width: number, height: number, name: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = Math.min(width, 2560);
    canvas.height = Math.min(height, 1440);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    ctx.fillStyle = '#666666';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${width} x ${height}`, canvas.width / 2, canvas.height / 2 - 20);
    
    ctx.font = '18px Inter, sans-serif';
    ctx.fillText(name, canvas.width / 2, canvas.height / 2 + 20);

    const link = document.createElement('a');
    link.download = `${name.toLowerCase().replace(/\s+/g, '-')}-${width}x${height}.png`;
    link.href = canvas.toDataURL('image/png');
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
          <Tabs value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <TabsList className="flex flex-wrap h-auto gap-1">
              <TabsTrigger value="google">Google Ads</TabsTrigger>
              <TabsTrigger value="facebook">Facebook</TabsTrigger>
              <TabsTrigger value="instagram">Instagram</TabsTrigger>
              <TabsTrigger value="youtube">YouTube</TabsTrigger>
              <TabsTrigger value="naver">Naver</TabsTrigger>
            </TabsList>
            
            {Object.entries(BANNER_SIZES).map(([platform, sizes]) => (
              <TabsContent key={platform} value={platform} className="mt-4">
                <div className="grid gap-3">
                  {sizes.map((size, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-lg bg-muted/30 border"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/50"
                          style={{ 
                            width: Math.min(size.width / 10, 80),
                            height: Math.min(size.height / 10, 60),
                            minWidth: 30,
                            minHeight: 20,
                          }}
                        >
                          <RectangleHorizontal className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{size.name}</span>
                            {size.popular && (
                              <Badge variant="default" className="text-xs">
                                {t('Tools.ad-banner-guide.popular')}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground font-mono">
                            {size.width} x {size.height} px
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopySize(size.width, size.height)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          {t('Common.actions.copy')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadCanvas(size.width, size.height, size.name)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {t('Tools.ad-banner-guide.template')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
