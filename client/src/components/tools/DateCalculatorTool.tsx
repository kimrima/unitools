import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, addDays, addWeeks, addMonths, addYears, subDays, subWeeks, subMonths, subYears } from 'date-fns';

export default function DateCalculatorTool() {
  const { t } = useTranslation();
  const tk = (key: string) => t(`Tools.date-calculator.${key}`);

  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [amount, setAmount] = useState('30');
  const [unit, setUnit] = useState<'days' | 'weeks' | 'months' | 'years'>('days');
  const [direction, setDirection] = useState<'add' | 'subtract'>('add');

  const calculateResult = () => {
    if (!startDate || !amount) return null;

    const date = new Date(startDate);
    const num = parseInt(amount);

    if (isNaN(date.getTime()) || isNaN(num)) return null;

    const addFns = { days: addDays, weeks: addWeeks, months: addMonths, years: addYears };
    const subFns = { days: subDays, weeks: subWeeks, months: subMonths, years: subYears };

    const fn = direction === 'add' ? addFns[unit] : subFns[unit];
    return fn(date, num);
  };

  const result = calculateResult();

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label>{tk('startDate')}</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              data-testid="input-date"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>{tk('direction')}</Label>
              <Select value={direction} onValueChange={(v) => setDirection(v as 'add' | 'subtract')}>
                <SelectTrigger data-testid="select-direction">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">{tk('add')}</SelectItem>
                  <SelectItem value="subtract">{tk('subtract')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{tk('amount')}</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                data-testid="input-amount"
              />
            </div>
            <div className="space-y-2">
              <Label>{tk('unit')}</Label>
              <Select value={unit} onValueChange={(v) => setUnit(v as typeof unit)}>
                <SelectTrigger data-testid="select-unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">{tk('days')}</SelectItem>
                  <SelectItem value="weeks">{tk('weeks')}</SelectItem>
                  <SelectItem value="months">{tk('months')}</SelectItem>
                  <SelectItem value="years">{tk('years')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-sm text-muted-foreground">{tk('resultDate')}</div>
            <div className="text-4xl font-bold my-2" data-testid="result-date">
              {format(result, 'MMMM d, yyyy')}
            </div>
            <div className="text-lg text-muted-foreground">
              {format(result, 'EEEE')}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
