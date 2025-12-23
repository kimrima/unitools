import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

type GameState = 'waiting' | 'ready' | 'go' | 'result' | 'tooSoon';

const BENCHMARKS = [
  { label: 'F1 Driver', time: 150, color: 'text-yellow-500' },
  { label: 'Pro Gamer', time: 180, color: 'text-purple-500' },
  { label: 'Fast', time: 220, color: 'text-green-500' },
  { label: 'Average', time: 273, color: 'text-blue-500' },
  { label: 'Slow', time: 350, color: 'text-orange-500' },
];

export default function ReactionTimeTool() {
  const { t } = useTranslation();
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [results, setResults] = useState<number[]>([]);
  const [lightIndex, setLightIndex] = useState(-1);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lightTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startGame = useCallback(() => {
    setGameState('ready');
    setReactionTime(null);
    setLightIndex(0);
    
    let currentLight = 0;
    const lightInterval = setInterval(() => {
      currentLight++;
      setLightIndex(currentLight);
      if (currentLight >= 4) {
        clearInterval(lightInterval);
        const delay = 500 + Math.random() * 2500;
        timeoutRef.current = setTimeout(() => {
          setLightIndex(5);
          setGameState('go');
          startTimeRef.current = Date.now();
        }, delay);
      }
    }, 600);
    
    lightTimeoutRef.current = lightInterval as unknown as NodeJS.Timeout;
  }, []);

  const handleClick = useCallback(() => {
    if (gameState === 'waiting' || gameState === 'result' || gameState === 'tooSoon') {
      startGame();
    } else if (gameState === 'ready') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (lightTimeoutRef.current) clearInterval(lightTimeoutRef.current as unknown as NodeJS.Timeout);
      setLightIndex(-1);
      setGameState('tooSoon');
    } else if (gameState === 'go') {
      const time = Date.now() - startTimeRef.current;
      setReactionTime(time);
      setResults(prev => [...prev.slice(-9), time]);
      setGameState('result');
    }
  }, [gameState, startGame]);

  const resetAll = useCallback(() => {
    setResults([]);
    setReactionTime(null);
    setGameState('waiting');
    setLightIndex(-1);
  }, []);

  const getAverageTime = () => {
    if (results.length === 0) return 0;
    return Math.round(results.reduce((a, b) => a + b, 0) / results.length);
  };

  const getBestTime = () => {
    if (results.length === 0) return 0;
    return Math.min(...results);
  };

  const getMessage = () => {
    switch (gameState) {
      case 'waiting': return t('Tools.reaction-time.click', 'Click to Start');
      case 'ready': return t('Tools.reaction-time.wait', 'Wait for lights out...');
      case 'go': return t('Tools.reaction-time.clickNow', 'GO!');
      case 'tooSoon': return t('Tools.reaction-time.tooSoon', 'Too soon! Click to try again');
      case 'result': return `${reactionTime} ms`;
    }
  };

  const getRating = (time: number) => {
    if (time < 150) return { text: t('Tools.reaction-time.excellent', 'F1 Driver Level!'), color: 'text-yellow-500' };
    if (time < 200) return { text: t('Tools.reaction-time.great', 'Pro Gamer!'), color: 'text-purple-500' };
    if (time < 250) return { text: t('Tools.reaction-time.good', 'Fast!'), color: 'text-green-500' };
    if (time < 300) return { text: t('Tools.reaction-time.average', 'Average'), color: 'text-blue-500' };
    return { text: t('Tools.reaction-time.slow', 'Keep practicing'), color: 'text-orange-500' };
  };

  const renderF1Lights = () => {
    const lights = [0, 1, 2, 3, 4];
    const isGoState = lightIndex === 5;
    
    return (
      <div className="flex justify-center gap-3 mb-6">
        {lights.map((i) => (
          <div
            key={i}
            className={`w-10 h-10 md:w-14 md:h-14 rounded-full border-4 border-gray-700 transition-all duration-200 ${
              isGoState 
                ? 'bg-gray-800' 
                : i <= lightIndex 
                  ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.7)]' 
                  : 'bg-gray-800'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-6">
            <div 
              className={`w-full max-w-md rounded-xl cursor-pointer transition-all duration-200 overflow-hidden ${
                gameState === 'go' 
                  ? 'bg-green-500' 
                  : gameState === 'tooSoon' 
                    ? 'bg-yellow-500' 
                    : 'bg-gray-900'
              }`}
              onClick={handleClick}
              data-testid="reaction-area"
            >
              <div className="p-6 pt-8">
                {renderF1Lights()}
                <div className={`text-3xl md:text-4xl font-bold text-center mb-2 ${
                  gameState === 'go' || gameState === 'tooSoon' ? 'text-gray-900' : 'text-white'
                }`} data-testid="message-display">
                  {getMessage()}
                </div>
                {gameState === 'result' && reactionTime && (
                  <div className={`text-xl text-center ${getRating(reactionTime).color}`}>
                    {getRating(reactionTime).text}
                  </div>
                )}
                <div className={`text-sm text-center mt-4 ${
                  gameState === 'go' || gameState === 'tooSoon' ? 'text-gray-800' : 'text-gray-400'
                }`}>
                  {gameState === 'waiting' && t('Tools.reaction-time.clickToStart', 'Click anywhere to start')}
                  {gameState === 'ready' && t('Tools.reaction-time.watchLights', 'Watch the lights...')}
                </div>
              </div>
            </div>

            <div className="w-full max-w-md">
              <div className="text-sm font-medium text-muted-foreground mb-3">
                {t('Tools.reaction-time.benchmarks', 'Benchmarks')}
              </div>
              <div className="relative h-8 bg-muted rounded-full overflow-hidden">
                <div className="absolute inset-0 flex">
                  {BENCHMARKS.map((bench, i) => (
                    <div 
                      key={i}
                      className="flex-1 border-r border-background/50 last:border-r-0"
                      style={{ backgroundColor: `hsl(${120 - (i * 25)}, 70%, 50%)`, opacity: 0.3 }}
                    />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-between px-2">
                  {BENCHMARKS.map((bench) => (
                    <div key={bench.label} className="text-[10px] md:text-xs font-medium text-foreground/70">
                      {bench.time}ms
                    </div>
                  ))}
                </div>
                {reactionTime && (
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-primary shadow-lg"
                    style={{ 
                      left: `${Math.min(100, Math.max(0, ((reactionTime - 100) / 300) * 100))}%`,
                      transition: 'left 0.3s ease-out'
                    }}
                  />
                )}
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                {BENCHMARKS.map((bench) => (
                  <span key={bench.label} className={bench.color}>{bench.label}</span>
                ))}
              </div>
            </div>

            {results.length > 0 && (
              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <div className="text-sm text-muted-foreground">
                    {t('Tools.reaction-time.average', 'Average')}
                  </div>
                  <div className="text-2xl font-bold" data-testid="average-display">
                    {getAverageTime()} ms
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <div className="text-sm text-muted-foreground">
                    {t('Tools.reaction-time.best', 'Best')}
                  </div>
                  <div className="text-2xl font-bold text-green-500" data-testid="best-display">
                    {getBestTime()} ms
                  </div>
                </div>
              </div>
            )}

            {results.length > 0 && (
              <div className="w-full max-w-md">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-muted-foreground">
                    {t('Tools.reaction-time.history', 'Recent Results')} ({results.length}/10)
                  </div>
                  <Button variant="ghost" size="sm" onClick={resetAll} data-testid="button-reset">
                    <RotateCcw className="h-4 w-4 mr-1" />
                    {t('Common.actions.reset', 'Reset')}
                  </Button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {results.map((time, i) => {
                    const rating = getRating(time);
                    return (
                      <span 
                        key={i} 
                        className={`px-2 py-1 bg-muted rounded text-sm font-medium ${rating.color}`}
                      >
                        {time}ms
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="w-full max-w-md p-4 bg-muted/50 rounded-lg">
              <div className="text-sm font-medium mb-2">
                {t('Tools.reaction-time.howItWorks', 'How it works')}
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>{t('Tools.reaction-time.step1', '1. Click to start - red lights will appear one by one')}</li>
                <li>{t('Tools.reaction-time.step2', '2. Wait for all 5 lights to turn on')}</li>
                <li>{t('Tools.reaction-time.step3', '3. When lights go OUT (turn off), click as fast as you can!')}</li>
                <li>{t('Tools.reaction-time.step4', '4. If you click too early, you get a false start')}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
