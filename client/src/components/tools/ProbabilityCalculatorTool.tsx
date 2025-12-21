import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProbabilityCalculatorTool() {
  const { t } = useTranslation();
  const tk = (key: string) => t(`Tools.probability-calculator.${key}`);

  const [mode, setMode] = useState<'single' | 'multiple' | 'odds'>('single');

  const [favorable, setFavorable] = useState('1');
  const [total, setTotal] = useState('6');

  const [probA, setProbA] = useState('0.5');
  const [probB, setProbB] = useState('0.3');

  const [oddsFor, setOddsFor] = useState('3');
  const [oddsAgainst, setOddsAgainst] = useState('1');

  const calculateSingle = () => {
    const fav = parseFloat(favorable) || 0;
    const tot = parseFloat(total) || 1;
    if (tot === 0) return { probability: 0, percentage: 0, odds: '0:0' };

    const probability = fav / tot;
    const percentage = probability * 100;
    const oddsAgainst = tot - fav;
    return {
      probability: probability.toFixed(4),
      percentage: percentage.toFixed(2),
      odds: `${fav}:${oddsAgainst}`,
    };
  };

  const calculateMultiple = () => {
    const pA = parseFloat(probA) || 0;
    const pB = parseFloat(probB) || 0;

    return {
      both: (pA * pB).toFixed(4),
      either: (pA + pB - pA * pB).toFixed(4),
      notA: (1 - pA).toFixed(4),
      notB: (1 - pB).toFixed(4),
      neither: ((1 - pA) * (1 - pB)).toFixed(4),
    };
  };

  const calculateOdds = () => {
    const forNum = parseFloat(oddsFor) || 0;
    const againstNum = parseFloat(oddsAgainst) || 1;
    const total = forNum + againstNum;

    return {
      probability: (forNum / total).toFixed(4),
      percentage: ((forNum / total) * 100).toFixed(2),
      impliedProb: ((forNum / total) * 100).toFixed(2),
    };
  };

  const singleResult = calculateSingle();
  const multipleResult = calculateMultiple();
  const oddsResult = calculateOdds();

  return (
    <div className="space-y-6">
      <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="single" data-testid="tab-single">{tk('single')}</TabsTrigger>
          <TabsTrigger value="multiple" data-testid="tab-multiple">{tk('multiple')}</TabsTrigger>
          <TabsTrigger value="odds" data-testid="tab-odds">{tk('odds')}</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="mt-4 space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{tk('favorable')}</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={favorable}
                    onChange={(e) => setFavorable(e.target.value)}
                    data-testid="input-favorable"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{tk('total')}</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={total}
                    onChange={(e) => setTotal(e.target.value)}
                    data-testid="input-total"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm text-muted-foreground">{tk('probability')}</div>
                  <div className="text-xl font-bold" data-testid="prob-result">{singleResult.probability}</div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm text-muted-foreground">{tk('percentage')}</div>
                  <div className="text-xl font-bold" data-testid="pct-result">{singleResult.percentage}%</div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm text-muted-foreground">{tk('oddsRatio')}</div>
                  <div className="text-xl font-bold" data-testid="odds-result">{singleResult.odds}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="multiple" className="mt-4 space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{tk('probA')}</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={probA}
                    onChange={(e) => setProbA(e.target.value)}
                    step="0.01"
                    min="0"
                    max="1"
                    data-testid="input-prob-a"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{tk('probB')}</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={probB}
                    onChange={(e) => setProbB(e.target.value)}
                    step="0.01"
                    min="0"
                    max="1"
                    data-testid="input-prob-b"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="flex justify-between">
                <span>{tk('aAndB')}</span>
                <span className="font-mono font-bold" data-testid="both">{multipleResult.both}</span>
              </div>
              <div className="flex justify-between">
                <span>{tk('aOrB')}</span>
                <span className="font-mono font-bold" data-testid="either">{multipleResult.either}</span>
              </div>
              <div className="flex justify-between">
                <span>{tk('notA')}</span>
                <span className="font-mono font-bold" data-testid="not-a">{multipleResult.notA}</span>
              </div>
              <div className="flex justify-between">
                <span>{tk('neither')}</span>
                <span className="font-mono font-bold" data-testid="neither">{multipleResult.neither}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="odds" className="mt-4 space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 space-y-2">
                  <Label>{tk('oddsFor')}</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={oddsFor}
                    onChange={(e) => setOddsFor(e.target.value)}
                    data-testid="input-odds-for"
                  />
                </div>
                <span className="text-2xl font-bold mt-6">:</span>
                <div className="flex-1 space-y-2">
                  <Label>{tk('oddsAgainst')}</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={oddsAgainst}
                    onChange={(e) => setOddsAgainst(e.target.value)}
                    data-testid="input-odds-against"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-sm text-muted-foreground">{tk('impliedProbability')}</div>
              <div className="text-4xl font-bold my-2" data-testid="implied-prob">
                {oddsResult.percentage}%
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
