import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, addMinutes, parse } from 'date-fns';

export default function SleepCalculatorTool() {
  const { t } = useTranslation();
  const tk = (key: string) => t(`Tools.sleep-calculator.${key}`);

  const [mode, setMode] = useState<'wakeUp' | 'goToBed'>('wakeUp');
  const [time, setTime] = useState('07:00');
  const [fallAsleepTime] = useState(15);

  const CYCLE_LENGTH = 90;
  const cycles = [6, 5, 4, 3];

  const calculateTimes = () => {
    const baseTime = parse(time, 'HH:mm', new Date());
    const results: { time: string; cycles: number; hours: number }[] = [];

    if (mode === 'wakeUp') {
      cycles.forEach((cycleCount) => {
        const sleepDuration = cycleCount * CYCLE_LENGTH + fallAsleepTime;
        const bedTime = addMinutes(baseTime, -sleepDuration);
        results.push({
          time: format(bedTime, 'HH:mm'),
          cycles: cycleCount,
          hours: (cycleCount * CYCLE_LENGTH) / 60,
        });
      });
    } else {
      const bedTimeWithFallAsleep = addMinutes(baseTime, fallAsleepTime);
      cycles.forEach((cycleCount) => {
        const wakeTime = addMinutes(bedTimeWithFallAsleep, cycleCount * CYCLE_LENGTH);
        results.push({
          time: format(wakeTime, 'HH:mm'),
          cycles: cycleCount,
          hours: (cycleCount * CYCLE_LENGTH) / 60,
        });
      });
    }

    return results;
  };

  const results = calculateTimes();

  return (
    <div className="space-y-6">
      <Tabs value={mode} onValueChange={(v) => setMode(v as 'wakeUp' | 'goToBed')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wakeUp" data-testid="tab-wakeup">{tk('wakeUp')}</TabsTrigger>
          <TabsTrigger value="goToBed" data-testid="tab-sleep">{tk('goToBed')}</TabsTrigger>
        </TabsList>

        <TabsContent value="wakeUp" className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>{tk('wakeUpTime')}</Label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  data-testid="input-time"
                />
              </div>
              <p className="text-sm text-muted-foreground">{tk('wakeUpDesc')}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goToBed" className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>{tk('bedTime')}</Label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  data-testid="input-time"
                />
              </div>
              <p className="text-sm text-muted-foreground">{tk('bedTimeDesc')}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent className="pt-6">
          <Label className="mb-4 block">
            {mode === 'wakeUp' ? tk('goToBedAt') : tk('wakeUpAt')}
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {results.map((result, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-md text-center ${
                  idx === 0 ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500' : 'bg-muted'
                }`}
                data-testid={`result-${idx}`}
              >
                <div className="text-2xl font-bold">{result.time}</div>
                <div className="text-sm text-muted-foreground">
                  {result.cycles} {tk('cycles')} ({result.hours}h)
                </div>
                {idx === 0 && (
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                    {tk('recommended')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-1">
            <p>{tk('cycleInfo')}</p>
            <p>{t('Tools.sleep-calculator.fallAsleepInfo', { minutes: fallAsleepTime })}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
