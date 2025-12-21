import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Copy, Link, QrCode, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function UrlShortenerTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');

  const generateShortUrl = () => {
    if (!longUrl) return;
    
    try {
      new URL(longUrl.startsWith('http') ? longUrl : `https://${longUrl}`);
    } catch {
      toast({
        title: t('Tools.url-shortener.invalidUrl'),
        variant: 'destructive',
      });
      return;
    }

    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let hash = customAlias || '';
    
    if (!hash) {
      for (let i = 0; i < 6; i++) {
        hash += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }
    
    const baseUrl = window.location.origin;
    setShortUrl(`${baseUrl}/s/${hash}`);
    
    toast({
      title: t('Common.messages.complete'),
      description: t('Tools.url-shortener.generated'),
    });
  };

  const handleCopy = async () => {
    if (!shortUrl) return;
    await navigator.clipboard.writeText(shortUrl);
    toast({
      title: t('Common.messages.complete'),
      description: t('Common.actions.copy'),
    });
  };

  const handleCopyOriginal = async () => {
    if (!longUrl) return;
    await navigator.clipboard.writeText(longUrl);
    toast({
      title: t('Common.messages.complete'),
      description: t('Common.actions.copy'),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
            <p className="text-sm">
              {t('Tools.url-shortener.notice')}
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('Tools.url-shortener.longUrlLabel')}</Label>
              <div className="flex gap-2">
                <Input
                  placeholder={t('Tools.url-shortener.longUrlPlaceholder')}
                  value={longUrl}
                  onChange={(e) => setLongUrl(e.target.value)}
                  data-testid="input-long-url"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyOriginal}
                  disabled={!longUrl}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>{t('Tools.url-shortener.customAliasLabel')}</Label>
              <Input
                placeholder={t('Tools.url-shortener.customAliasPlaceholder')}
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                data-testid="input-custom-alias"
              />
              <p className="text-xs text-muted-foreground">
                {t('Tools.url-shortener.customAliasHint')}
              </p>
            </div>
            
            <Button 
              onClick={generateShortUrl} 
              disabled={!longUrl}
              className="w-full"
              data-testid="button-generate"
            >
              <Link className="h-4 w-4 mr-2" />
              {t('Tools.url-shortener.generate')}
            </Button>
            
            {shortUrl && (
              <div className="space-y-2 p-4 rounded-lg bg-muted/30 border">
                <Label>{t('Tools.url-shortener.shortUrlLabel')}</Label>
                <div className="flex gap-2">
                  <Input
                    value={shortUrl}
                    readOnly
                    className="font-mono bg-background"
                    data-testid="input-short-url"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    data-testid="button-copy"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(longUrl, '_blank')}
                    data-testid="button-open"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {t('Tools.url-shortener.testLink')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
