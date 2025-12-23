import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FullscreenWrapper } from './FullscreenWrapper';
import { 
  MousePointer2, RotateCcw, Trophy, Zap, Timer, Target
} from 'lucide-react';

type GameState = 'ready' | 'playing' | 'finished';

interface ClickRecord {
  cps: number;
  clicks: number;
  duration: number;
  timestamp: Date;
}

const DURATIONS = [5, 10, 15, 30] as const;

const RANKINGS = [
  { min: 14, label: 'kohi', color: 'text-purple-500', desc: 'Kohi Click Master' },
  { min: 12, label: 'pro', color: 'text-red-500', desc: 'Pro Gamer' },
  { min: 10, label: 'fast', color: 'text-orange-500', desc: 'Fast Clicker' },
  { min: 8, label: 'good', color: 'text-yellow-500', desc: 'Good' },
  { min: 6, label: 'average', color: 'text-green-500', desc: 'Average' },
  { min: 0, label: 'slow', color: 'text-gray-500', desc: 'Keep Practicing' },
];

export default function CpsTestTool() {
  const { t } = useTranslation();
  
  const [gameState, setGameState] = useState<GameState>('ready');
  const [duration, setDuration] = useState<number>(10);
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [history, setHistory] = useState<ClickRecord[]>([]);
  const [bestCps, setBestCps] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startGame = useCallback(() => {
    setGameState('playing');
    setClicks(0);
    setTimeLeft(duration);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        setGameState('finished');
      }
    }, 50);
  }, [duration]);

  const handleClick = () => {
    if (gameState === 'ready') {
      startGame();
      setClicks(1);
    } else if (gameState === 'playing') {
      setClicks(prev => prev + 1);
    }
  };

  const finishGame = useCallback(() => {
    const cps = clicks / duration;
    const record: ClickRecord = {
      cps,
      clicks,
      duration,
      timestamp: new Date()
    };
    
    setHistory(prev => [record, ...prev.slice(0, 9)]);
    if (cps > bestCps) {
      setBestCps(cps);
    }
  }, [clicks, duration, bestCps]);

  useEffect(() => {
    if (gameState === 'finished') {
      finishGame();
    }
  }, [gameState, finishGame]);

  const resetGame = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setGameState('ready');
    setClicks(0);
    setTimeLeft(duration);
  };

  const cps = gameState === 'finished' ? clicks / duration : 
              gameState === 'playing' && duration - timeLeft > 0 ? clicks / (duration - timeLeft) : 0;

  const getRanking = (cpsValue: number) => {
    return RANKINGS.find(r => cpsValue >= r.min) || RANKINGS[RANKINGS.length - 1];
  };

  const ranking = getRanking(cps);
  const progress = gameState === 'playing' ? ((duration - timeLeft) / duration) * 100 : 
                   gameState === 'finished' ? 100 : 0;

  return (
    <FullscreenWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {bestCps > 0 && (
              <Badge className="gap-1">
                <Trophy className="w-3 h-3" />
                {t('Tools.cps-test.best', '최고')}: {bestCps.toFixed(2)} CPS
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            {DURATIONS.map(d => (
              <Button
                key={d}
                variant={duration === d ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (gameState === 'ready') {
                    setDuration(d);
                    setTimeLeft(d);
                  }
                }}
                disabled={gameState !== 'ready'}
                data-testid={`button-duration-${d}`}
              >
                {d}s
              </Button>
            ))}
          </div>
        </div>

        <Card 
          className={`cursor-pointer select-none transition-all ${
            gameState === 'playing' ? 'bg-primary/5 border-primary' : ''
          }`}
          onClick={handleClick}
          data-testid="click-area"
        >
          <CardContent className="p-0">
            <div className="min-h-[350px] flex flex-col items-center justify-center gap-6 p-8">
              {gameState === 'ready' && (
                <>
                  <MousePointer2 className="w-20 h-20 text-primary animate-bounce" />
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold">
                      {t('Tools.cps-test.clickToStart', '클릭하여 시작')}
                    </h2>
                    <p className="text-muted-foreground">
                      {t('Tools.cps-test.description', '{{duration}}초 동안 최대한 빠르게 클릭하세요!', { duration })}
                    </p>
                  </div>
                </>
              )}

              {gameState === 'playing' && (
                <>
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">{t('Tools.cps-test.time', '시간')}</p>
                        <p className="text-4xl font-bold font-mono">
                          {timeLeft.toFixed(1)}s
                        </p>
                      </div>
                      <div className="w-px h-12 bg-border" />
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">{t('Tools.cps-test.clicks', '클릭')}</p>
                        <p className="text-4xl font-bold font-mono text-primary">
                          {clicks}
                        </p>
                      </div>
                      <div className="w-px h-12 bg-border" />
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">CPS</p>
                        <p className="text-4xl font-bold font-mono">
                          {cps.toFixed(1)}
                        </p>
                      </div>
                    </div>
                    
                    <Progress value={progress} className="h-3 w-64" />
                    
                    <p className="text-lg font-semibold text-primary animate-pulse">
                      {t('Tools.cps-test.keepClicking', '계속 클릭하세요!')}
                    </p>
                  </div>
                </>
              )}

              {gameState === 'finished' && (
                <div className="text-center space-y-6">
                  <Trophy className={`w-16 h-16 mx-auto ${ranking.color}`} />
                  
                  <div className="space-y-2">
                    <p className={`text-xl font-bold ${ranking.color}`}>
                      {t(`Tools.cps-test.${ranking.label}`, ranking.desc)}
                    </p>
                    <p className="text-6xl font-bold font-mono text-primary">
                      {cps.toFixed(2)}
                    </p>
                    <p className="text-lg text-muted-foreground">
                      CPS (Clicks Per Second)
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      {clicks} {t('Tools.cps-test.totalClicks', '클릭')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Timer className="w-4 h-4" />
                      {duration}s
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {gameState === 'finished' && (
          <div className="flex justify-center">
            <Button onClick={resetGame} className="gap-2" data-testid="button-restart">
              <RotateCcw className="w-4 h-4" />
              {t('Tools.cps-test.tryAgain', '다시 도전')}
            </Button>
          </div>
        )}

        {history.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4" />
              {t('Tools.cps-test.history', '기록')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {history.map((record, i) => (
                <Card key={i}>
                  <CardContent className="p-3 text-center">
                    <p className={`text-lg font-bold ${getRanking(record.cps).color}`}>
                      {record.cps.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {record.clicks} clicks / {record.duration}s
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {RANKINGS.map((r, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className={r.color}>
                {r.min}+ CPS
              </Badge>
              <span className={r.color}>{t(`Tools.cps-test.${r.label}`, r.desc)}</span>
            </div>
          ))}
        </div>
      </div>
    </FullscreenWrapper>
  );
}
