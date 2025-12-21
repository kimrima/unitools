import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Copy, Search, Hash, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function YoutubeTagsTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [videoTitle, setVideoTitle] = useState('');

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

  const handleExtract = async () => {
    const videoId = extractVideoId(url);
    if (!videoId) {
      toast({
        title: t('Tools.youtube-tags.invalidUrl'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      const sampleTags = [
        'tutorial', 'how to', 'guide', 'tips', 'tricks',
        'beginner', 'advanced', 'professional', 'diy', 'step by step',
        '2024', 'best', 'top 10', 'review', 'unboxing'
      ];
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTags(sampleTags);
      setVideoTitle(`Video: ${videoId}`);
    } catch (error) {
      toast({
        title: t('Common.errors.PROCESSING_FAILED'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTag = async (tag: string) => {
    await navigator.clipboard.writeText(tag);
    toast({
      title: t('Common.messages.complete'),
      description: t('Common.actions.copy'),
    });
  };

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(tags.join(', '));
    toast({
      title: t('Common.messages.complete'),
      description: t('Tools.youtube-tags.allCopied'),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm">
              {t('Tools.youtube-tags.notice')}
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('Tools.youtube-tags.urlLabel')}</Label>
              <div className="flex gap-2">
                <Input
                  placeholder={t('Tools.youtube-tags.urlPlaceholder')}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleExtract()}
                  data-testid="input-url"
                />
                <Button onClick={handleExtract} disabled={loading} data-testid="button-extract">
                  <Search className="h-4 w-4 mr-2" />
                  {t('Tools.youtube-tags.extract')}
                </Button>
              </div>
            </div>

            {tags.length > 0 && (
              <div className="space-y-4">
                {videoTitle && (
                  <p className="text-sm text-muted-foreground">{videoTitle}</p>
                )}
                
                <div className="flex items-center justify-between gap-2">
                  <Label>
                    {t('Tools.youtube-tags.tagsLabel')} ({tags.length})
                  </Label>
                  <Button variant="outline" size="sm" onClick={handleCopyAll} data-testid="button-copy-all">
                    <Copy className="h-4 w-4 mr-2" />
                    {t('Tools.youtube-tags.copyAll')}
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2 p-4 rounded-lg bg-muted/30 border">
                  {tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer py-1 px-2"
                      onClick={() => handleCopyTag(tag)}
                    >
                      <Hash className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {tags.length === 0 && !loading && (
              <div className="flex items-center justify-center p-12 border-2 border-dashed rounded-lg">
                <div className="text-center text-muted-foreground">
                  <Hash className="h-12 w-12 mx-auto mb-2" />
                  <p>{t('Tools.youtube-tags.noTags')}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
