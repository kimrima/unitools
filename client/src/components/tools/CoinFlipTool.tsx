import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCw } from 'lucide-react';

export default function CoinFlipTool() {
  const { t } = useTranslation();
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [history, setHistory] = useState<Array<'heads' | 'tails'>>([]);

  const flipCoin = useCallback(() => {
    setIsFlipping(true);
    setResult(null);
    
    setTimeout(() => {
      const newResult: 'heads' | 'tails' = Math.random() < 0.5 ? 'heads' : 'tails';
      setResult(newResult);
      setHistory(prev => [newResult, ...prev].slice(0, 20) as Array<'heads' | 'tails'>);
      setIsFlipping(false);
    }, 800);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setResult(null);
  }, []);

  const headsCount = history.filter(r => r === 'heads').length;
  const tailsCount = history.filter(r => r === 'tails').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-6">
            <div 
              className={`w-40 h-40 rounded-full flex items-center justify-center text-4xl font-bold transition-all duration-300 ${
                isFlipping ? 'animate-spin' : ''
              } ${
                result === 'heads' 
                  ? 'bg-amber-500 text-white' 
                  : result === 'tails' 
                    ? 'bg-slate-600 text-white' 
                    : 'bg-muted text-muted-foreground'
              }`}
              data-testid="coin-display"
            >
              {isFlipping ? '?' : result ? (result === 'heads' ? t('Tools.coin-flip.heads', 'Heads') : t('Tools.coin-flip.tails', 'Tails')) : '?'}
            </div>

            <Button 
              size="lg" 
              onClick={flipCoin} 
              disabled={isFlipping}
              data-testid="button-flip-coin"
            >
              <RotateCw className={`mr-2 h-5 w-5 ${isFlipping ? 'animate-spin' : ''}`} />
              {t('Tools.coin-flip.flip', 'Flip Coin')}
            </Button>

            {history.length > 0 && (
              <div className="w-full space-y-4">
                <div className="flex justify-center gap-8 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-500">{headsCount}</div>
                    <div className="text-muted-foreground">{t('Tools.coin-flip.heads', 'Heads')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-500">{tailsCount}</div>
                    <div className="text-muted-foreground">{t('Tools.coin-flip.tails', 'Tails')}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  {history.map((r, i) => (
                    <div 
                      key={i}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        r === 'heads' ? 'bg-amber-500 text-white' : 'bg-slate-600 text-white'
                      }`}
                    >
                      {r === 'heads' ? 'H' : 'T'}
                    </div>
                  ))}
                </div>

                <div className="flex justify-center">
                  <Button variant="outline" size="sm" onClick={clearHistory} data-testid="button-clear-history">
                    {t('Common.actions.clear', 'Clear')}
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
