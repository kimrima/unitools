import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FullscreenWrapper } from './FullscreenWrapper';
import { 
  Play, RotateCcw, Eye, Users, Gift
} from 'lucide-react';

interface LadderPath {
  column: number;
  row: number;
}

interface LadderResult {
  startIndex: number;
  endIndex: number;
  path: { x: number; y: number }[];
}

export default function LadderGameTool() {
  const { t } = useTranslation();
  
  const [participants, setParticipants] = useState('');
  const [results, setResults] = useState('');
  const [ladderPaths, setLadderPaths] = useState<LadderPath[]>([]);
  const [numRows, setNumRows] = useState(0);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);
  const [revealedResults, setRevealedResults] = useState<Set<number>>(new Set());
  const [allRevealed, setAllRevealed] = useState(false);
  const [animationPath, setAnimationPath] = useState<{ x: number; y: number }[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const participantList = participants.split('\n').map(p => p.trim()).filter(p => p);
  const resultList = results.split('\n').map(r => r.trim()).filter(r => r);

  const generateLadder = useCallback(() => {
    if (participantList.length < 2) return;

    const numColumns = participantList.length;
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
  }, [participantList.length]);

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
    const allIndices = new Set(participantList.map((_, i) => i));
    setRevealedResults(allIndices);
    setAllRevealed(true);
  };

  const getResultForParticipant = (index: number): string => {
    if (!isGenerated) return '';
    const result = calculatePath(index);
    if (resultList.length > 0 && result.endIndex < resultList.length) {
      return resultList[result.endIndex];
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
    const numColumns = participantList.length;
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

  }, [isGenerated, ladderPaths, participantList.length, animationPath, numRows]);

  return (
    <FullscreenWrapper>
      <div className="space-y-6">
        {!isGenerated ? (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {t('Tools.ladder-game.participants', '참가자 (한 줄에 한 명, 2~20명)')}
                </Label>
                <Textarea
                  value={participants}
                  onChange={(e) => setParticipants(e.target.value)}
                  placeholder={t('Tools.ladder-game.participantsPlaceholder', '홍길동\n김철수\n이영희\n박민수')}
                  className="min-h-[150px] font-mono"
                  data-testid="input-participants"
                />
                <p className="text-xs text-muted-foreground">
                  {participantList.length}{t('Tools.ladder-game.people', '명')}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  {t('Tools.ladder-game.results', '결과 (한 줄에 하나, 선택사항)')}
                </Label>
                <Textarea
                  value={results}
                  onChange={(e) => setResults(e.target.value)}
                  placeholder={t('Tools.ladder-game.resultsPlaceholder', '당첨\n꽝\n커피\n청소')}
                  className="min-h-[100px] font-mono"
                  data-testid="input-results"
                />
              </div>

              <Button 
                onClick={generateLadder}
                className="w-full gap-2"
                disabled={participantList.length < 2 || participantList.length > 20}
                data-testid="button-generate"
              >
                <Play className="w-4 h-4" />
                {t('Tools.ladder-game.generate', '사다리 생성')}
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">{t('Tools.ladder-game.howToPlay', '게임 방법')}</h3>
              <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                <li>{t('Tools.ladder-game.rule1', '참가자 이름을 한 줄에 하나씩 입력합니다.')}</li>
                <li>{t('Tools.ladder-game.rule2', '결과를 입력하면 각 참가자가 도착하는 결과를 알 수 있습니다.')}</li>
                <li>{t('Tools.ladder-game.rule3', '사다리 생성 후 참가자 이름을 클릭하면 경로가 표시됩니다.')}</li>
                <li>{t('Tools.ladder-game.rule4', '모두 공개를 눌러 전체 결과를 확인할 수 있습니다.')}</li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Badge variant="outline" className="text-base px-3 py-1">
                {participantList.length}{t('Tools.ladder-game.people', '명')}
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
              {participantList.map((name, index) => (
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
                  width={Math.min(600, participantList.length * 80)}
                  height={350}
                  className="w-full"
                />
              </CardContent>
            </Card>

            <div className="flex justify-around flex-wrap gap-1">
              {participantList.map((_, positionIndex) => {
                let isRevealed = false;
                for (const pIndex of Array.from(revealedResults)) {
                  const result = calculatePath(pIndex);
                  if (result.endIndex === positionIndex) {
                    isRevealed = true;
                    break;
                  }
                }
                
                return (
                  <div
                    key={positionIndex}
                    className={`text-center p-2 rounded-md min-w-[60px] ${
                      isRevealed 
                        ? 'bg-primary/10 border border-primary' 
                        : 'bg-muted'
                    }`}
                  >
                    {isRevealed ? (
                      <span className="font-semibold text-primary text-sm">
                        {resultList[positionIndex] || `#${positionIndex + 1}`}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">?</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </FullscreenWrapper>
  );
}
