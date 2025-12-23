import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FullscreenWrapper } from './FullscreenWrapper';
import { 
  Trophy, Trash2, Play, RotateCcw, Zap, Crown, Swords
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type GamePhase = 'setup' | 'playing' | 'winner';
type RoundSize = 4 | 8 | 16 | 32;

interface Match {
  itemA: string;
  itemB: string;
  winner?: string;
}

const EXAMPLE_ITEMS_KO = [
  '피자', '치킨', '햄버거', '라면',
  '짜장면', '짬뽕', '떡볶이', '김밥',
  '삼겹살', '갈비', '족발', '보쌈',
  '초밥', '회', '돈까스', '냉면'
];

const EXAMPLE_ITEMS_EN = [
  'Pizza', 'Chicken', 'Burger', 'Ramen',
  'Sushi', 'Tacos', 'Pasta', 'Steak',
  'BBQ', 'Curry', 'Pho', 'Dim Sum',
  'Pad Thai', 'Kebab', 'Fish & Chips', 'Burrito'
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function TournamentTool() {
  const { t, i18n } = useTranslation();

  const [items, setItems] = useState<string[]>([]);
  const [inputItem, setInputItem] = useState('');
  const [roundSize, setRoundSize] = useState<RoundSize>(8);
  const [gamePhase, setGamePhase] = useState<GamePhase>('setup');
  
  const [currentRound, setCurrentRound] = useState<string[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [winners, setWinners] = useState<string[]>([]);
  const [finalWinner, setFinalWinner] = useState<string | null>(null);
  const [matchHistory, setMatchHistory] = useState<Match[]>([]);

  const getRoundName = (remaining: number): string => {
    if (remaining === 2) return '결승';
    if (remaining === 4) return '4강';
    if (remaining === 8) return '8강';
    if (remaining === 16) return '16강';
    if (remaining === 32) return '32강';
    return `${remaining}강`;
  };

  const addItem = useCallback(() => {
    if (inputItem.trim() && items.length < 32) {
      setItems([...items, inputItem.trim()]);
      setInputItem('');
    }
  }, [inputItem, items]);

  const removeItem = useCallback((index: number) => {
    setItems(items.filter((_, i) => i !== index));
  }, [items]);

  const loadExamples = useCallback(() => {
    const examples = i18n.language === 'ko' ? EXAMPLE_ITEMS_KO : EXAMPLE_ITEMS_EN;
    setItems(examples.slice(0, roundSize));
  }, [i18n.language, roundSize]);

  const startGame = useCallback(() => {
    if (items.length < roundSize) {
      return;
    }
    const shuffled = shuffleArray(items.slice(0, roundSize));
    setCurrentRound(shuffled);
    setCurrentMatchIndex(0);
    setRoundNumber(1);
    setWinners([]);
    setFinalWinner(null);
    setMatchHistory([]);
    setGamePhase('playing');
  }, [items, roundSize]);

  const handleChoice = useCallback((choice: 'A' | 'B') => {
    const itemA = currentRound[currentMatchIndex * 2];
    const itemB = currentRound[currentMatchIndex * 2 + 1];
    const winner = choice === 'A' ? itemA : itemB;
    
    const newWinners = [...winners, winner];
    setWinners(newWinners);
    setMatchHistory(prev => [...prev, { itemA, itemB, winner }]);

    const totalMatchesInRound = currentRound.length / 2;
    
    if (currentMatchIndex + 1 < totalMatchesInRound) {
      setCurrentMatchIndex(currentMatchIndex + 1);
    } else {
      if (newWinners.length === 1) {
        setFinalWinner(newWinners[0]);
        setGamePhase('winner');
      } else {
        setCurrentRound(newWinners);
        setCurrentMatchIndex(0);
        setRoundNumber(roundNumber + 1);
        setWinners([]);
      }
    }
  }, [currentRound, currentMatchIndex, winners, roundNumber]);

  const resetGame = useCallback(() => {
    setGamePhase('setup');
    setCurrentRound([]);
    setCurrentMatchIndex(0);
    setRoundNumber(1);
    setWinners([]);
    setFinalWinner(null);
    setMatchHistory([]);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addItem();
    }
  };

  const currentItemA = currentRound[currentMatchIndex * 2];
  const currentItemB = currentRound[currentMatchIndex * 2 + 1];
  const totalMatchesInRound = currentRound.length / 2;
  const roundName = getRoundName(currentRound.length);

  return (
    <FullscreenWrapper>
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {gamePhase === 'setup' && (
            <motion.div 
              key="setup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <Trophy className="w-12 h-12 mx-auto text-yellow-500" />
                <h2 className="text-2xl font-bold">이상형 월드컵</h2>
                <p className="text-muted-foreground">
                  항목을 입력하고 토너먼트를 시작하세요!
                </p>
              </div>

              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label>토너먼트 규모</Label>
                    <Select 
                      value={String(roundSize)} 
                      onValueChange={(v) => setRoundSize(Number(v) as RoundSize)}
                    >
                      <SelectTrigger data-testid="select-round-size">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">4강 (4개 항목)</SelectItem>
                        <SelectItem value="8">8강 (8개 항목)</SelectItem>
                        <SelectItem value="16">16강 (16개 항목)</SelectItem>
                        <SelectItem value="32">32강 (32개 항목)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>항목 추가 ({items.length}/{roundSize})</Label>
                    <div className="flex gap-2">
                      <Input
                        value={inputItem}
                        onChange={(e) => setInputItem(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="항목 입력 후 Enter"
                        disabled={items.length >= roundSize}
                        data-testid="input-item"
                      />
                      <Button 
                        onClick={addItem}
                        disabled={!inputItem.trim() || items.length >= roundSize}
                        data-testid="button-add-item"
                      >
                        추가
                      </Button>
                    </div>
                  </div>

                  <Button 
                    variant="outline"
                    onClick={loadExamples}
                    className="w-full gap-2"
                    data-testid="button-examples"
                  >
                    <Zap className="w-4 h-4" />
                    음식 예시로 채우기
                  </Button>
                </CardContent>
              </Card>

              {items.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">항목 목록</h3>
                    {items.length >= roundSize && (
                      <Button 
                        onClick={startGame}
                        className="gap-2"
                        data-testid="button-start"
                      >
                        <Play className="w-4 h-4" />
                        게임 시작
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {items.map((item, i) => (
                      <div 
                        key={i} 
                        className="flex items-center justify-between p-2 bg-muted rounded-md gap-1"
                      >
                        <span className="text-sm truncate flex-1">{item}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 h-6 w-6"
                          onClick={() => removeItem(i)}
                          data-testid={`button-remove-${i}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {items.length < roundSize && (
                    <p className="text-center text-sm text-muted-foreground">
                      {roundSize - items.length}개 더 필요합니다
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {gamePhase === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-base px-3 py-1">
                    {roundName}
                  </Badge>
                  <Badge variant="outline" className="text-base px-3 py-1">
                    {currentMatchIndex + 1} / {totalMatchesInRound}
                  </Badge>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetGame}
                  data-testid="button-reset"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  처음으로
                </Button>
              </div>

              <div className="text-center">
                <Swords className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <h2 className="text-xl font-semibold text-muted-foreground">
                  둘 중 하나를 선택하세요!
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    className="w-full h-auto min-h-[180px] p-6 text-xl font-bold flex flex-col gap-2"
                    onClick={() => handleChoice('A')}
                    data-testid="button-choice-a"
                  >
                    <span className="text-2xl md:text-4xl leading-tight break-keep">
                      {currentItemA}
                    </span>
                  </Button>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    className="w-full h-auto min-h-[180px] p-6 text-xl font-bold flex flex-col gap-2"
                    onClick={() => handleChoice('B')}
                    data-testid="button-choice-b"
                  >
                    <span className="text-2xl md:text-4xl leading-tight break-keep">
                      {currentItemB}
                    </span>
                  </Button>
                </motion.div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                VS
              </div>
            </motion.div>
          )}

          {gamePhase === 'winner' && (
            <motion.div
              key="winner"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center space-y-4">
                <motion.div
                  animate={{ 
                    rotate: [0, -10, 10, -10, 10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Crown className="w-20 h-20 mx-auto text-yellow-500" />
                </motion.div>
                <h2 className="text-2xl font-bold">최종 우승!</h2>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="p-6 bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-lg"
                >
                  <p className="text-4xl md:text-5xl font-bold text-yellow-700 dark:text-yellow-300">
                    {finalWinner}
                  </p>
                </motion.div>
              </div>

              <Card>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-lg mb-4">대진 기록</h3>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {matchHistory.map((match, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md text-sm">
                        <span className={match.winner === match.itemA ? 'font-bold text-primary' : 'text-muted-foreground'}>
                          {match.itemA}
                        </span>
                        <span className="text-muted-foreground">vs</span>
                        <span className={match.winner === match.itemB ? 'font-bold text-primary' : 'text-muted-foreground'}>
                          {match.itemB}
                        </span>
                        <Trophy className="w-3 h-3 text-yellow-500 ml-auto" />
                        <span className="font-medium">{match.winner}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4 flex-wrap">
                <Button onClick={() => {
                  const shuffled = shuffleArray(items.slice(0, roundSize));
                  setCurrentRound(shuffled);
                  setCurrentMatchIndex(0);
                  setRoundNumber(1);
                  setWinners([]);
                  setFinalWinner(null);
                  setMatchHistory([]);
                  setGamePhase('playing');
                }} className="flex-1 gap-2">
                  <RotateCcw className="w-4 h-4" />
                  다시 하기
                </Button>
                <Button variant="outline" onClick={resetGame} className="flex-1">
                  새 게임
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FullscreenWrapper>
  );
}
