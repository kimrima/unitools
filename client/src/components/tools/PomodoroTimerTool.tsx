import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

const DURATIONS: Record<TimerMode, number> = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export default function PomodoroTimerTool() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(DURATIONS.work);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setIsRunning(false);
          if (mode === 'work') {
            setCompletedPomodoros(p => p + 1);
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(DURATIONS[newMode]);
    setIsRunning(false);
  };

  const reset = () => {
    setTimeLeft(DURATIONS[mode]);
    setIsRunning(false);
  };

  const progress = ((DURATIONS[mode] - timeLeft) / DURATIONS[mode]) * 100;

  const getModeLabel = (m: TimerMode) => {
    switch (m) {
      case 'work': return t('Tools.pomodoro-timer.work', 'Focus');
      case 'shortBreak': return t('Tools.pomodoro-timer.shortBreak', 'Short Break');
      case 'longBreak': return t('Tools.pomodoro-timer.longBreak', 'Long Break');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex gap-2 flex-wrap justify-center">
              <Button 
                variant={mode === 'work' ? 'default' : 'outline'} 
                onClick={() => switchMode('work')}
                data-testid="button-work"
              >
                <Brain className="mr-2 h-4 w-4" />
                {getModeLabel('work')}
              </Button>
              <Button 
                variant={mode === 'shortBreak' ? 'default' : 'outline'} 
                onClick={() => switchMode('shortBreak')}
                data-testid="button-short-break"
              >
                <Coffee className="mr-2 h-4 w-4" />
                {getModeLabel('shortBreak')}
              </Button>
              <Button 
                variant={mode === 'longBreak' ? 'default' : 'outline'} 
                onClick={() => switchMode('longBreak')}
                data-testid="button-long-break"
              >
                <Coffee className="mr-2 h-4 w-4" />
                {getModeLabel('longBreak')}
              </Button>
            </div>

            <div className="relative w-64 h-64">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 120}
                  strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                  strokeLinecap="round"
                  className={mode === 'work' ? 'text-red-500' : 'text-green-500'}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl font-mono font-bold" data-testid="timer-display">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {getModeLabel(mode)}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button size="lg" onClick={() => setIsRunning(!isRunning)} data-testid="button-toggle">
                {isRunning ? (
                  <><Pause className="mr-2 h-5 w-5" />{t('Tools.pomodoro-timer.pause', 'Pause')}</>
                ) : (
                  <><Play className="mr-2 h-5 w-5" />{t('Tools.pomodoro-timer.start', 'Start')}</>
                )}
              </Button>
              <Button size="lg" variant="outline" onClick={reset} data-testid="button-reset">
                <RotateCcw className="h-5 w-5" />
              </Button>
            </div>

            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">
                {t('Tools.pomodoro-timer.completed', 'Completed Pomodoros')}
              </div>
              <div className="text-3xl font-bold" data-testid="pomodoro-count">
                {completedPomodoros}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
