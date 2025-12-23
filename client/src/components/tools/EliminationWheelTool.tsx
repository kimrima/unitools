import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RotateCw, Trophy, RotateCcw, Skull } from 'lucide-react';

const COLORS = [
  '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6',
  '#EF4444', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

export default function EliminationWheelTool() {
  const { t } = useTranslation();
  const [allItems, setAllItems] = useState<string[]>(['Person 1', 'Person 2', 'Person 3', 'Person 4', 'Person 5']);
  const [remainingItems, setRemainingItems] = useState<string[]>([]);
  const [eliminatedItems, setEliminatedItems] = useState<string[]>([]);
  const [inputText, setInputText] = useState('Person 1\nPerson 2\nPerson 3\nPerson 4\nPerson 5');
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [currentEliminated, setCurrentEliminated] = useState<string | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  const updateItems = useCallback((text: string) => {
    setInputText(text);
    const newItems = text.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    setAllItems(newItems.length > 0 ? newItems : ['Person 1']);
  }, []);

  const startGame = useCallback(() => {
    setIsStarted(true);
    setRemainingItems([...allItems]);
    setEliminatedItems([]);
    setCurrentEliminated(null);
    setWinner(null);
    setRotation(0);
  }, [allItems]);

  const resetGame = useCallback(() => {
    setIsStarted(false);
    setRemainingItems([]);
    setEliminatedItems([]);
    setCurrentEliminated(null);
    setWinner(null);
    setRotation(0);
  }, []);

  const spin = useCallback(() => {
    if (isSpinning || remainingItems.length < 2) return;
    
    setIsSpinning(true);
    setCurrentEliminated(null);
    
    const spins = 5 + Math.random() * 5;
    const targetRotation = rotation + spins * 360 + Math.random() * 360;
    
    const duration = 4000;
    const startTime = Date.now();
    const startRotation = rotation;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentRotation = startRotation + (targetRotation - startRotation) * eased;
      
      setRotation(currentRotation);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const normalizedRotation = ((currentRotation % 360) + 360) % 360;
        const sliceAngle = 360 / remainingItems.length;
        const adjustedAngle = (360 - normalizedRotation) % 360;
        const eliminatedIndex = Math.floor(adjustedAngle / sliceAngle) % remainingItems.length;
        const eliminated = remainingItems[eliminatedIndex];
        
        setCurrentEliminated(eliminated);
        setEliminatedItems(prev => [...prev, eliminated]);
        
        const newRemaining = remainingItems.filter((_, i) => i !== eliminatedIndex);
        setRemainingItems(newRemaining);
        
        if (newRemaining.length === 1) {
          setWinner(newRemaining[0]);
        }
      }
    };
    
    requestAnimationFrame(animate);
  }, [isSpinning, remainingItems, rotation]);

  const sliceAngle = remainingItems.length > 0 ? 360 / remainingItems.length : 360;

  return (
    <div className="space-y-6">
      {!isStarted ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('Tools.elimination-wheel.participants', 'Participants (one per line)')}</Label>
                <Textarea
                  value={inputText}
                  onChange={(e) => updateItems(e.target.value)}
                  placeholder="Enter names, one per line"
                  rows={8}
                  data-testid="input-participants"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {t('Tools.elimination-wheel.participantCount', '{{count}} participants', { count: allItems.length })}
              </p>
              <Button 
                size="lg" 
                onClick={startGame} 
                disabled={allItems.length < 2}
                className="w-full"
                data-testid="button-start"
              >
                {t('Tools.elimination-wheel.startGame', 'Start Elimination Game')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                {winner ? (
                  <div className="text-center p-8 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl w-full">
                    <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <div className="text-sm text-muted-foreground mb-2">
                      {t('Tools.elimination-wheel.winner', 'Winner!')}
                    </div>
                    <div className="text-3xl font-bold" data-testid="winner-display">
                      {winner}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <div 
                        className="absolute -top-2 left-1/2 -translate-x-1/2 z-10"
                        style={{
                          width: 0,
                          height: 0,
                          borderLeft: '15px solid transparent',
                          borderRight: '15px solid transparent',
                          borderTop: '30px solid #333',
                        }}
                      />
                      <div 
                        ref={wheelRef}
                        className="relative w-72 h-72 rounded-full overflow-hidden shadow-lg"
                        style={{ 
                          transform: `rotate(${rotation}deg)`,
                          transition: isSpinning ? 'none' : 'transform 0.1s ease-out'
                        }}
                        data-testid="wheel-display"
                      >
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          {remainingItems.map((item, i) => {
                            const startAngle = i * sliceAngle - 90;
                            const endAngle = startAngle + sliceAngle;
                            const startRad = (startAngle * Math.PI) / 180;
                            const endRad = (endAngle * Math.PI) / 180;
                            const x1 = 50 + 50 * Math.cos(startRad);
                            const y1 = 50 + 50 * Math.sin(startRad);
                            const x2 = 50 + 50 * Math.cos(endRad);
                            const y2 = 50 + 50 * Math.sin(endRad);
                            const largeArc = sliceAngle > 180 ? 1 : 0;
                            
                            const midAngle = startAngle + sliceAngle / 2;
                            const midRad = (midAngle * Math.PI) / 180;
                            const textX = 50 + 32 * Math.cos(midRad);
                            const textY = 50 + 32 * Math.sin(midRad);
                            const displayText = item.length > 6 ? item.substring(0, 6) + '..' : item;
                            
                            return (
                              <g key={i}>
                                <path
                                  d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                  fill={COLORS[i % COLORS.length]}
                                  stroke="#fff"
                                  strokeWidth="0.5"
                                />
                                <text
                                  x={textX}
                                  y={textY}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  fill="#fff"
                                  fontSize="4"
                                  fontWeight="bold"
                                  transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                                >
                                  {displayText}
                                </text>
                              </g>
                            );
                          })}
                          <circle cx="50" cy="50" r="8" fill="#fff" stroke="#333" strokeWidth="1" />
                        </svg>
                      </div>
                    </div>

                    <Button 
                      size="lg" 
                      onClick={spin} 
                      disabled={isSpinning || remainingItems.length < 2}
                      variant="destructive"
                      data-testid="button-spin"
                    >
                      <Skull className={`mr-2 h-5 w-5 ${isSpinning ? 'animate-bounce' : ''}`} />
                      {isSpinning 
                        ? t('Tools.elimination-wheel.spinning', 'Spinning...') 
                        : t('Tools.elimination-wheel.eliminate', 'Eliminate!')}
                    </Button>
                  </>
                )}

                {currentEliminated && !winner && (
                  <div className="text-center p-4 bg-red-500/10 border border-red-500/30 rounded-lg w-full">
                    <div className="text-sm text-red-500 mb-1">
                      {t('Tools.elimination-wheel.eliminated', 'Eliminated!')}
                    </div>
                    <div className="text-xl font-bold text-red-500" data-testid="eliminated-display">
                      {currentEliminated}
                    </div>
                  </div>
                )}

                <Button variant="outline" onClick={resetGame} data-testid="button-reset">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {t('Tools.elimination-wheel.restart', 'Restart')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="font-medium">
                      {t('Tools.elimination-wheel.remaining', 'Remaining')} ({remainingItems.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {remainingItems.map((item, i) => (
                      <Badge key={i} variant="outline" className="text-sm">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Skull className="w-4 h-4 text-red-500" />
                    <span className="font-medium text-red-500">
                      {t('Tools.elimination-wheel.eliminatedList', 'Eliminated')} ({eliminatedItems.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {eliminatedItems.map((item, i) => (
                      <Badge key={i} variant="secondary" className="text-sm line-through opacity-60">
                        {i + 1}. {item}
                      </Badge>
                    ))}
                    {eliminatedItems.length === 0 && (
                      <span className="text-sm text-muted-foreground">
                        {t('Tools.elimination-wheel.noOneYet', 'No one eliminated yet')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm font-medium mb-2">
                    {t('Tools.elimination-wheel.howToPlay', 'How to Play')}
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>{t('Tools.elimination-wheel.rule1', '1. Spin the wheel to eliminate one person')}</li>
                    <li>{t('Tools.elimination-wheel.rule2', '2. The eliminated person is removed from the wheel')}</li>
                    <li>{t('Tools.elimination-wheel.rule3', '3. Continue until only one person remains')}</li>
                    <li>{t('Tools.elimination-wheel.rule4', '4. The last person standing is the winner!')}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
