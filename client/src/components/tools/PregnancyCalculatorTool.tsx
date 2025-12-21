import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format, addDays, addWeeks, differenceInDays, differenceInWeeks } from 'date-fns';

export default function PregnancyCalculatorTool() {
  const { t } = useTranslation();
  const tk = (key: string) => t(`Tools.pregnancy-calculator.${key}`);

  const [lmpDate, setLmpDate] = useState('');

  const calculateDueDate = () => {
    if (!lmpDate) return null;

    const lmp = new Date(lmpDate);
    if (isNaN(lmp.getTime())) return null;

    const dueDate = addDays(lmp, 280);
    const today = new Date();
    const pregnancyDays = differenceInDays(today, lmp);
    const currentWeek = Math.floor(pregnancyDays / 7);
    const currentDay = pregnancyDays % 7;
    const daysRemaining = differenceInDays(dueDate, today);
    const trimester = currentWeek < 13 ? 1 : currentWeek < 27 ? 2 : 3;

    const firstTrimesterEnd = addWeeks(lmp, 12);
    const secondTrimesterEnd = addWeeks(lmp, 26);

    return {
      dueDate,
      currentWeek,
      currentDay,
      daysRemaining,
      trimester,
      firstTrimesterEnd,
      secondTrimesterEnd,
      pregnancyDays,
    };
  };

  const result = calculateDueDate();

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label>{tk('lmpDate')}</Label>
            <Input
              type="date"
              value={lmpDate}
              onChange={(e) => setLmpDate(e.target.value)}
              data-testid="input-lmp"
            />
            <p className="text-sm text-muted-foreground">{tk('lmpDesc')}</p>
          </div>
        </CardContent>
      </Card>

      {result && result.pregnancyDays >= 0 && (
        <>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-sm text-muted-foreground">{tk('dueDate')}</div>
              <div className="text-4xl font-bold my-2" data-testid="due-date">
                {format(result.dueDate, 'MMM d, yyyy')}
              </div>
              <div className="text-lg text-muted-foreground">
                {result.daysRemaining > 0 
                  ? `${result.daysRemaining} ${tk('daysRemaining')}`
                  : tk('pastDue')
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm text-muted-foreground">{tk('currentWeek')}</div>
                  <div className="text-2xl font-bold" data-testid="current-week">
                    {result.currentWeek}w {result.currentDay}d
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm text-muted-foreground">{tk('trimester')}</div>
                  <div className="text-2xl font-bold" data-testid="trimester">
                    {result.trimester}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Label className="mb-3 block">{tk('milestones')}</Label>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{tk('firstTrimester')}</span>
                  <span>{format(result.firstTrimesterEnd, 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span>{tk('secondTrimester')}</span>
                  <span>{format(result.secondTrimesterEnd, 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>{tk('dueDate')}</span>
                  <span>{format(result.dueDate, 'MMM d, yyyy')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
