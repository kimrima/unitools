import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FullscreenWrapper } from './FullscreenWrapper';
import { 
  Timer, RotateCcw, Trophy, Target, Play, Square, Zap
} from 'lucide-react';

interface ChallengeResult {
  target: number;
  actual: number;
  difference: number;
  timestamp: Date;
}

const TARGETS = [5, 10, 15, 20, 30] as const;

export default function StopwatchChallengeTool() {
  const { t } = useTranslation();
  
  const [target, setTarget] = useState<number>(10);
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [result, setResult] = useState<ChallengeResult | null>(null);
  const [history, setHistory] = useState<ChallengeResult[]>([]);
  const [bestDiff, setBestDiff] = useState<number | null>(null);
  
  const startTimeRef = useRef<number>(0);
  const animationRef = useRef<number | null>(null);

  const updateTime = useCallback(() => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    setTime(elapsed);
    animationRef.current = requestAnimationFrame(updateTime);
  }, []);

  const startTimer = useCallback(() => {
    setIsRunning(true);
    setResult(null);
    setTime(0);
    startTimeRef.current = Date.now();
    animationRef.current = requestAnimationFrame(updateTime);
  }, [updateTime]);

  const stopTimer = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsRunning(false);
    
    const actualTime = (Date.now() - startTimeRef.current) / 1000;
    const diff = Math.abs(actualTime - target);
    
    const newResult: ChallengeResult = {
      target,
      actual: actualTime,
      difference: diff,
      timestamp: new Date()
    };
    
    setResult(newResult);
    setTime(actualTime);
    setHistory(prev => [newResult, ...prev.slice(0, 9)]);
    
    if (bestDiff === null || diff < bestDiff) {
      setBestDiff(diff);
    }
  }, [target, bestDiff]);

  const reset = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsRunning(false);
    setTime(0);
    setResult(null);
  };

  const getAccuracyColor = (diff: number) => {
    if (diff < 0.1) return 'text-purple-500';
    if (diff < 0.3) return 'text-green-500';
    if (diff < 0.5) return 'text-yellow-500';
    if (diff < 1) return 'text-orange-500';
    return 'text-red-500';
  };

  const getAccuracyLabel = (diff: number) => {
    if (diff < 0.1) return t('Tools.stopwatch-challenge.perfect', '완벽!');
    if (diff < 0.3) return t('Tools.stopwatch-challenge.excellent', '훌륭해요!');
    if (diff < 0.5) return t('Tools.stopwatch-challenge.great', '좋아요!');
    if (diff < 1) return t('Tools.stopwatch-challenge.good', '괜찮아요');
    return t('Tools.stopwatch-challenge.tryAgain', '다시 도전!');
  };

  return (
    <FullscreenWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {bestDiff !== null && (
              <Badge className="gap-1">
                <Trophy className="w-3 h-3" />
                {t('Tools.stopwatch-challenge.best', '최고')}: {bestDiff.toFixed(3)}s
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            {TARGETS.map(t => (
              <Button
                key={t}
                variant={target === t ? "default" : "outline"}
                size="sm"
                onClick={() => !isRunning && setTarget(t)}
                disabled={isRunning}
                data-testid={`button-target-${t}`}
              >
                {t}s
              </Button>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="min-h-[350px] flex flex-col items-center justify-center gap-6 p-8">
              <div className="flex items-center gap-2">
                <Target className="w-6 h-6 text-primary" />
                <span className="text-xl">
                  {t('Tools.stopwatch-challenge.target', '목표')}: <strong>{target}.00</strong>s
                </span>
              </div>

              <div className="text-center">
                <p className={`text-7xl md:text-8xl font-bold font-mono ${
                  result ? getAccuracyColor(result.difference) : 'text-primary'
                }`}>
                  {time.toFixed(2)}
                </p>
                <p className="text-muted-foreground mt-2">
                  {t('Tools.stopwatch-challenge.seconds', '초')}
                </p>
              </div>

              {result && (
                <div className="text-center space-y-2">
                  <p className={`text-2xl font-bold ${getAccuracyColor(result.difference)}`}>
                    {getAccuracyLabel(result.difference)}
                  </p>
                  <p className="text-muted-foreground">
                    {t('Tools.stopwatch-challenge.difference', '차이')}: {result.difference.toFixed(3)}s
                  </p>
                </div>
              )}

              {!isRunning && !result && (
                <p className="text-muted-foreground text-center">
                  {t('Tools.stopwatch-challenge.instructions', '정확히 {{target}}초에 멈춰보세요!', { target })}
                </p>
              )}

              <div className="flex gap-4">
                {!isRunning ? (
                  <Button 
                    size="lg" 
                    onClick={startTimer}
                    className="gap-2 text-lg px-8"
                    data-testid="button-start"
                  >
                    <Play className="w-5 h-5" />
                    {t('Tools.stopwatch-challenge.start', '시작')}
                  </Button>
                ) : (
                  <Button 
                    size="lg" 
                    onClick={stopTimer}
                    variant="destructive"
                    className="gap-2 text-lg px-8"
                    data-testid="button-stop"
                  >
                    <Square className="w-5 h-5" />
                    {t('Tools.stopwatch-challenge.stop', '멈춤')}
                  </Button>
                )}
                
                {result && (
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={reset}
                    className="gap-2"
                    data-testid="button-reset"
                  >
                    <RotateCcw className="w-5 h-5" />
                    {t('Tools.stopwatch-challenge.reset', '리셋')}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {history.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4" />
              {t('Tools.stopwatch-challenge.history', '기록')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {history.map((record, i) => (
                <Card key={i}>
                  <CardContent className="p-3 text-center">
                    <p className={`text-lg font-bold ${getAccuracyColor(record.difference)}`}>
                      {record.actual.toFixed(2)}s
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('Tools.stopwatch-challenge.diff', '차이')}: {record.difference.toFixed(3)}s
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center">
          <div className="text-sm">
            <Badge variant="outline" className="text-purple-500">&lt; 0.1s</Badge>
            <p className="text-xs mt-1">{t('Tools.stopwatch-challenge.perfect', '완벽!')}</p>
          </div>
          <div className="text-sm">
            <Badge variant="outline" className="text-green-500">&lt; 0.3s</Badge>
            <p className="text-xs mt-1">{t('Tools.stopwatch-challenge.excellent', '훌륭해요!')}</p>
          </div>
          <div className="text-sm">
            <Badge variant="outline" className="text-yellow-500">&lt; 0.5s</Badge>
            <p className="text-xs mt-1">{t('Tools.stopwatch-challenge.great', '좋아요!')}</p>
          </div>
          <div className="text-sm">
            <Badge variant="outline" className="text-orange-500">&lt; 1s</Badge>
            <p className="text-xs mt-1">{t('Tools.stopwatch-challenge.good', '괜찮아요')}</p>
          </div>
          <div className="text-sm">
            <Badge variant="outline" className="text-red-500">&gt; 1s</Badge>
            <p className="text-xs mt-1">{t('Tools.stopwatch-challenge.tryAgain', '다시 도전!')}</p>
          </div>
        </div>
      </div>
    </FullscreenWrapper>
  );
}
