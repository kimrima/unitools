import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CompoundInterestTool() {
  const { t } = useTranslation();
  const tk = (key: string) => t(`Tools.compound-interest.${key}`);

  const [principal, setPrincipal] = useState('10000');
  const [rate, setRate] = useState('5');
  const [years, setYears] = useState('10');
  const [frequency, setFrequency] = useState('12');
  const [monthlyContrib, setMonthlyContrib] = useState('100');

  const p = parseFloat(principal) || 0;
  const r = (parseFloat(rate) || 0) / 100;
  const t_val = parseFloat(years) || 0;
  const n = parseInt(frequency) || 12;
  const pmt = parseFloat(monthlyContrib) || 0;

  const compoundAmount = p * Math.pow(1 + r / n, n * t_val);
  const contributionFV = pmt * ((Math.pow(1 + r / n, n * t_val) - 1) / (r / n));
  const totalAmount = compoundAmount + (r > 0 ? contributionFV : pmt * 12 * t_val);
  const totalContributions = p + pmt * 12 * t_val;
  const totalInterest = totalAmount - totalContributions;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{tk('principal')}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  className="pl-8"
                  data-testid="input-principal"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{tk('rate')}</Label>
              <div className="relative">
                <Input
                  type="number"
                  inputMode="decimal"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="pr-8"
                  data-testid="input-rate"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{tk('years')}</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                data-testid="input-years"
              />
            </div>
            <div className="space-y-2">
              <Label>{tk('frequency')}</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger data-testid="select-frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{tk('annually')}</SelectItem>
                  <SelectItem value="2">{tk('semiAnnually')}</SelectItem>
                  <SelectItem value="4">{tk('quarterly')}</SelectItem>
                  <SelectItem value="12">{tk('monthly')}</SelectItem>
                  <SelectItem value="365">{tk('daily')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{tk('monthlyContribution')}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={monthlyContrib}
                  onChange={(e) => setMonthlyContrib(e.target.value)}
                  className="pl-8"
                  data-testid="input-contribution"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-sm text-muted-foreground">{tk('futureValue')}</span>
              <div className="text-4xl font-bold" data-testid="future-value">
                {formatCurrency(totalAmount)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <span className="text-sm text-muted-foreground">{tk('totalContributions')}</span>
                <div className="text-xl font-semibold" data-testid="total-contributions">
                  {formatCurrency(totalContributions)}
                </div>
              </div>
              <div className="text-center">
                <span className="text-sm text-muted-foreground">{tk('totalInterest')}</span>
                <div className="text-xl font-semibold text-green-600 dark:text-green-400" data-testid="total-interest">
                  {formatCurrency(totalInterest)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
