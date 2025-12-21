import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears, format } from 'date-fns';

export default function DaysCounterTool() {
  const { t } = useTranslation();
  const tk = (key: string) => t(`Tools.days-counter.${key}`);

  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState('');

  const calculateDiff = () => {
    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

    const days = differenceInDays(end, start);
    const weeks = differenceInWeeks(end, start);
    const months = differenceInMonths(end, start);
    const years = differenceInYears(end, start);
    const isPast = days < 0;

    return {
      days: Math.abs(days),
      weeks: Math.abs(weeks),
      months: Math.abs(months),
      years: Math.abs(years),
      isPast,
    };
  };

  const diff = calculateDiff();

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
              data-testid="input-start"
            />
          </div>
          <div className="space-y-2">
            <Label>{tk('endDate')}</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              data-testid="input-end"
            />
          </div>
        </CardContent>
      </Card>

      {diff && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center mb-4">
              <div className="text-sm text-muted-foreground">
                {diff.isPast ? tk('daysAgo') : tk('daysUntil')}
              </div>
              <div className="text-5xl font-bold my-2" data-testid="days-result">
                {diff.days}
              </div>
              <div className="text-lg text-muted-foreground">{tk('days')}</div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center pt-4 border-t">
              <div className="p-2">
                <div className="text-xl font-bold" data-testid="weeks-result">{diff.weeks}</div>
                <div className="text-sm text-muted-foreground">{tk('weeks')}</div>
              </div>
              <div className="p-2">
                <div className="text-xl font-bold" data-testid="months-result">{diff.months}</div>
                <div className="text-sm text-muted-foreground">{tk('months')}</div>
              </div>
              <div className="p-2">
                <div className="text-xl font-bold" data-testid="years-result">{diff.years}</div>
                <div className="text-sm text-muted-foreground">{tk('years')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
