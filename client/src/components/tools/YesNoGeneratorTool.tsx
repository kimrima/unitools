import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThumbsUp, ThumbsDown, HelpCircle } from 'lucide-react';

type Answer = 'yes' | 'no' | 'maybe' | null;

export default function YesNoGeneratorTool() {
  const { t } = useTranslation();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<Answer>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [history, setHistory] = useState<{ question: string; answer: Answer }[]>([]);

  const generateAnswer = useCallback(() => {
    if (!question.trim()) return;
    
    setIsAnimating(true);
    setAnswer(null);
    
    let count = 0;
    const interval = setInterval(() => {
      const options: Answer[] = ['yes', 'no', 'maybe'];
      setAnswer(options[Math.floor(Math.random() * options.length)]);
      count++;
      if (count > 10) {
        clearInterval(interval);
        const finalAnswer: Answer = ['yes', 'no', 'maybe'][Math.floor(Math.random() * 3)] as Answer;
        setAnswer(finalAnswer);
        setHistory(prev => [...prev.slice(-9), { question: question.trim(), answer: finalAnswer }]);
        setIsAnimating(false);
      }
    }, 100);
  }, [question]);

  const getAnswerDisplay = () => {
    switch (answer) {
      case 'yes': return { text: t('Tools.yes-no-generator.yes', 'Yes'), icon: ThumbsUp, color: 'text-green-500 bg-green-100 dark:bg-green-900/30' };
      case 'no': return { text: t('Tools.yes-no-generator.no', 'No'), icon: ThumbsDown, color: 'text-red-500 bg-red-100 dark:bg-red-900/30' };
      case 'maybe': return { text: t('Tools.yes-no-generator.maybe', 'Maybe'), icon: HelpCircle, color: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30' };
      default: return null;
    }
  };

  const answerDisplay = getAnswerDisplay();

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-6">
            <div className="space-y-2 w-full max-w-md">
              <Label>{t('Tools.yes-no-generator.question', 'Your Question')}</Label>
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={t('Tools.yes-no-generator.placeholder', 'Enter your question...')}
                onKeyDown={(e) => e.key === 'Enter' && generateAnswer()}
                data-testid="input-question"
              />
            </div>

            <Button 
              size="lg" 
              onClick={generateAnswer} 
              disabled={isAnimating || !question.trim()}
              data-testid="button-generate"
            >
              {t('Tools.yes-no-generator.decide', 'Decide for Me')}
            </Button>

            {answer && answerDisplay && (
              <div className={`w-48 h-48 rounded-full flex flex-col items-center justify-center ${answerDisplay.color} transition-all ${isAnimating ? 'animate-pulse' : ''}`}>
                <answerDisplay.icon className={`w-16 h-16 ${answerDisplay.color.split(' ')[0]} mb-2`} />
                <div className="text-3xl font-bold" data-testid="answer-display">
                  {answerDisplay.text}
                </div>
              </div>
            )}

            {history.length > 0 && (
              <div className="w-full max-w-md">
                <Label className="mb-2 block">{t('Tools.yes-no-generator.history', 'History')}</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {history.slice().reverse().map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-muted rounded-lg text-sm">
                      <span className="truncate flex-1 mr-2">{item.question}</span>
                      <span className={`font-medium ${
                        item.answer === 'yes' ? 'text-green-500' : 
                        item.answer === 'no' ? 'text-red-500' : 'text-yellow-500'
                      }`}>
                        {item.answer === 'yes' ? t('Tools.yes-no-generator.yes', 'Yes') :
                         item.answer === 'no' ? t('Tools.yes-no-generator.no', 'No') :
                         t('Tools.yes-no-generator.maybe', 'Maybe')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
