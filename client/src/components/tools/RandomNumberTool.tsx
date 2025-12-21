import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Shuffle, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RandomNumberTool() {
  const { t } = useTranslation();
  const tk = (key: string) => t(`Tools.random-number.${key}`);
  const { toast } = useToast();

  const [min, setMin] = useState('1');
  const [max, setMax] = useState('100');
  const [count, setCount] = useState('1');
  const [allowDuplicates, setAllowDuplicates] = useState(true);
  const [results, setResults] = useState<number[]>([]);

  const generate = () => {
    const minNum = parseInt(min) || 0;
    const maxNum = parseInt(max) || 100;
    const countNum = Math.min(parseInt(count) || 1, 100);

    if (minNum > maxNum) {
      toast({ title: tk('invalidRange'), variant: 'destructive' });
      return;
    }

    if (!allowDuplicates && countNum > maxNum - minNum + 1) {
      toast({ title: tk('tooManyUnique'), variant: 'destructive' });
      return;
    }

    const nums: number[] = [];
    const usedNums = new Set<number>();

    for (let i = 0; i < countNum; i++) {
      let num: number;
      do {
        num = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
      } while (!allowDuplicates && usedNums.has(num));

      nums.push(num);
      usedNums.add(num);
    }

    setResults(nums);
  };

  const copyResults = async () => {
    await navigator.clipboard.writeText(results.join(', '));
    toast({ title: t('Common.actions.copy') + '!' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{tk('min')}</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={min}
                onChange={(e) => setMin(e.target.value)}
                data-testid="input-min"
              />
            </div>
            <div className="space-y-2">
              <Label>{tk('max')}</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={max}
                onChange={(e) => setMax(e.target.value)}
                data-testid="input-max"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{tk('count')}</Label>
            <Input
              type="number"
              inputMode="numeric"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              min="1"
              max="100"
              data-testid="input-count"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="duplicates"
              checked={allowDuplicates}
              onChange={(e) => setAllowDuplicates(e.target.checked)}
              className="rounded"
              data-testid="checkbox-duplicates"
            />
            <Label htmlFor="duplicates" className="cursor-pointer">
              {tk('allowDuplicates')}
            </Label>
          </div>

          <Button onClick={generate} className="w-full" data-testid="btn-generate">
            <Shuffle className="w-4 h-4 mr-2" />
            {tk('generate')}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <Label>{tk('results')}</Label>
              <Button variant="ghost" size="sm" onClick={copyResults} data-testid="btn-copy">
                <Copy className="w-4 h-4 mr-1" />
                {t('Common.actions.copy')}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {results.map((num, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 bg-muted rounded-md text-lg font-mono font-bold"
                  data-testid={`result-${idx}`}
                >
                  {num}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
