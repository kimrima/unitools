import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RotateCw } from 'lucide-react';

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
];

export default function WheelSpinnerTool() {
  const { t } = useTranslation();
  const [items, setItems] = useState<string[]>(['Option 1', 'Option 2', 'Option 3', 'Option 4']);
  const [inputText, setInputText] = useState('Option 1\nOption 2\nOption 3\nOption 4');
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const updateItems = useCallback((text: string) => {
    setInputText(text);
    const newItems = text.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    setItems(newItems.length > 0 ? newItems : ['Option 1']);
  }, []);

  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || items.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;
    const sliceAngle = (2 * Math.PI) / items.length;
    
    ctx.clearRect(0, 0, size, size);
    
    items.forEach((item, i) => {
      const startAngle = i * sliceAngle + (rotation * Math.PI / 180);
      const endAngle = startAngle + sliceAngle;
      
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 3;
      const text = item.length > 12 ? item.substring(0, 12) + '...' : item;
      ctx.fillText(text, radius - 20, 5);
      ctx.restore();
    });
    
    ctx.beginPath();
    ctx.arc(center, center, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [items, rotation]);

  const spin = useCallback(() => {
    if (isSpinning || items.length === 0) return;
    
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
        const pointerAngle = (360 - normalizedRotation + 90) % 360;
        const winnerIndex = Math.floor(pointerAngle / sliceAngle) % items.length;
        setWinner(items[winnerIndex]);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isSpinning, items, rotation]);

  useState(() => {
    drawWheel();
  });

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
                  placeholder="Enter options, one per line"
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
                  className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 w-0 h-0"
                  style={{
                    borderLeft: '12px solid transparent',
                    borderRight: '12px solid transparent',
                    borderTop: '24px solid #333',
                  }}
                />
                <canvas
                  ref={canvasRef}
                  width={280}
                  height={280}
                  className="rounded-full"
                  style={{ transform: `rotate(${rotation}deg)` }}
                  data-testid="wheel-canvas"
                />
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
