import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dices, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100];

export default function DiceRollerTool() {
  const { t } = useTranslation();
  const [diceType, setDiceType] = useState(6);
  const [diceCount, setDiceCount] = useState(1);
  const [results, setResults] = useState<number[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [history, setHistory] = useState<{ dice: string; total: number }[]>([]);

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);

    setTimeout(() => {
      const rolls: number[] = [];
      for (let i = 0; i < diceCount; i++) {
        rolls.push(Math.floor(Math.random() * diceType) + 1);
      }
      setResults(rolls);
      const total = rolls.reduce((a, b) => a + b, 0);
      setHistory(prev => [...prev.slice(-9), { dice: `${diceCount}d${diceType}`, total }]);
      setIsRolling(false);
    }, 800);
  };

  const total = results.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <Label>{t('Tools.dice-roller.diceType') || 'Dice Type'}</Label>
            <Select value={String(diceType)} onValueChange={(v) => setDiceType(Number(v))}>
              <SelectTrigger data-testid="select-dice-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DICE_TYPES.map(d => (
                  <SelectItem key={d} value={String(d)}>d{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('Tools.dice-roller.diceCount') || 'Number of Dice'}</Label>
            <Select value={String(diceCount)} onValueChange={(v) => setDiceCount(Number(v))}>
              <SelectTrigger data-testid="select-dice-count">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-center mb-6">
          <Button size="lg" onClick={rollDice} disabled={isRolling} data-testid="button-roll">
            <Dices className={cn('w-5 h-5 mr-2', isRolling && 'animate-spin')} />
            {isRolling ? (t('Common.loading') || 'Rolling...') : (t('Tools.dice-roller.rollButton') || 'Roll Dice')}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="text-center">
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              {results.map((r, i) => (
                <div
                  key={i}
                  className="w-14 h-14 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold shadow-md"
                >
                  {r}
                </div>
              ))}
            </div>
            {results.length > 1 && (
              <p className="text-lg">
                <span className="text-muted-foreground">{t('Tools.dice-roller.total') || 'Total'}:</span>{' '}
                <span className="font-bold text-2xl">{total}</span>
              </p>
            )}
          </div>
        )}
      </Card>

      {history.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">{t('Tools.dice-roller.history') || 'Roll History'}</h3>
            <Button variant="ghost" size="sm" onClick={() => setHistory([])} data-testid="button-clear-history">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {history.map((h, i) => (
              <div key={i} className="px-3 py-1 bg-muted rounded-full text-sm">
                {h.dice}: <span className="font-medium">{h.total}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
