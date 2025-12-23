import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FullscreenWrapper } from './FullscreenWrapper';
import { 
  Play, RotateCcw, Eye, Users, Gift, X, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LadderPath {
  column: number;
  row: number;
}

interface LadderResult {
  startIndex: number;
  endIndex: number;
  path: { x: number; y: number }[];
}

const EXAMPLE_PARTICIPANTS_KO = ['철수', '영희', '민수', '지현'];
const EXAMPLE_RESULTS_KO = ['당첨', '꽝', '커피', '청소'];
const EXAMPLE_PARTICIPANTS_EN = ['Alice', 'Bob', 'Charlie', 'Diana'];
const EXAMPLE_RESULTS_EN = ['Winner', 'Loser', 'Coffee', 'Clean'];

export default function LadderGameTool() {
  const { t, i18n } = useTranslation();
  
  const [participantInput, setParticipantInput] = useState('');
  const [resultInput, setResultInput] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [results, setResults] = useState<string[]>([]);
  const [ladderPaths, setLadderPaths] = useState<LadderPath[]>([]);
  const [numRows, setNumRows] = useState(0);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);
  const [revealedResults, setRevealedResults] = useState<Set<number>>(new Set());
  const [allRevealed, setAllRevealed] = useState(false);
  const [animationPath, setAnimationPath] = useState<{ x: number; y: number }[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const addParticipants = (text: string) => {
    const parts = text.split(/[,\n]+/).map(s => s.trim()).filter(s => s && !participants.includes(s));
    if (parts.length > 0) {
      setParticipants([...participants, ...parts]);
      setParticipantInput('');
    }
  };

  const addResults = (text: string) => {
    const parts = text.split(/[,\n]+/).map(s => s.trim()).filter(s => s && !results.includes(s));
    if (parts.length > 0) {
      setResults([...results, ...parts]);
      setResultInput('');
    }
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const removeResult = (index: number) => {
    setResults(results.filter((_, i) => i !== index));
  };

  const loadExamples = () => {
    if (i18n.language === 'ko') {
      setParticipants(EXAMPLE_PARTICIPANTS_KO);
      setResults(EXAMPLE_RESULTS_KO);
    } else {
      setParticipants(EXAMPLE_PARTICIPANTS_EN);
      setResults(EXAMPLE_RESULTS_EN);
    }
  };

  const generateLadder = useCallback(() => {
    if (participants.length < 2) return;

    const numColumns = participants.length;
    const rows = 10 + Math.floor(Math.random() * 5);
    const paths: LadderPath[] = [];

    for (let row = 0; row < rows; row++) {
      const usedColumns = new Set<number>();
      
      for (let col = 0; col < numColumns - 1; col++) {
        if (usedColumns.has(col) || usedColumns.has(col - 1)) continue;
        
        if (Math.random() > 0.5) {
          paths.push({ column: col, row });
          usedColumns.add(col);
        }
      }
    }

    setNumRows(rows);
    setLadderPaths(paths);
    setIsGenerated(true);
    setRevealedResults(new Set());
    setAllRevealed(false);
    setAnimatingIndex(null);
    setAnimationPath([]);
  }, [participants.length]);

  const calculatePath = useCallback((startIndex: number): LadderResult => {
    const path: { x: number; y: number }[] = [];
    let currentColumn = startIndex;

    path.push({ x: currentColumn, y: 0 });

    for (let row = 0; row < numRows; row++) {
      const rightPath = ladderPaths.find(p => p.column === currentColumn && p.row === row);
      const leftPath = ladderPaths.find(p => p.column === currentColumn - 1 && p.row === row);

      if (rightPath) {
        path.push({ x: currentColumn, y: row + 0.5 });
        currentColumn++;
        path.push({ x: currentColumn, y: row + 0.5 });
      } else if (leftPath) {
        path.push({ x: currentColumn, y: row + 0.5 });
        currentColumn--;
        path.push({ x: currentColumn, y: row + 0.5 });
      }
      path.push({ x: currentColumn, y: row + 1 });
    }

    return { startIndex, endIndex: currentColumn, path };
  }, [ladderPaths, numRows]);

  const animatePath = async (index: number) => {
    if (isAnimating) return;

    setIsAnimating(true);
    setAnimatingIndex(index);
    
    const result = calculatePath(index);
    setAnimationPath([]);
    
    for (let i = 0; i < result.path.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 80));
      setAnimationPath(prev => [...prev, result.path[i]]);
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    setRevealedResults(prev => new Set([...Array.from(prev), index]));
    setIsAnimating(false);
    setAnimatingIndex(null);
    setAnimationPath([]);
  };

  const revealAll = () => {
    const allIndices = new Set(participants.map((_, i) => i));
    setRevealedResults(allIndices);
    setAllRevealed(true);
  };

  const getResultForParticipant = (index: number): string => {
    if (!isGenerated) return '';
    const result = calculatePath(index);
    if (results.length > 0 && result.endIndex < results.length) {
      return results[result.endIndex];
    }
    return `#${result.endIndex + 1}`;
  };

  const reset = () => {
    setIsGenerated(false);
    setLadderPaths([]);
    setNumRows(0);
    setRevealedResults(new Set());
    setAllRevealed(false);
    setAnimatingIndex(null);
    setAnimationPath([]);
  };

  useEffect(() => {
    if (!isGenerated || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const numColumns = participants.length;
    const columnWidth = width / numColumns;
    const rowHeight = height / (numRows + 1);

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 3;

    for (let col = 0; col < numColumns; col++) {
      const x = columnWidth * col + columnWidth / 2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 3;

    ladderPaths.forEach(path => {
      const x1 = columnWidth * path.column + columnWidth / 2;
      const x2 = columnWidth * (path.column + 1) + columnWidth / 2;
      const y = rowHeight * (path.row + 0.5);
      
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.stroke();
    });

    if (animationPath.length > 1) {
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      animationPath.forEach((point, i) => {
        const x = columnWidth * point.x + columnWidth / 2;
        const y = rowHeight * point.y;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      const lastPoint = animationPath[animationPath.length - 1];
      const dotX = columnWidth * lastPoint.x + columnWidth / 2;
      const dotY = rowHeight * lastPoint.y;
      
      ctx.fillStyle = '#8b5cf6';
      ctx.beginPath();
      ctx.arc(dotX, dotY, 10, 0, Math.PI * 2);
      ctx.fill();
    }

  }, [isGenerated, ladderPaths, participants.length, animationPath, numRows]);

  return (
    <FullscreenWrapper>
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {!isGenerated ? (
            <motion.div 
              key="setup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <Gift className="w-12 h-12 mx-auto text-primary" />
                <h2 className="text-2xl font-bold">
                  {t('Tools.ladder-game.title', '사다리 타기')}
                </h2>
                <p className="text-muted-foreground">
                  {t('Tools.ladder-game.setupDesc', '참가자와 결과를 입력하세요!')}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <Label className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {t('Tools.ladder-game.participants', '참가자')}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={participantInput}
                        onChange={(e) => setParticipantInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addParticipants(participantInput)}
                        placeholder={t('Tools.ladder-game.participantPlaceholder', '쉼표로 구분하거나 Enter')}
                        data-testid="input-participant"
                      />
                      <Button onClick={() => addParticipants(participantInput)} disabled={!participantInput.trim()} size="icon">
                        <Users className="w-4 h-4" />
                      </Button>
                    </div>
                    {participants.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {participants.map((p, i) => (
                          <Badge 
                            key={i} 
                            variant="secondary"
                            className="gap-1 cursor-pointer pr-1"
                            onClick={() => removeParticipant(i)}
                          >
                            {p}
                            <X className="w-3 h-3" />
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {participants.length}{t('Tools.ladder-game.people', '명')} (2~20명)
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 space-y-3">
                    <Label className="flex items-center gap-2">
                      <Gift className="w-4 h-4" />
                      {t('Tools.ladder-game.results', '결과 (선택)')}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={resultInput}
                        onChange={(e) => setResultInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addResults(resultInput)}
                        placeholder={t('Tools.ladder-game.resultPlaceholder', '쉼표로 구분하거나 Enter')}
                        data-testid="input-result"
                      />
                      <Button onClick={() => addResults(resultInput)} disabled={!resultInput.trim()} size="icon">
                        <Gift className="w-4 h-4" />
                      </Button>
                    </div>
                    {results.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {results.map((r, i) => (
                          <Badge 
                            key={i} 
                            variant="outline"
                            className="gap-1 cursor-pointer pr-1"
                            onClick={() => removeResult(i)}
                          >
                            {r}
                            <X className="w-3 h-3" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-2 justify-center">
                <Button 
                  variant="outline"
                  onClick={loadExamples}
                  className="gap-1"
                  data-testid="button-examples"
                >
                  <Zap className="w-4 h-4" />
                  {t('Tools.ladder-game.loadExamples', '예시 불러오기')}
                </Button>
                <Button 
                  onClick={generateLadder}
                  className="gap-2"
                  disabled={participants.length < 2 || participants.length > 20}
                  data-testid="button-generate"
                >
                  <Play className="w-4 h-4" />
                  {t('Tools.ladder-game.generate', '사다리 생성')}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Badge variant="outline" className="text-base px-3 py-1">
                  {participants.length}{t('Tools.ladder-game.people', '명')}
                </Badge>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={revealAll}
                    disabled={allRevealed || isAnimating}
                    className="gap-1"
                    data-testid="button-reveal-all"
                  >
                    <Eye className="w-4 h-4" />
                    {t('Tools.ladder-game.revealAll', '모두 공개')}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={reset}
                    className="gap-1"
                    data-testid="button-reset"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {t('Tools.ladder-game.reset', '다시')}
                  </Button>
                </div>
              </div>

              <div className="flex justify-around mb-2 flex-wrap gap-1">
                {participants.map((name, index) => (
                  <Button
                    key={index}
                    variant={animatingIndex === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => animatePath(index)}
                    disabled={isAnimating}
                    className="text-xs px-2"
                    data-testid={`button-participant-${index}`}
                  >
                    {name}
                  </Button>
                ))}
              </div>

              <Card>
                <CardContent className="p-4">
                  <canvas
                    ref={canvasRef}
                    width={Math.min(600, participants.length * 80)}
                    height={350}
                    className="w-full"
                  />
                </CardContent>
              </Card>

              <div className="flex justify-around flex-wrap gap-1">
                {participants.map((_, positionIndex) => {
                  let matchedParticipantIndex = -1;
                  for (const pIndex of Array.from(revealedResults)) {
                    const result = calculatePath(pIndex);
                    if (result.endIndex === positionIndex) {
                      matchedParticipantIndex = pIndex;
                      break;
                    }
                  }
                  const isRevealed = matchedParticipantIndex >= 0;
                  
                  return (
                    <motion.div
                      key={positionIndex}
                      initial={false}
                      animate={isRevealed ? { scale: [1, 1.1, 1] } : {}}
                      className={`text-center p-2 rounded-md min-w-[60px] ${
                        isRevealed 
                          ? 'bg-primary/10 border border-primary' 
                          : 'bg-muted'
                      }`}
                    >
                      {isRevealed ? (
                        <div>
                          <div className="text-xs text-muted-foreground">
                            {participants[matchedParticipantIndex]}
                          </div>
                          <div className="font-semibold text-primary text-sm">
                            {results[positionIndex] || `#${positionIndex + 1}`}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">?</span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FullscreenWrapper>
  );
}
