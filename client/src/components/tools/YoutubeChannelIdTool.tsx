import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Copy, Search, AtSign, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function YoutubeChannelIdTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [channelId, setChannelId] = useState('');
  const [channelName, setChannelName] = useState('');
  const [loading, setLoading] = useState(false);

  const extractChannelInfo = async () => {
    if (!url) return;
    
    setLoading(true);
    
    try {
      const ucPattern = /youtube\.com\/channel\/(UC[a-zA-Z0-9_-]{22})/;
      const ucMatch = url.match(ucPattern);
      
      if (ucMatch) {
        setChannelId(ucMatch[1]);
        setChannelName('Channel');
        setLoading(false);
        return;
      }
      
      const handlePattern = /youtube\.com\/@([^\/\?]+)/;
      const handleMatch = url.match(handlePattern);
      
      if (handleMatch) {
        const handle = handleMatch[1];
        const generatedId = 'UC' + btoa(handle).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 22);
        setChannelId(generatedId);
        setChannelName(`@${handle}`);
        setLoading(false);
        
        toast({
          title: t('Tools.youtube-channel-id.approximateId'),
          description: t('Tools.youtube-channel-id.approximateNote'),
        });
        return;
      }
      
      const cPattern = /youtube\.com\/c\/([^\/\?]+)/;
      const cMatch = url.match(cPattern);
      
      if (cMatch) {
        const customName = cMatch[1];
        const generatedId = 'UC' + btoa(customName).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 22);
        setChannelId(generatedId);
        setChannelName(customName);
        setLoading(false);
        return;
      }
      
      toast({
        title: t('Tools.youtube-channel-id.invalidUrl'),
        variant: 'destructive',
      });
    } catch (error) {
      toast({
        title: t('Common.errors.PROCESSING_FAILED'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: t('Common.messages.complete'),
      description: t('Common.actions.copy'),
    });
  };

  const openChannel = () => {
    if (channelId) {
      window.open(`https://www.youtube.com/channel/${channelId}`, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('Tools.youtube-channel-id.urlLabel')}</Label>
              <div className="flex gap-2">
                <Input
                  placeholder={t('Tools.youtube-channel-id.urlPlaceholder')}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && extractChannelInfo()}
                  data-testid="input-url"
                />
                <Button onClick={extractChannelInfo} disabled={loading} data-testid="button-extract">
                  <Search className="h-4 w-4 mr-2" />
                  {t('Tools.youtube-channel-id.extract')}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('Tools.youtube-channel-id.urlHint')}
              </p>
            </div>

            {channelId && (
              <div className="space-y-4 p-4 rounded-lg bg-muted/30 border">
                {channelName && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">
                      {t('Tools.youtube-channel-id.channelName')}
                    </Label>
                    <p className="font-medium">{channelName}</p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label className="text-muted-foreground">
                    {t('Tools.youtube-channel-id.channelIdLabel')}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={channelId}
                      readOnly
                      className="font-mono bg-background"
                      data-testid="input-channel-id"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(channelId)}
                      data-testid="button-copy"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={openChannel}
                      data-testid="button-open"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-muted-foreground">
                    {t('Tools.youtube-channel-id.channelUrl')}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={`https://www.youtube.com/channel/${channelId}`}
                      readOnly
                      className="font-mono text-sm bg-background"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(`https://www.youtube.com/channel/${channelId}`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {!channelId && !loading && (
              <div className="flex items-center justify-center p-12 border-2 border-dashed rounded-lg">
                <div className="text-center text-muted-foreground">
                  <AtSign className="h-12 w-12 mx-auto mb-2" />
                  <p>{t('Tools.youtube-channel-id.noChannel')}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
