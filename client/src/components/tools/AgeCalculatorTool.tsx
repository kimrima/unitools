import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { differenceInYears, differenceInMonths, differenceInDays, differenceInWeeks, format } from 'date-fns';

export default function AgeCalculatorTool() {
  const { t } = useTranslation();
  const tk = (key: string) => t(`Tools.age-calculator.${key}`);

  const [birthDate, setBirthDate] = useState('');
  const [targetDate, setTargetDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const calculateAge = () => {
    if (!birthDate || !targetDate) return null;

    const birth = new Date(birthDate);
    const target = new Date(targetDate);

    if (isNaN(birth.getTime()) || isNaN(target.getTime())) return null;
    if (birth > target) return null;

    const years = differenceInYears(target, birth);
    const monthsTotal = differenceInMonths(target, birth);
    const months = monthsTotal % 12;
    
    const afterYearsAndMonths = new Date(birth);
    afterYearsAndMonths.setFullYear(afterYearsAndMonths.getFullYear() + years);
    afterYearsAndMonths.setMonth(afterYearsAndMonths.getMonth() + months);
    const days = differenceInDays(target, afterYearsAndMonths);

    const totalDays = differenceInDays(target, birth);
    const totalWeeks = differenceInWeeks(target, birth);
    const totalMonths = monthsTotal;

    return {
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalMonths,
    };
  };

  const age = calculateAge();

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label>{tk('birthDate')}</Label>
            <Input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              data-testid="input-birth"
            />
          </div>
          <div className="space-y-2">
            <Label>{tk('targetDate')}</Label>
            <Input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              data-testid="input-target"
            />
          </div>
        </CardContent>
      </Card>

      {age && (
        <>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-sm text-muted-foreground">{tk('yourAge')}</div>
              <div className="text-4xl font-bold my-2" data-testid="age-result">
                {age.years} {tk('years')}, {age.months} {tk('months')}, {age.days} {tk('days')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-2xl font-bold" data-testid="total-days">{age.totalDays.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">{tk('totalDays')}</div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-2xl font-bold" data-testid="total-weeks">{age.totalWeeks.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">{tk('totalWeeks')}</div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-2xl font-bold" data-testid="total-months">{age.totalMonths.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">{tk('totalMonths')}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
