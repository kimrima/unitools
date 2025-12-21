import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export default function TipCalculatorTool() {
  const { t } = useTranslation();
  const tk = (key: string) => t(`Tools.tip-calculator.${key}`);

  const [billAmount, setBillAmount] = useState('');
  const [tipPercent, setTipPercent] = useState(18);
  const [numPeople, setNumPeople] = useState(1);

  const bill = parseFloat(billAmount) || 0;
  const tipAmount = (bill * tipPercent) / 100;
  const total = bill + tipAmount;
  const perPerson = numPeople > 0 ? total / numPeople : 0;
  const tipPerPerson = numPeople > 0 ? tipAmount / numPeople : 0;

  const presetTips = [10, 15, 18, 20, 25];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <Label>{tk('billAmount')}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                type="number"
                inputMode="decimal"
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value)}
                className="pl-8"
                placeholder="0.00"
                data-testid="input-bill"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{tk('tipPercent')}</Label>
              <span className="text-lg font-semibold">{tipPercent}%</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {presetTips.map((tip) => (
                <Button
                  key={tip}
                  variant={tipPercent === tip ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTipPercent(tip)}
                  data-testid={`btn-tip-${tip}`}
                >
                  {tip}%
                </Button>
              ))}
            </div>
            <Slider
              value={[tipPercent]}
              onValueChange={([v]) => setTipPercent(v)}
              min={0}
              max={50}
              step={1}
              data-testid="slider-tip"
            />
          </div>

          <div className="space-y-2">
            <Label>{tk('numPeople')}</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setNumPeople(Math.max(1, numPeople - 1))}
                disabled={numPeople <= 1}
                data-testid="btn-decrease-people"
              >
                -
              </Button>
              <span className="text-xl font-semibold w-12 text-center">{numPeople}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setNumPeople(numPeople + 1)}
                data-testid="btn-increase-people"
              >
                +
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">{tk('tipAmount')}</span>
              <div className="text-2xl font-bold" data-testid="tip-amount">
                ${tipAmount.toFixed(2)}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">{tk('total')}</span>
              <div className="text-2xl font-bold" data-testid="total">
                ${total.toFixed(2)}
              </div>
            </div>
            {numPeople > 1 && (
              <>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">{tk('tipPerPerson')}</span>
                  <div className="text-xl font-semibold" data-testid="tip-per-person">
                    ${tipPerPerson.toFixed(2)}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">{tk('perPerson')}</span>
                  <div className="text-xl font-semibold" data-testid="per-person">
                    ${perPerson.toFixed(2)}
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
