import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SalaryConverterTool() {
  const { t } = useTranslation();
  const tk = (key: string) => t(`Tools.salary-converter.${key}`);

  const [amount, setAmount] = useState('50000');
  const [inputType, setInputType] = useState<'yearly' | 'monthly' | 'weekly' | 'hourly'>('yearly');
  const [hoursPerWeek, setHoursPerWeek] = useState('40');
  const [weeksPerYear, setWeeksPerYear] = useState('52');

  const value = parseFloat(amount) || 0;
  const hours = parseFloat(hoursPerWeek) || 40;
  const weeks = parseFloat(weeksPerYear) || 52;

  const calculateAll = () => {
    let yearly = 0;
    switch (inputType) {
      case 'yearly':
        yearly = value;
        break;
      case 'monthly':
        yearly = value * 12;
        break;
      case 'weekly':
        yearly = value * weeks;
        break;
      case 'hourly':
        yearly = value * hours * weeks;
        break;
    }

    return {
      yearly,
      monthly: yearly / 12,
      biweekly: yearly / 26,
      weekly: yearly / weeks,
      daily: yearly / (weeks * 5),
      hourly: yearly / (hours * weeks),
    };
  };

  const results = calculateAll();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{tk('amount')}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8"
                  data-testid="input-amount"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{tk('payPeriod')}</Label>
              <Select value={inputType} onValueChange={(v) => setInputType(v as typeof inputType)}>
                <SelectTrigger data-testid="select-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yearly">{tk('yearly')}</SelectItem>
                  <SelectItem value="monthly">{tk('monthly')}</SelectItem>
                  <SelectItem value="weekly">{tk('weekly')}</SelectItem>
                  <SelectItem value="hourly">{tk('hourly')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{tk('hoursPerWeek')}</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(e.target.value)}
                data-testid="input-hours"
              />
            </div>
            <div className="space-y-2">
              <Label>{tk('weeksPerYear')}</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={weeksPerYear}
                onChange={(e) => setWeeksPerYear(e.target.value)}
                data-testid="input-weeks"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="space-y-1 text-center p-3 bg-muted rounded-md">
              <span className="text-sm text-muted-foreground">{tk('yearly')}</span>
              <div className="text-lg font-bold" data-testid="result-yearly">
                {formatCurrency(results.yearly)}
              </div>
            </div>
            <div className="space-y-1 text-center p-3 bg-muted rounded-md">
              <span className="text-sm text-muted-foreground">{tk('monthly')}</span>
              <div className="text-lg font-bold" data-testid="result-monthly">
                {formatCurrency(results.monthly)}
              </div>
            </div>
            <div className="space-y-1 text-center p-3 bg-muted rounded-md">
              <span className="text-sm text-muted-foreground">{tk('biweekly')}</span>
              <div className="text-lg font-bold" data-testid="result-biweekly">
                {formatCurrency(results.biweekly)}
              </div>
            </div>
            <div className="space-y-1 text-center p-3 bg-muted rounded-md">
              <span className="text-sm text-muted-foreground">{tk('weekly')}</span>
              <div className="text-lg font-bold" data-testid="result-weekly">
                {formatCurrency(results.weekly)}
              </div>
            </div>
            <div className="space-y-1 text-center p-3 bg-muted rounded-md">
              <span className="text-sm text-muted-foreground">{tk('daily')}</span>
              <div className="text-lg font-bold" data-testid="result-daily">
                {formatCurrency(results.daily)}
              </div>
            </div>
            <div className="space-y-1 text-center p-3 bg-muted rounded-md">
              <span className="text-sm text-muted-foreground">{tk('hourly')}</span>
              <div className="text-lg font-bold" data-testid="result-hourly">
                {formatCurrency(results.hourly)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
