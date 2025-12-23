import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

type GameState = 'waiting' | 'ready' | 'go' | 'result' | 'tooSoon';

export default function ReactionTimeTool() {
  const { t } = useTranslation();
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [results, setResults] = useState<number[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startGame = useCallback(() => {
    setGameState('ready');
    setReactionTime(null);
    
    const delay = 2000 + Math.random() * 3000;
    timeoutRef.current = setTimeout(() => {
      setGameState('go');
      startTimeRef.current = Date.now();
    }, delay);
  }, []);

  const handleClick = useCallback(() => {
    if (gameState === 'waiting' || gameState === 'result' || gameState === 'tooSoon') {
      startGame();
    } else if (gameState === 'ready') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setGameState('tooSoon');
    } else if (gameState === 'go') {
      const time = Date.now() - startTimeRef.current;
      setReactionTime(time);
      setResults(prev => [...prev.slice(-9), time]);
      setGameState('result');
    }
  }, [gameState, startGame]);

  const getAverageTime = () => {
    if (results.length === 0) return 0;
    return Math.round(results.reduce((a, b) => a + b, 0) / results.length);
  };

  const getBgColor = () => {
    switch (gameState) {
      case 'ready': return 'bg-red-500';
      case 'go': return 'bg-green-500';
      case 'tooSoon': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getMessage = () => {
    switch (gameState) {
      case 'waiting': return t('Tools.reaction-time.click', 'Click to Start');
      case 'ready': return t('Tools.reaction-time.wait', 'Wait for green...');
      case 'go': return t('Tools.reaction-time.clickNow', 'Click NOW!');
      case 'tooSoon': return t('Tools.reaction-time.tooSoon', 'Too soon! Click to try again');
      case 'result': return `${reactionTime} ms`;
    }
  };

  const getRating = (time: number) => {
    if (time < 200) return t('Tools.reaction-time.excellent', 'Excellent!');
    if (time < 250) return t('Tools.reaction-time.great', 'Great!');
    if (time < 300) return t('Tools.reaction-time.good', 'Good');
    if (time < 400) return t('Tools.reaction-time.average', 'Average');
    return t('Tools.reaction-time.slow', 'Keep practicing');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-6">
            <div 
              className={`w-full max-w-md h-64 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${getBgColor()}`}
              onClick={handleClick}
              data-testid="reaction-area"
            >
              <Zap className="w-16 h-16 text-white mb-4" />
              <div className="text-3xl font-bold text-white text-center px-4" data-testid="message-display">
                {getMessage()}
              </div>
              {gameState === 'result' && reactionTime && (
                <div className="text-lg text-white/80 mt-2">
                  {getRating(reactionTime)}
                </div>
              )}
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
                  <div className="text-2xl font-bold" data-testid="best-display">
                    {Math.min(...results)} ms
                  </div>
                </div>
              </div>
            )}

            {results.length > 0 && (
              <div className="w-full max-w-md">
                <div className="text-sm text-muted-foreground mb-2">
                  {t('Tools.reaction-time.history', 'Recent Results')}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {results.map((time, i) => (
                    <span key={i} className="px-2 py-1 bg-muted rounded text-sm">
                      {time}ms
                    </span>
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
