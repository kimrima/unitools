import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ANSWERS = {
  ko: [
    '그렇습니다', '분명히 그렇습니다', '의심할 여지없이', '확실히 그렇습니다',
    '아마도 그럴 것입니다', '전망이 좋습니다', '그렇다고 봅니다', '가능성이 높습니다',
    '잘 모르겠습니다', '나중에 다시 물어보세요', '지금은 말할 수 없습니다', '집중해서 다시 물어보세요',
    '기대하지 마세요', '아닐 것 같습니다', '아니요', '전망이 좋지 않습니다',
  ],
  en: [
    'It is certain', 'It is decidedly so', 'Without a doubt', 'Yes definitely',
    'You may rely on it', 'As I see it, yes', 'Most likely', 'Outlook good',
    'Reply hazy, try again', 'Ask again later', 'Cannot predict now', 'Concentrate and ask again',
    "Don't count on it", 'My reply is no', 'My sources say no', 'Outlook not so good',
  ],
};

export default function Magic8BallTool() {
  const { t, i18n } = useTranslation();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const lang = i18n.language.startsWith('ko') ? 'ko' : 'en';
  const answers = ANSWERS[lang];

  const askQuestion = () => {
    if (!question.trim()) return;
    setIsShaking(true);
    setAnswer(null);
    
    setTimeout(() => {
      const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
      setAnswer(randomAnswer);
      setIsShaking(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-6">
            <div className="space-y-2 w-full max-w-md">
              <Label>{t('Tools.magic-8-ball.question', 'Your Question')}</Label>
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={t('Tools.magic-8-ball.placeholder', 'Ask a yes or no question...')}
                onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
                data-testid="input-question"
              />
            </div>

            <div 
              className={`relative w-48 h-48 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-2xl ${isShaking ? 'animate-pulse' : ''}`}
              style={{ 
                animation: isShaking ? 'shake 0.5s ease-in-out infinite' : 'none',
              }}
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-900 to-blue-600 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-blue-950 flex items-center justify-center p-2">
                  <span className="text-white text-xs text-center font-medium">
                    {isShaking ? '...' : (answer || '8')}
                  </span>
                </div>
              </div>
            </div>

            <Button onClick={askQuestion} disabled={isShaking || !question.trim()} data-testid="button-ask">
              {t('Tools.magic-8-ball.ask', 'Ask the Magic 8-Ball')}
            </Button>

            {answer && !isShaking && (
              <div className="text-center p-4 bg-primary/10 rounded-lg w-full max-w-md">
                <div className="text-lg font-semibold" data-testid="answer-display">
                  {answer}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px) rotate(-2deg); }
          75% { transform: translateX(5px) rotate(2deg); }
        }
      `}</style>
    </div>
  );
}
