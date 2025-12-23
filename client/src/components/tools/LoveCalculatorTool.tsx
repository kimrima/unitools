import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart } from 'lucide-react';

export default function LoveCalculatorTool() {
  const { t } = useTranslation();
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateLove = () => {
    if (!name1.trim() || !name2.trim()) return;
    
    setIsCalculating(true);
    setResult(null);
    
    setTimeout(() => {
      const combined = (name1 + name2).toLowerCase();
      let hash = 0;
      for (let i = 0; i < combined.length; i++) {
        hash = ((hash << 5) - hash) + combined.charCodeAt(i);
        hash = hash & hash;
      }
      const percentage = Math.abs(hash % 101);
      setResult(percentage);
      setIsCalculating(false);
    }, 1500);
  };

  const getMessage = (score: number) => {
    if (score >= 90) return t('Tools.love-calculator.perfect', 'Perfect match!');
    if (score >= 70) return t('Tools.love-calculator.great', 'Great compatibility!');
    if (score >= 50) return t('Tools.love-calculator.good', 'Good potential!');
    if (score >= 30) return t('Tools.love-calculator.possible', 'Possible connection');
    return t('Tools.love-calculator.tryAgain', 'Maybe just friends?');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-6">
            <div className="grid md:grid-cols-3 gap-4 items-end w-full max-w-xl">
              <div className="space-y-2">
                <Label>{t('Tools.love-calculator.name1', 'Your Name')}</Label>
                <Input
                  value={name1}
                  onChange={(e) => setName1(e.target.value)}
                  placeholder={t('Tools.love-calculator.enterName', 'Enter name')}
                  data-testid="input-name1"
                />
              </div>
              
              <div className="flex justify-center">
                <Heart className={`w-12 h-12 text-red-500 ${isCalculating ? 'animate-pulse' : ''}`} fill="currentColor" />
              </div>
              
              <div className="space-y-2">
                <Label>{t('Tools.love-calculator.name2', 'Partner Name')}</Label>
                <Input
                  value={name2}
                  onChange={(e) => setName2(e.target.value)}
                  placeholder={t('Tools.love-calculator.enterName', 'Enter name')}
                  data-testid="input-name2"
                />
              </div>
            </div>

            <Button 
              onClick={calculateLove} 
              disabled={isCalculating || !name1.trim() || !name2.trim()}
              data-testid="button-calculate"
            >
              <Heart className="mr-2 h-4 w-4" />
              {t('Tools.love-calculator.calculate', 'Calculate Love')}
            </Button>

            {result !== null && (
              <div className="text-center p-6 bg-gradient-to-br from-pink-100 to-red-100 dark:from-pink-900/30 dark:to-red-900/30 rounded-xl w-full max-w-md">
                <div className="text-6xl font-bold text-red-500 mb-2" data-testid="result-display">
                  {result}%
                </div>
                <div className="text-lg font-medium">
                  {getMessage(result)}
                </div>
                <div className="flex justify-center mt-4 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Heart 
                      key={i} 
                      className={`w-6 h-6 ${i < Math.ceil(result / 20) ? 'text-red-500' : 'text-gray-300'}`}
                      fill={i < Math.ceil(result / 20) ? 'currentColor' : 'none'}
                    />
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
