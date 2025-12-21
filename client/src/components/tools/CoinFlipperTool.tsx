import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function CoinFlipperTool() {
  const { t } = useTranslation();
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [stats, setStats] = useState({ heads: 0, tails: 0 });

  const flipCoin = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setResult(null);

    setTimeout(() => {
      const outcome = Math.random() < 0.5 ? 'heads' : 'tails';
      setResult(outcome);
      setStats(prev => ({
        ...prev,
        [outcome]: prev[outcome] + 1
      }));
      setIsFlipping(false);
    }, 1500);
  };

  const resetStats = () => {
    setStats({ heads: 0, tails: 0 });
    setResult(null);
  };

  const total = stats.heads + stats.tails;

  return (
    <div className="space-y-6">
      <Card className="p-8 text-center">
        <div className="mb-8">
          <div
            className={cn(
              'w-40 h-40 mx-auto rounded-full border-4 flex items-center justify-center text-4xl font-bold transition-all duration-300',
              isFlipping && 'animate-spin',
              result === 'heads' ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500 text-yellow-700 dark:text-yellow-300' : '',
              result === 'tails' ? 'bg-slate-100 dark:bg-slate-800 border-slate-500 text-slate-700 dark:text-slate-300' : '',
              !result && !isFlipping && 'bg-muted border-muted-foreground/30'
            )}
          >
            {isFlipping ? '?' : result ? (result === 'heads' ? 'H' : 'T') : '?'}
          </div>
        </div>

        {result && !isFlipping && (
          <p className="text-2xl font-semibold mb-4 capitalize">
            {result === 'heads' ? t('Tools.coin-flipper.heads') || 'Heads' : t('Tools.coin-flipper.tails') || 'Tails'}!
          </p>
        )}

        <Button 
          size="lg" 
          onClick={flipCoin} 
          disabled={isFlipping}
          data-testid="button-flip"
        >
          {isFlipping ? (t('Common.loading') || 'Flipping...') : (t('Tools.coin-flipper.flipButton') || 'Flip Coin')}
        </Button>
      </Card>

      {total > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4 text-center">{t('Tools.coin-flipper.statistics') || 'Statistics'}</h3>
          <div className="grid grid-cols-2 gap-4 text-center mb-4">
            <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">{stats.heads}</p>
              <p className="text-sm text-muted-foreground">{t('Tools.coin-flipper.heads') || 'Heads'} ({total > 0 ? Math.round(stats.heads / total * 100) : 0}%)</p>
            </div>
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <p className="text-3xl font-bold text-slate-700 dark:text-slate-300">{stats.tails}</p>
              <p className="text-sm text-muted-foreground">{t('Tools.coin-flipper.tails') || 'Tails'} ({total > 0 ? Math.round(stats.tails / total * 100) : 0}%)</p>
            </div>
          </div>
          <div className="text-center">
            <Button variant="outline" size="sm" onClick={resetStats} data-testid="button-reset">
              {t('Common.buttons.reset') || 'Reset'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
