import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Twitter, AlertCircle, CheckCircle } from 'lucide-react';
import { SiX } from 'react-icons/si';
import { useToast } from '@/hooks/use-toast';

const TWITTER_CHAR_LIMIT = 280;
const URL_LENGTH = 23;
const MENTION_REGEX = /@\w+/g;
const URL_REGEX = /https?:\/\/[^\s]+/g;
const HASHTAG_REGEX = /#\w+/g;

export default function TwitterCharCountTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [text, setText] = useState('');

  const analysis = useMemo(() => {
    if (!text) {
      return {
        charCount: 0,
        twitterLength: 0,
        urls: [],
        mentions: [],
        hashtags: [],
        isValid: true,
        remaining: TWITTER_CHAR_LIMIT,
      };
    }

    const urls = text.match(URL_REGEX) || [];
    const mentions = text.match(MENTION_REGEX) || [];
    const hashtags = text.match(HASHTAG_REGEX) || [];
    
    let twitterLength = Array.from(text).length;
    
    urls.forEach(url => {
      twitterLength -= url.length;
      twitterLength += URL_LENGTH;
    });

    const remaining = TWITTER_CHAR_LIMIT - twitterLength;
    const isValid = twitterLength <= TWITTER_CHAR_LIMIT;

    return {
      charCount: text.length,
      twitterLength,
      urls,
      mentions,
      hashtags,
      isValid,
      remaining,
    };
  }, [text]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    toast({
      title: t('Common.messages.complete'),
      description: t('Common.actions.copy'),
    });
  };

  const progressPercent = Math.min((analysis.twitterLength / TWITTER_CHAR_LIMIT) * 100, 100);
  const getProgressColor = () => {
    if (analysis.twitterLength > TWITTER_CHAR_LIMIT) return 'bg-destructive';
    if (analysis.twitterLength > 260) return 'bg-yellow-500';
    return 'bg-primary';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <SiX className="h-5 w-5" />
                  <span className="font-medium">{t('Tools.twitter-char-count.title')}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!text}
                  data-testid="button-copy"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {t('Common.actions.copy')}
                </Button>
              </div>
              
              <Textarea
                placeholder={t('Tools.twitter-char-count.placeholder')}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[150px] text-base resize-none"
                data-testid="textarea-input"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {analysis.isValid ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  )}
                  <span className={analysis.isValid ? 'text-muted-foreground' : 'text-destructive'}>
                    {analysis.twitterLength} / {TWITTER_CHAR_LIMIT}
                  </span>
                </div>
                <span className={analysis.remaining < 0 ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                  {analysis.remaining >= 0 
                    ? t('Tools.twitter-char-count.remaining', { count: analysis.remaining })
                    : t('Tools.twitter-char-count.over', { count: Math.abs(analysis.remaining) })
                  }
                </span>
              </div>
              
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`absolute inset-y-0 left-0 transition-all ${getProgressColor()}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold">{analysis.charCount}</p>
                <p className="text-xs text-muted-foreground">{t('Tools.twitter-char-count.characters')}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold">{analysis.urls.length}</p>
                <p className="text-xs text-muted-foreground">{t('Tools.twitter-char-count.urls')}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold">{analysis.mentions.length}</p>
                <p className="text-xs text-muted-foreground">{t('Tools.twitter-char-count.mentions')}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold">{analysis.hashtags.length}</p>
                <p className="text-xs text-muted-foreground">{t('Tools.twitter-char-count.hashtags')}</p>
              </div>
            </div>

            {analysis.urls.length > 0 && (
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-muted-foreground mb-2">
                  {t('Tools.twitter-char-count.urlNote')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {analysis.urls.map((url, i) => (
                    <Badge key={i} variant="secondary" className="text-xs truncate max-w-[200px]">
                      {url}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {(analysis.mentions.length > 0 || analysis.hashtags.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {analysis.mentions.map((mention, i) => (
                  <Badge key={'m' + i} variant="outline" className="text-blue-500">
                    {mention}
                  </Badge>
                ))}
                {analysis.hashtags.map((hashtag, i) => (
                  <Badge key={'h' + i} variant="outline" className="text-primary">
                    {hashtag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
