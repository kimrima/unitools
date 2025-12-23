import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const QUOTES = {
  ko: [
    { text: '천 리 길도 한 걸음부터 시작된다.', author: '노자', category: 'motivation' },
    { text: '배움에는 끝이 없다.', author: '한국 속담', category: 'wisdom' },
    { text: '시작이 반이다.', author: '한국 속담', category: 'motivation' },
    { text: '고생 끝에 낙이 온다.', author: '한국 속담', category: 'perseverance' },
    { text: '뜻이 있는 곳에 길이 있다.', author: '한국 속담', category: 'motivation' },
    { text: '오늘 할 일을 내일로 미루지 마라.', author: '벤자민 프랭클린', category: 'productivity' },
    { text: '실패는 성공의 어머니이다.', author: '토마스 에디슨', category: 'perseverance' },
    { text: '꿈을 크게 꾸면 현실도 커진다.', author: '미상', category: 'dreams' },
    { text: '작은 일에도 최선을 다하라.', author: '이순신', category: 'excellence' },
    { text: '포기하지 않으면 실패란 없다.', author: '정주영', category: 'perseverance' },
    { text: '준비된 자에게 기회가 온다.', author: '아브라함 링컨', category: 'preparation' },
    { text: '성공의 비결은 시작하는 것이다.', author: '마크 트웨인', category: 'motivation' },
    { text: '매일 조금씩 나아지면 된다.', author: '존 우든', category: 'growth' },
    { text: '두려움을 느끼더라도 행동하라.', author: '넬슨 만델라', category: 'courage' },
    { text: '자신을 믿어라, 당신은 할 수 있다.', author: '마하트마 간디', category: 'self-belief' },
    { text: '열정 없이 이룬 위대한 일은 없다.', author: '랄프 왈도 에머슨', category: 'passion' },
    { text: '인내는 쓰지만 그 열매는 달다.', author: '장 자크 루소', category: 'patience' },
    { text: '변화를 두려워하지 마라.', author: '헬렌 켈러', category: 'change' },
    { text: '지금 이 순간에 최선을 다하라.', author: '오프라 윈프리', category: 'present' },
    { text: '실패해도 괜찮다, 다시 시작하면 된다.', author: '월트 디즈니', category: 'resilience' },
    { text: '가장 큰 위험은 아무런 위험도 감수하지 않는 것이다.', author: '마크 저커버그', category: 'risk' },
    { text: '성공은 여정이지 목적지가 아니다.', author: '아서 애쉬', category: 'journey' },
    { text: '할 수 있다고 믿으면 이미 반은 온 것이다.', author: '테오도어 루즈벨트', category: 'belief' },
    { text: '어제의 나보다 나은 오늘의 내가 되어라.', author: '미상', category: 'growth' },
    { text: '꿈을 이루는 유일한 방법은 깨어나는 것이다.', author: '폴 발레리', category: 'action' },
  ],
  en: [
    { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs', category: 'passion' },
    { text: 'Innovation distinguishes between a leader and a follower.', author: 'Steve Jobs', category: 'innovation' },
    { text: 'Stay hungry, stay foolish.', author: 'Steve Jobs', category: 'motivation' },
    { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt', category: 'dreams' },
    { text: 'It is during our darkest moments that we must focus to see the light.', author: 'Aristotle', category: 'perseverance' },
    { text: 'The only thing we have to fear is fear itself.', author: 'Franklin D. Roosevelt', category: 'courage' },
    { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein', category: 'opportunity' },
    { text: 'Life is what happens when you\'re busy making other plans.', author: 'John Lennon', category: 'life' },
    { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill', category: 'perseverance' },
    { text: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt', category: 'belief' },
    { text: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb', category: 'action' },
    { text: 'Your time is limited, don\'t waste it living someone else\'s life.', author: 'Steve Jobs', category: 'authenticity' },
    { text: 'The only impossible journey is the one you never begin.', author: 'Tony Robbins', category: 'motivation' },
    { text: 'Success usually comes to those who are too busy to be looking for it.', author: 'Henry David Thoreau', category: 'work' },
    { text: 'Don\'t be afraid to give up the good to go for the great.', author: 'John D. Rockefeller', category: 'excellence' },
    { text: 'I find that the harder I work, the more luck I seem to have.', author: 'Thomas Jefferson', category: 'work' },
    { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain', category: 'action' },
    { text: 'It always seems impossible until it is done.', author: 'Nelson Mandela', category: 'perseverance' },
    { text: 'The mind is everything. What you think you become.', author: 'Buddha', category: 'mindset' },
    { text: 'Strive not to be a success, but rather to be of value.', author: 'Albert Einstein', category: 'purpose' },
    { text: 'The only limit to our realization of tomorrow is our doubts of today.', author: 'Franklin D. Roosevelt', category: 'belief' },
    { text: 'Do what you can, with what you have, where you are.', author: 'Theodore Roosevelt', category: 'action' },
    { text: 'Whether you think you can or you think you can\'t, you\'re right.', author: 'Henry Ford', category: 'mindset' },
    { text: 'The greatest glory in living lies not in never falling, but in rising every time we fall.', author: 'Nelson Mandela', category: 'resilience' },
    { text: 'What you get by achieving your goals is not as important as what you become by achieving your goals.', author: 'Zig Ziglar', category: 'growth' },
    { text: 'If you want to lift yourself up, lift up someone else.', author: 'Booker T. Washington', category: 'kindness' },
    { text: 'Happiness is not something ready made. It comes from your own actions.', author: 'Dalai Lama', category: 'happiness' },
    { text: 'You miss 100% of the shots you don\'t take.', author: 'Wayne Gretzky', category: 'risk' },
    { text: 'The way to get started is to quit talking and begin doing.', author: 'Walt Disney', category: 'action' },
    { text: 'Everything you\'ve ever wanted is on the other side of fear.', author: 'George Addair', category: 'courage' },
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
