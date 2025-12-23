import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RotateCw } from 'lucide-react';

const COLORS = [
  '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6',
  '#EF4444', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

export default function WheelSpinnerTool() {
  const { t } = useTranslation();
  const [items, setItems] = useState<string[]>(['Option 1', 'Option 2', 'Option 3', 'Option 4']);
  const [inputText, setInputText] = useState('Option 1\nOption 2\nOption 3\nOption 4');
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  const updateItems = useCallback((text: string) => {
    setInputText(text);
    const newItems = text.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    setItems(newItems.length > 0 ? newItems : ['Option 1']);
  }, []);

  const spin = useCallback(() => {
    if (isSpinning || items.length < 2) return;
    
    setIsSpinning(true);
    setWinner(null);
    
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
        const sliceAngle = 360 / items.length;
        const adjustedAngle = (360 - normalizedRotation) % 360;
        const winnerIndex = Math.floor(adjustedAngle / sliceAngle) % items.length;
        setWinner(items[winnerIndex]);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isSpinning, items, rotation]);

  const sliceAngle = 360 / items.length;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('Tools.wheel-spinner.items', 'Items (one per line)')}</Label>
                <Textarea
                  value={inputText}
                  onChange={(e) => updateItems(e.target.value)}
                  placeholder={t('Tools.wheel-spinner.itemsPlaceholder', 'Enter options, one per line')}
                  rows={8}
                  data-testid="input-items"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {t('Tools.wheel-spinner.itemCount', '{{count}} items', { count: items.length })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
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
                    {items.map((item, i) => {
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
                      const displayText = item.length > 8 ? item.substring(0, 8) + '..' : item;
                      
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
                disabled={isSpinning || items.length < 2}
                data-testid="button-spin"
              >
                <RotateCw className={`mr-2 h-5 w-5 ${isSpinning ? 'animate-spin' : ''}`} />
                {isSpinning 
                  ? t('Tools.wheel-spinner.spinning', 'Spinning...') 
                  : t('Tools.wheel-spinner.spin', 'Spin the Wheel')}
              </Button>

              {winner && (
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">
                    {t('Tools.wheel-spinner.winner', 'Winner')}
                  </div>
                  <div className="text-2xl font-bold" data-testid="winner-display">
                    {winner}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
