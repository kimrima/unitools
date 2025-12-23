import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Flag } from 'lucide-react';

export default function StopwatchTool() {
  const { t } = useTranslation();
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - elapsedRef.current;
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setTime(elapsed);
        elapsedRef.current = elapsed;
      }, 10);
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  
  const reset = useCallback(() => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
    elapsedRef.current = 0;
  }, []);

  const addLap = useCallback(() => {
    setLaps(prev => [time, ...prev]);
  }, [time]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  const getLapDiff = (index: number) => {
    if (index === laps.length - 1) return laps[index];
    return laps[index] - laps[index + 1];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-6">
            <div 
              className="text-7xl font-mono font-bold tabular-nums"
              data-testid="stopwatch-display"
            >
              {formatTime(time)}
            </div>

            <div className="flex gap-3">
              {!isRunning ? (
                <Button size="lg" onClick={start} data-testid="button-start">
                  <Play className="mr-2 h-5 w-5" />
                  {t('Tools.stopwatch.start', 'Start')}
                </Button>
              ) : (
                <Button size="lg" onClick={pause} data-testid="button-pause">
                  <Pause className="mr-2 h-5 w-5" />
                  {t('Tools.stopwatch.pause', 'Pause')}
                </Button>
              )}
              
              {isRunning && (
                <Button size="lg" variant="outline" onClick={addLap} data-testid="button-lap">
                  <Flag className="mr-2 h-5 w-5" />
                  {t('Tools.stopwatch.lap', 'Lap')}
                </Button>
              )}
              
              <Button size="lg" variant="outline" onClick={reset} data-testid="button-reset">
                <RotateCcw className="mr-2 h-5 w-5" />
                {t('Tools.stopwatch.reset', 'Reset')}
              </Button>
            </div>

            {laps.length > 0 && (
              <div className="w-full max-w-md">
                <div className="text-sm font-medium mb-2">{t('Tools.stopwatch.laps', 'Laps')}</div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {laps.map((lap, i) => (
                    <div 
                      key={i} 
                      className="flex justify-between items-center py-2 px-3 bg-muted rounded-md"
                    >
                      <span className="text-muted-foreground">
                        {t('Tools.stopwatch.lapNumber', 'Lap')} {laps.length - i}
                      </span>
                      <div className="text-right">
                        <div className="font-mono font-medium">{formatTime(lap)}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          +{formatTime(getLapDiff(i))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
