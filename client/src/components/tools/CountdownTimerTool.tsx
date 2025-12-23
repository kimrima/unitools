import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function CountdownTimerTool() {
  const { t } = useTranslation();
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  const playAlarm = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new AudioContext();
      }
      const ctx = audioRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      setTimeout(() => oscillator.stop(), 500);
    } catch (e) {
      console.log('Audio not supported');
    }
  }, []);

  useEffect(() => {
    if (isRunning && totalSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setTotalSeconds(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsComplete(true);
            playAlarm();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, totalSeconds, playAlarm]);

  const startTimer = useCallback(() => {
    if (totalSeconds === 0) {
      const total = hours * 3600 + minutes * 60 + seconds;
      if (total > 0) {
        setTotalSeconds(total);
        setIsComplete(false);
        setIsRunning(true);
      }
    } else {
      setIsRunning(true);
    }
  }, [hours, minutes, seconds, totalSeconds]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTotalSeconds(0);
    setIsComplete(false);
  }, []);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = totalSeconds > 0 ? (1 - totalSeconds / (hours * 3600 + minutes * 60 + seconds || totalSeconds)) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-6">
            {!isRunning && totalSeconds === 0 && (
              <div className="flex gap-4">
                <div className="space-y-2">
                  <Label>{t('Tools.countdown-timer.hours', 'Hours')}</Label>
                  <Input
                    type="number"
                    min={0}
                    max={23}
                    value={hours}
                    onChange={(e) => setHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                    className="w-20 text-center"
                    data-testid="input-hours"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('Tools.countdown-timer.minutes', 'Minutes')}</Label>
                  <Input
                    type="number"
                    min={0}
                    max={59}
                    value={minutes}
                    onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    className="w-20 text-center"
                    data-testid="input-minutes"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('Tools.countdown-timer.seconds', 'Seconds')}</Label>
                  <Input
                    type="number"
                    min={0}
                    max={59}
                    value={seconds}
                    onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    className="w-20 text-center"
                    data-testid="input-seconds"
                  />
                </div>
              </div>
            )}

            <div 
              className={`text-7xl font-mono font-bold tabular-nums ${isComplete ? 'text-green-500 animate-pulse' : ''}`}
              data-testid="timer-display"
            >
              {formatTime(totalSeconds)}
            </div>

            {totalSeconds > 0 && (
              <div className="w-full max-w-md h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            <div className="flex gap-3">
              {!isRunning ? (
                <Button size="lg" onClick={startTimer} data-testid="button-start">
                  <Play className="mr-2 h-5 w-5" />
                  {t('Tools.countdown-timer.start', 'Start')}
                </Button>
              ) : (
                <Button size="lg" onClick={pauseTimer} data-testid="button-pause">
                  <Pause className="mr-2 h-5 w-5" />
                  {t('Tools.countdown-timer.pause', 'Pause')}
                </Button>
              )}
              <Button size="lg" variant="outline" onClick={resetTimer} data-testid="button-reset">
                <RotateCcw className="mr-2 h-5 w-5" />
                {t('Tools.countdown-timer.reset', 'Reset')}
              </Button>
            </div>

            {isComplete && (
              <div className="text-center text-green-500 font-medium">
                {t('Tools.countdown-timer.complete', 'Time is up!')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
