import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function UtmBuilderTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [baseUrl, setBaseUrl] = useState('');
  const [source, setSource] = useState('');
  const [medium, setMedium] = useState('');
  const [campaign, setCampaign] = useState('');
  const [term, setTerm] = useState('');
  const [content, setContent] = useState('');

  const generatedUrl = useMemo(() => {
    if (!baseUrl) return '';
    
    try {
      const url = new URL(baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`);
      
      if (source) url.searchParams.set('utm_source', source);
      if (medium) url.searchParams.set('utm_medium', medium);
      if (campaign) url.searchParams.set('utm_campaign', campaign);
      if (term) url.searchParams.set('utm_term', term);
      if (content) url.searchParams.set('utm_content', content);
      
      return url.toString();
    } catch {
      return '';
    }
  }, [baseUrl, source, medium, campaign, term, content]);

  const handleCopy = async () => {
    if (!generatedUrl) return;
    await navigator.clipboard.writeText(generatedUrl);
    toast({
      title: t('Common.messages.complete'),
      description: t('Common.actions.copy'),
    });
  };

  const handleShare = async () => {
    if (!generatedUrl) return;
    
    try {
      if (navigator.share) {
        await navigator.share({ url: generatedUrl });
      } else {
        handleCopy();
      }
    } catch {
      handleCopy();
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('Tools.utm-builder.baseUrlLabel')} *</Label>
              <Input
                placeholder="https://example.com"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                data-testid="input-base-url"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('Tools.utm-builder.sourceLabel')} *</Label>
                <Input
                  placeholder="google, facebook, newsletter"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  data-testid="input-source"
                />
              </div>
              
              <div className="space-y-2">
                <Label>{t('Tools.utm-builder.mediumLabel')} *</Label>
                <Input
                  placeholder="cpc, social, email"
                  value={medium}
                  onChange={(e) => setMedium(e.target.value)}
                  data-testid="input-medium"
                />
              </div>
              
              <div className="space-y-2">
                <Label>{t('Tools.utm-builder.campaignLabel')} *</Label>
                <Input
                  placeholder="summer_sale, product_launch"
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  data-testid="input-campaign"
                />
              </div>
              
              <div className="space-y-2">
                <Label>{t('Tools.utm-builder.termLabel')}</Label>
                <Input
                  placeholder="running+shoes"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  data-testid="input-term"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label>{t('Tools.utm-builder.contentLabel')}</Label>
                <Input
                  placeholder="banner_ad, text_link"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  data-testid="input-content"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label>{t('Tools.utm-builder.resultLabel')}</Label>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShare}
                    disabled={!generatedUrl}
                    data-testid="button-share"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    disabled={!generatedUrl}
                    data-testid="button-copy"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Textarea
                value={generatedUrl}
                readOnly
                className="font-mono text-sm bg-muted/30"
                placeholder={t('Tools.utm-builder.resultPlaceholder')}
                data-testid="textarea-result"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
