import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Link2, Check, Share2 } from 'lucide-react';
import { SiWhatsapp, SiTelegram, SiX, SiFacebook, SiLinkedin, SiReddit, SiPinterest, SiLine } from 'react-icons/si';

interface ShareActionsProps {
  title?: string;
  description?: string;
}

export function ShareActions({ title, description }: ShareActionsProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = title || t('Common.share.defaultTitle', { defaultValue: 'UniTools - Free Online Tools' });
  const shareDescription = description || t('Common.share.defaultDescription', { defaultValue: 'Try this useful online tool!' });

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: t('Common.share.linkCopied', { defaultValue: 'Link copied!' }),
        description: t('Common.share.linkCopiedDesc', { defaultValue: 'Share this link with others.' }),
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: t('Common.errors.COPY_FAILED', { defaultValue: 'Copy failed' }),
        variant: 'destructive',
      });
    }
  }, [shareUrl, toast, t]);

  const handleShareWhatsApp = useCallback(() => {
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`;
    window.open(whatsappUrl, '_blank', 'width=600,height=400');
  }, [shareUrl, shareTitle]);

  const handleShareTelegram = useCallback(() => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
    window.open(telegramUrl, '_blank', 'width=600,height=400');
  }, [shareUrl, shareTitle]);

  const handleShareTwitter = useCallback(() => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  }, [shareUrl, shareTitle]);

  const handleShareFacebook = useCallback(() => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  }, [shareUrl]);

  const handleShareLinkedIn = useCallback(() => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=400');
  }, [shareUrl]);

  const handleShareReddit = useCallback(() => {
    const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`;
    window.open(redditUrl, '_blank', 'width=600,height=600');
  }, [shareUrl, shareTitle]);

  const handleSharePinterest = useCallback(() => {
    const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(shareTitle)}`;
    window.open(pinterestUrl, '_blank', 'width=600,height=400');
  }, [shareUrl, shareTitle]);

  const handleShareLine = useCallback(() => {
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`;
    window.open(lineUrl, '_blank', 'width=600,height=400');
  }, [shareUrl]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: shareUrl,
        });
      } catch {
        // User cancelled or error
      }
    }
  }, [shareTitle, shareDescription, shareUrl]);

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-primary" />
          <span className="font-medium">{t('Common.share.title', { defaultValue: 'Share this tool' })}</span>
        </div>
        
        <p className="text-sm text-muted-foreground">
          {t('Common.share.helpOthers', { defaultValue: 'Help others discover this useful tool!' })}
        </p>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareWhatsApp}
            className="gap-2"
            data-testid="button-share-whatsapp"
          >
            <SiWhatsapp className="w-4 h-4" style={{ color: '#25D366' }} />
            <span className="hidden sm:inline">WhatsApp</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShareTelegram}
            className="gap-2"
            data-testid="button-share-telegram"
          >
            <SiTelegram className="w-4 h-4" style={{ color: '#0088cc' }} />
            <span className="hidden sm:inline">Telegram</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareTwitter}
            className="gap-2"
            data-testid="button-share-twitter"
          >
            <SiX className="w-4 h-4" />
            <span className="hidden sm:inline">X</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareFacebook}
            className="gap-2"
            data-testid="button-share-facebook"
          >
            <SiFacebook className="w-4 h-4" style={{ color: '#1877F2' }} />
            <span className="hidden sm:inline">Facebook</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShareReddit}
            className="gap-2"
            data-testid="button-share-reddit"
          >
            <SiReddit className="w-4 h-4" style={{ color: '#FF4500' }} />
            <span className="hidden sm:inline">Reddit</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareLinkedIn}
            className="gap-2"
            data-testid="button-share-linkedin"
          >
            <SiLinkedin className="w-4 h-4" style={{ color: '#0A66C2' }} />
            <span className="hidden sm:inline">LinkedIn</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSharePinterest}
            className="gap-2"
            data-testid="button-share-pinterest"
          >
            <SiPinterest className="w-4 h-4" style={{ color: '#E60023' }} />
            <span className="hidden sm:inline">Pinterest</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShareLine}
            className="gap-2"
            data-testid="button-share-line"
          >
            <SiLine className="w-4 h-4" style={{ color: '#00C300' }} />
            <span className="hidden sm:inline">LINE</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="gap-2"
            data-testid="button-copy-link"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                <span>{t('Common.share.copied', { defaultValue: 'Copied!' })}</span>
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4" />
                <span>{t('Common.share.copyLink', { defaultValue: 'Copy Link' })}</span>
              </>
            )}
          </Button>
          
          {'share' in navigator && (
            <Button
              variant="default"
              size="sm"
              onClick={handleNativeShare}
              className="gap-2"
              data-testid="button-native-share"
            >
              <Share2 className="w-4 h-4" />
              <span>{t('Common.share.more', { defaultValue: 'More' })}</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
