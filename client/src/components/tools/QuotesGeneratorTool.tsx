import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const QUOTES = {
  ko: [
    { text: '천 리 길도 한 걸음부터 시작된다.', author: '노자' },
    { text: '배움에는 끝이 없다.', author: '한국 속담' },
    { text: '시작이 반이다.', author: '한국 속담' },
    { text: '고생 끝에 낙이 온다.', author: '한국 속담' },
    { text: '뜻이 있는 곳에 길이 있다.', author: '한국 속담' },
    { text: '오늘 할 일을 내일로 미루지 마라.', author: '벤자민 프랭클린' },
    { text: '실패는 성공의 어머니이다.', author: '토마스 에디슨' },
    { text: '꿈을 크게 꾸면 현실도 커진다.', author: '미상' },
  ],
  en: [
    { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
    { text: 'Innovation distinguishes between a leader and a follower.', author: 'Steve Jobs' },
    { text: 'Stay hungry, stay foolish.', author: 'Steve Jobs' },
    { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
    { text: 'It is during our darkest moments that we must focus to see the light.', author: 'Aristotle' },
    { text: 'The only thing we have to fear is fear itself.', author: 'Franklin D. Roosevelt' },
    { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein' },
    { text: 'Life is what happens when you\'re busy making other plans.', author: 'John Lennon' },
  ],
};

export default function QuotesGeneratorTool() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const lang = i18n.language.startsWith('ko') ? 'ko' : 'en';
  const quotes = QUOTES[lang];
  
  const [currentQuote, setCurrentQuote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);
  const [copied, setCopied] = useState(false);

  const getNewQuote = useCallback(() => {
    let newQuote;
    do {
      newQuote = quotes[Math.floor(Math.random() * quotes.length)];
    } while (newQuote.text === currentQuote.text && quotes.length > 1);
    setCurrentQuote(newQuote);
    setCopied(false);
  }, [currentQuote, quotes]);

  const copyQuote = useCallback(async () => {
    const text = `"${currentQuote.text}" - ${currentQuote.author}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ description: t('Common.actions.copy', 'Copied!') });
    setTimeout(() => setCopied(false), 2000);
  }, [currentQuote, toast, t]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-full max-w-2xl text-center p-8 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl">
              <blockquote className="text-2xl md:text-3xl font-serif italic leading-relaxed" data-testid="quote-text">
                "{currentQuote.text}"
              </blockquote>
              <cite className="block mt-4 text-lg text-muted-foreground not-italic" data-testid="quote-author">
                — {currentQuote.author}
              </cite>
            </div>

            <div className="flex gap-4">
              <Button size="lg" onClick={getNewQuote} data-testid="button-new-quote">
                <RefreshCw className="mr-2 h-5 w-5" />
                {t('Tools.quotes-generator.newQuote', 'New Quote')}
              </Button>
              <Button size="lg" variant="outline" onClick={copyQuote} data-testid="button-copy">
                {copied ? <Check className="mr-2 h-5 w-5" /> : <Copy className="mr-2 h-5 w-5" />}
                {copied ? t('Common.actions.copied', 'Copied!') : t('Common.actions.copy', 'Copy')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
