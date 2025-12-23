import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FullscreenWrapper } from './FullscreenWrapper';
import { 
  Grid3X3, RotateCcw, Shuffle, Copy, Check, Sparkles, Trophy
} from 'lucide-react';

type GridSize = 3 | 4 | 5;

interface BingoCell {
  text: string;
  marked: boolean;
}

export default function BingoGeneratorTool() {
  const { t } = useTranslation();
  
  const [items, setItems] = useState('');
  const [gridSize, setGridSize] = useState<GridSize>(5);
  const [grid, setGrid] = useState<BingoCell[][]>([]);
  const [isGenerated, setIsGenerated] = useState(false);
  const [bingoLines, setBingoLines] = useState<number[][]>([]);
  const [copied, setCopied] = useState(false);

  const generateBingo = useCallback(() => {
    const itemList = items
      .split('\n')
      .map(i => i.trim())
      .filter(i => i);
    
    const requiredItems = gridSize * gridSize;
    
    if (itemList.length < requiredItems) {
      return;
    }

    const shuffled = [...itemList].sort(() => Math.random() - 0.5).slice(0, requiredItems);
    
    const newGrid: BingoCell[][] = [];
    for (let i = 0; i < gridSize; i++) {
      const row: BingoCell[] = [];
      for (let j = 0; j < gridSize; j++) {
        row.push({
          text: shuffled[i * gridSize + j],
          marked: false
        });
      }
      newGrid.push(row);
    }

    setGrid(newGrid);
    setIsGenerated(true);
    setBingoLines([]);
  }, [items, gridSize]);

  const toggleCell = (row: number, col: number) => {
    const newGrid = grid.map((r, ri) =>
      r.map((cell, ci) => 
        ri === row && ci === col ? { ...cell, marked: !cell.marked } : cell
      )
    );
    setGrid(newGrid);
    checkBingo(newGrid);
  };

  const checkBingo = (currentGrid: BingoCell[][]) => {
    const lines: number[][] = [];

    for (let i = 0; i < gridSize; i++) {
      if (currentGrid[i].every(cell => cell.marked)) {
        lines.push(currentGrid[i].map((_, j) => i * gridSize + j));
      }
    }

    for (let j = 0; j < gridSize; j++) {
      if (currentGrid.every(row => row[j].marked)) {
        lines.push(currentGrid.map((_, i) => i * gridSize + j));
      }
    }

    if (currentGrid.every((row, i) => row[i].marked)) {
      lines.push(currentGrid.map((_, i) => i * gridSize + i));
    }

    if (currentGrid.every((row, i) => row[gridSize - 1 - i].marked)) {
      lines.push(currentGrid.map((_, i) => i * gridSize + (gridSize - 1 - i)));
    }

    setBingoLines(lines);
  };

  const reset = () => {
    setIsGenerated(false);
    setGrid([]);
    setBingoLines([]);
  };

  const shuffle = () => {
    generateBingo();
  };

  const copyBoard = async () => {
    const boardText = grid.map(row => 
      row.map(cell => cell.text).join('\t')
    ).join('\n');
    
    try {
      await navigator.clipboard.writeText(boardText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const getCellIndex = (row: number, col: number) => row * gridSize + col;

  const isCellInBingoLine = (row: number, col: number) => {
    const index = getCellIndex(row, col);
    return bingoLines.some(line => line.includes(index));
  };

  const requiredItems = gridSize * gridSize;
  const currentItems = items.split('\n').filter(i => i.trim()).length;
  const canGenerate = currentItems >= requiredItems;

  return (
    <FullscreenWrapper>
      <div className="space-y-6">
        {!isGenerated ? (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('Tools.bingo-generator.items', '빙고 항목 (한 줄에 하나)')}</Label>
                <Textarea
                  value={items}
                  onChange={(e) => setItems(e.target.value)}
                  placeholder={t('Tools.bingo-generator.placeholder', '항목을 한 줄에 하나씩 입력하세요\n\n예시:\n사과\n바나나\n딸기\n수박\n...')}
                  className="min-h-[250px] font-mono"
                  data-testid="input-items"
                />
                <div className="flex items-center gap-2">
                  <Badge variant={canGenerate ? "default" : "destructive"}>
                    {currentItems} / {requiredItems} {t('Tools.bingo-generator.items', '항목')}
                  </Badge>
                  {!canGenerate && (
                    <span className="text-xs text-destructive">
                      {t('Tools.bingo-generator.needMore', '{{count}}개 더 필요합니다', { count: requiredItems - currentItems })}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>{t('Tools.bingo-generator.gridSize', '빙고판 크기')}</Label>
                <div className="flex gap-2">
                  {([3, 4, 5] as GridSize[]).map(size => (
                    <Button
                      key={size}
                      variant={gridSize === size ? "default" : "outline"}
                      onClick={() => setGridSize(size)}
                      data-testid={`button-size-${size}`}
                    >
                      {size}x{size}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={generateBingo}
                className="w-full gap-2"
                disabled={!canGenerate}
                data-testid="button-generate"
              >
                <Grid3X3 className="w-4 h-4" />
                {t('Tools.bingo-generator.generate', '빙고판 생성')}
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {t('Tools.bingo-generator.howToUse', '사용 방법')}
              </h3>
              <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                <li>{t('Tools.bingo-generator.step1', '빙고판에 들어갈 항목들을 한 줄에 하나씩 입력합니다.')}</li>
                <li>{t('Tools.bingo-generator.step2', '빙고판 크기를 선택합니다 (3x3, 4x4, 5x5).')}</li>
                <li>{t('Tools.bingo-generator.step3', '빙고판이 생성되면 항목을 클릭해서 표시합니다.')}</li>
                <li>{t('Tools.bingo-generator.step4', '가로, 세로, 대각선으로 한 줄이 완성되면 빙고!')}</li>
              </ol>

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">{t('Tools.bingo-generator.ideas', '빙고 아이디어')}</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• {t('Tools.bingo-generator.idea1', '방송 빙고: 시청자가 해야 할 일들')}</li>
                  <li>• {t('Tools.bingo-generator.idea2', '여행 빙고: 여행 중 해볼 것들')}</li>
                  <li>• {t('Tools.bingo-generator.idea3', '회의 빙고: 회의 중 자주 나오는 말')}</li>
                  <li>• {t('Tools.bingo-generator.idea4', '연말 빙고: 올해 하고 싶은 일들')}</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {bingoLines.length > 0 && (
                  <Badge className="gap-1 bg-green-500">
                    <Trophy className="w-3 h-3" />
                    {bingoLines.length} {t('Tools.bingo-generator.bingo', '빙고!')}
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyBoard}
                  className="gap-1"
                  data-testid="button-copy"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? t('Common.actions.copied', '복사됨') : t('Common.actions.copy', '복사')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shuffle}
                  className="gap-1"
                  data-testid="button-shuffle"
                >
                  <Shuffle className="w-4 h-4" />
                  {t('Tools.bingo-generator.shuffle', '섞기')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={reset}
                  className="gap-1"
                  data-testid="button-reset"
                >
                  <RotateCcw className="w-4 h-4" />
                  {t('Tools.bingo-generator.reset', '다시')}
                </Button>
              </div>
            </div>

            <div className="flex justify-center">
              <div 
                className="grid gap-2"
                style={{ 
                  gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                  maxWidth: `${gridSize * 100}px`
                }}
              >
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <Button
                      key={`${rowIndex}-${colIndex}`}
                      variant="outline"
                      className={`
                        aspect-square h-auto min-h-[60px] md:min-h-[80px] p-1 text-xs md:text-sm font-medium
                        overflow-hidden break-all leading-tight
                        ${cell.marked ? 'bg-primary text-primary-foreground' : ''}
                        ${isCellInBingoLine(rowIndex, colIndex) ? 'ring-2 ring-green-500 ring-offset-2' : ''}
                      `}
                      onClick={() => toggleCell(rowIndex, colIndex)}
                      data-testid={`cell-${rowIndex}-${colIndex}`}
                    >
                      {cell.text}
                    </Button>
                  ))
                )}
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              {t('Tools.bingo-generator.clickToMark', '클릭하여 표시하세요')}
            </p>
          </div>
        )}
      </div>
    </FullscreenWrapper>
  );
}
