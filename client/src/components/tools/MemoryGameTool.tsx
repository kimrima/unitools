import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FullscreenWrapper } from './FullscreenWrapper';
import { 
  Brain, RotateCcw, Trophy, Timer, Sparkles, Play
} from 'lucide-react';

type GridSize = 4 | 6;
type GameState = 'ready' | 'playing' | 'finished';

interface MemoryCard {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const SYMBOLS = [
  '🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🥝', '🍒',
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
  '⭐', '🌙', '☀️', '🌈', '⚡', '🔥', '💧', '❄️',
  '🎈', '🎁', '🎀', '🎨', '🎵', '🎸', '🎮', '🎲'
];

export default function MemoryGameTool() {
  const { t } = useTranslation();
  
  const [gridSize, setGridSize] = useState<GridSize>(4);
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [gameState, setGameState] = useState<GameState>('ready');
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [time, setTime] = useState(0);
  const [bestScore, setBestScore] = useState<Record<number, number>>({});

  const totalPairs = (gridSize * gridSize) / 2;

  const initGame = useCallback(() => {
    const numPairs = (gridSize * gridSize) / 2;
    const selectedSymbols = SYMBOLS.slice(0, numPairs);
    const cardPairs = [...selectedSymbols, ...selectedSymbols];
    
    const shuffled = cardPairs
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false
      }));

    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setTime(0);
    setGameState('playing');
  }, [gridSize]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  useEffect(() => {
    if (matches === totalPairs && gameState === 'playing') {
      setGameState('finished');
      const currentBest = bestScore[gridSize];
      if (!currentBest || moves < currentBest) {
        setBestScore(prev => ({ ...prev, [gridSize]: moves }));
      }
    }
  }, [matches, totalPairs, gameState, moves, gridSize, bestScore]);

  const handleCardClick = (id: number) => {
    if (gameState !== 'playing') return;
    if (flippedCards.length >= 2) return;
    if (cards[id].isFlipped || cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      
      const [first, second] = newFlipped;
      if (cards[first].symbol === cards[second].symbol) {
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === first || card.id === second
              ? { ...card, isMatched: true }
              : card
          ));
          setMatches(prev => prev + 1);
          setFlippedCards([]);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === first || card.id === second
              ? { ...card, isFlipped: false }
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <FullscreenWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {bestScore[gridSize] && (
              <Badge className="gap-1">
                <Trophy className="w-3 h-3" />
                {t('Tools.memory-game.best', '최고')}: {bestScore[gridSize]} {t('Tools.memory-game.moves', '수')}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            {([4, 6] as GridSize[]).map(size => (
              <Button
                key={size}
                variant={gridSize === size ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (gameState === 'ready' || gameState === 'finished') {
                    setGridSize(size);
                  }
                }}
                disabled={gameState === 'playing'}
                data-testid={`button-size-${size}`}
              >
                {size}x{size}
              </Button>
            ))}
          </div>
        </div>

        {gameState === 'ready' && (
          <Card>
            <CardContent className="p-0">
              <div className="min-h-[350px] flex flex-col items-center justify-center gap-6 p-8">
                <Brain className="w-20 h-20 text-primary" />
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">
                    {t('Tools.memory-game.title', '기억력 게임')}
                  </h2>
                  <p className="text-muted-foreground">
                    {t('Tools.memory-game.description', '같은 카드 쌍을 찾아보세요!')}
                  </p>
                </div>
                <Button 
                  size="lg" 
                  onClick={initGame}
                  className="gap-2 text-lg px-8"
                  data-testid="button-start"
                >
                  <Play className="w-5 h-5" />
                  {t('Tools.memory-game.start', '시작하기')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {(gameState === 'playing' || gameState === 'finished') && (
          <>
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4" />
                <span className="font-mono text-lg">{formatTime(time)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="font-mono text-lg">{moves} {t('Tools.memory-game.moves', '수')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span className="font-mono text-lg">{matches}/{totalPairs}</span>
              </div>
            </div>

            <div className="flex justify-center">
              <div 
                className="grid gap-2 md:gap-3"
                style={{ 
                  gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                  maxWidth: `${gridSize * 80}px`
                }}
              >
                {cards.map((card) => (
                  <Button
                    key={card.id}
                    variant="outline"
                    className={`
                      aspect-square h-auto min-h-[50px] md:min-h-[70px] text-2xl md:text-3xl
                      transition-all duration-300 transform
                      ${card.isFlipped || card.isMatched 
                        ? 'bg-primary/10 rotate-0' 
                        : 'bg-muted hover:bg-muted/80'
                      }
                      ${card.isMatched ? 'opacity-50' : ''}
                    `}
                    onClick={() => handleCardClick(card.id)}
                    disabled={card.isMatched || gameState === 'finished'}
                    data-testid={`card-${card.id}`}
                  >
                    {card.isFlipped || card.isMatched ? card.symbol : '?'}
                  </Button>
                ))}
              </div>
            </div>

            {gameState === 'finished' && (
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <Trophy className="w-12 h-12 mx-auto text-yellow-500" />
                  <h3 className="text-2xl font-bold">
                    {t('Tools.memory-game.complete', '완료!')}
                  </h3>
                  <p className="text-muted-foreground">
                    {t('Tools.memory-game.result', '{{moves}}수, {{time}}', { moves, time: formatTime(time) })}
                  </p>
                </div>
                <Button onClick={initGame} className="gap-2" data-testid="button-restart">
                  <RotateCcw className="w-4 h-4" />
                  {t('Tools.memory-game.playAgain', '다시 하기')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </FullscreenWrapper>
  );
}
