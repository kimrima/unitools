import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Download, Youtube, Search, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const THUMBNAIL_QUALITIES = [
  { id: 'maxresdefault', label: 'Max Resolution (1280x720)', suffix: 'maxresdefault' },
  { id: 'sddefault', label: 'Standard (640x480)', suffix: 'sddefault' },
  { id: 'hqdefault', label: 'High Quality (480x360)', suffix: 'hqdefault' },
  { id: 'mqdefault', label: 'Medium Quality (320x180)', suffix: 'mqdefault' },
  { id: 'default', label: 'Default (120x90)', suffix: 'default' },
];

export default function YoutubeThumbnailTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [thumbnails, setThumbnails] = useState<typeof THUMBNAIL_QUALITIES>([]);

  const extractVideoId = (input: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleSearch = () => {
    const id = extractVideoId(url);
    if (!id) {
      toast({
        title: t('Tools.youtube-thumbnail.invalidUrl'),
        variant: 'destructive',
      });
      return;
    }
    
    setVideoId(id);
    setThumbnails(THUMBNAIL_QUALITIES);
  };

  const getThumbnailUrl = (quality: string) => {
    return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
  };

  const handleDownload = async (quality: string, label: string) => {
    try {
      const response = await fetch(getThumbnailUrl(quality));
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `youtube-thumbnail-${videoId}-${quality}.jpg`;
      link.click();
      
      URL.revokeObjectURL(url);
      
      toast({
        title: t('Common.messages.complete'),
        description: t('Common.actions.download'),
      });
    } catch (error) {
      toast({
        title: t('Common.errors.PROCESSING_FAILED'),
        variant: 'destructive',
      });
    }
  };

  const handleOpenVideo = () => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('Tools.youtube-thumbnail.urlLabel')}</Label>
              <div className="flex gap-2">
                <Input
                  placeholder={t('Tools.youtube-thumbnail.urlPlaceholder')}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  data-testid="input-url"
                />
                <Button onClick={handleSearch} data-testid="button-search">
                  <Search className="h-4 w-4 mr-2" />
                  {t('Tools.youtube-thumbnail.extract')}
                </Button>
              </div>
            </div>

            {videoId && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Youtube className="h-5 w-5 text-red-500" />
                    <span className="font-mono text-sm">{videoId}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleOpenVideo} data-testid="button-open">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {t('Tools.youtube-thumbnail.openVideo')}
                  </Button>
                </div>

                <div className="grid gap-4">
                  {thumbnails.map((quality) => (
                    <div 
                      key={quality.id} 
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg bg-muted/30 border"
                    >
                      <img
                        src={getThumbnailUrl(quality.suffix)}
                        alt={quality.label}
                        className="w-full sm:w-48 rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{quality.label}</p>
                        <p className="text-sm text-muted-foreground font-mono break-all">
                          {getThumbnailUrl(quality.suffix)}
                        </p>
                      </div>
                      <Button 
                        onClick={() => handleDownload(quality.suffix, quality.label)}
                        data-testid={`button-download-${quality.id}`}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {t('Common.actions.download')}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!videoId && (
              <div className="flex items-center justify-center p-12 border-2 border-dashed rounded-lg">
                <div className="text-center text-muted-foreground">
                  <Youtube className="h-12 w-12 mx-auto mb-2" />
                  <p>{t('Tools.youtube-thumbnail.noVideo')}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
