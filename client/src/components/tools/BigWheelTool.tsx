import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FullscreenWrapper, useFullscreenContext } from './FullscreenWrapper';
import { playDrumroll, playFanfare, playClick } from '@/lib/sounds';
import { RotateCw, Plus, Trash2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = [
  '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6',
  '#EF4444', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  '#A855F7', '#14B8A6', '#F43F5E', '#22C55E', '#0EA5E9',
];

interface WheelItem {
  text: string;
  color: string;
}

function WheelContent() {
  const { t } = useTranslation();
  const { isFullscreen, scale } = useFullscreenContext();
  
  const [items, setItems] = useState<WheelItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  const addItem = useCallback(() => {
    if (!inputText.trim()) return;
    const newItem: WheelItem = {
      text: inputText.trim(),
      color: COLORS[items.length % COLORS.length]
    };
    setItems([...items, newItem]);
    setInputText('');
    playClick();
  }, [inputText, items]);

  const removeItem = useCallback((index: number) => {
    setItems(items.filter((_, i) => i !== index));
    playClick();
  }, [items]);

  const parseBulk = useCallback((text: string) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    const newItems: WheelItem[] = lines.map((line, i) => ({
      text: line,
      color: COLORS[(items.length + i) % COLORS.length]
    }));
    setItems([...items, ...newItems]);
  }, [items]);

  const spin = useCallback(() => {
    if (isSpinning || items.length < 2) return;
    
    setIsSpinning(true);
    setWinner(null);
    setShowConfetti(false);
    playDrumroll();
    
    const spins = 8 + Math.random() * 7;
    const targetRotation = rotation + spins * 360 + Math.random() * 360;
    
    const duration = 5000;
    const startTime = Date.now();
    const startRotation = rotation;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const currentRotation = startRotation + (targetRotation - startRotation) * eased;
      
      setRotation(currentRotation);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const normalizedRotation = ((currentRotation % 360) + 360) % 360;
        const sliceAngle = 360 / items.length;
        const pointerAngle = 270;
        const pointerOnWheel = (pointerAngle - normalizedRotation + 360) % 360;
        const shiftedAngle = (pointerOnWheel + 90) % 360;
        const winnerIndex = Math.min(Math.floor((shiftedAngle + 0.0001) / sliceAngle), items.length - 1);
        setWinner(items[winnerIndex].text);
        setShowConfetti(true);
        playFanfare();
        setTimeout(() => setShowConfetti(false), 3000);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isSpinning, items, rotation]);

  const sliceAngle = items.length > 0 ? 360 / items.length : 360;
  const wheelSize = isFullscreen ? 500 : 350;

  if (items.length === 0) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center space-y-4">
          <Sparkles className="w-16 h-16 mx-auto text-primary opacity-50" />
          <h3 className="text-xl font-semibold">{t('Tools.big-wheel.setupTitle', 'Setup Your Wheel')}</h3>
          <p className="text-muted-foreground">
            {t('Tools.big-wheel.setupDesc', 'Add items to spin the wheel!')}
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex gap-2">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t('Tools.big-wheel.itemPlaceholder', 'Enter item name')}
                onKeyDown={(e) => e.key === 'Enter' && addItem()}
                data-testid="input-item"
              />
              <Button onClick={addItem} data-testid="button-add">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label>{t('Tools.big-wheel.bulkAdd', 'Bulk Add (one per line)')}</Label>
              <Textarea
                placeholder={t('Tools.big-wheel.bulkPlaceholder', 'Pizza\nBurger\nSushi\nTacos')}
                rows={4}
                onBlur={(e) => {
                  if (e.target.value) {
                    parseBulk(e.target.value);
                    e.target.value = '';
                  }
                }}
                data-testid="input-bulk"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`grid ${isFullscreen ? '' : 'md:grid-cols-[1fr_auto]'} gap-6`}>
        {!isFullscreen && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex gap-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t('Tools.big-wheel.itemPlaceholder', 'Add item')}
                  onKeyDown={(e) => e.key === 'Enter' && addItem()}
                  data-testid="input-item"
                />
                <Button size="icon" onClick={addItem}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {items.map((item, i) => (
                  <Badge 
                    key={i} 
                    style={{ backgroundColor: item.color }}
                    className="text-white gap-1 cursor-pointer"
                    onClick={() => removeItem(i)}
                  >
                    {item.text}
                    <Trash2 className="w-3 h-3" />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div 
              className="absolute -top-4 left-1/2 -translate-x-1/2 z-10"
              style={{
                width: 0,
                height: 0,
                borderLeft: '20px solid transparent',
                borderRight: '20px solid transparent',
                borderTop: '40px solid hsl(var(--primary))',
                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'
              }}
            />
            
            <motion.div 
              ref={wheelRef}
              className="relative rounded-full overflow-hidden"
              style={{ 
                width: wheelSize,
                height: wheelSize,
                boxShadow: '0 0 40px rgba(139, 92, 246, 0.3), inset 0 0 20px rgba(0,0,0,0.2)'
              }}
              animate={{ rotate: rotation }}
              transition={{ duration: 0, ease: 'linear' }}
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
                  const textX = 50 + 35 * Math.cos(midRad);
                  const textY = 50 + 35 * Math.sin(midRad);
                  const displayText = item.text.length > 10 ? item.text.substring(0, 10) + '..' : item.text;
                  
                  return (
                    <g key={i}>
                      <defs>
                        <linearGradient id={`grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={item.color} stopOpacity="1" />
                          <stop offset="100%" stopColor={item.color} stopOpacity="0.7" />
                        </linearGradient>
                      </defs>
                      <path
                        d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={`url(#grad-${i})`}
                        stroke="#fff"
                        strokeWidth="0.5"
                      />
                      <text
                        x={textX}
                        y={textY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#fff"
                        fontSize={items.length > 10 ? "3" : "4"}
                        fontWeight="bold"
                        transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                      >
                        {displayText}
                      </text>
                    </g>
                  );
                })}
                <circle cx="50" cy="50" r="10" fill="#fff" stroke="hsl(var(--primary))" strokeWidth="2" />
                <circle cx="50" cy="50" r="6" fill="hsl(var(--primary))" />
              </svg>
            </motion.div>
          </div>

          <Button 
            size="lg" 
            onClick={spin} 
            disabled={isSpinning || items.length < 2}
            className="gap-2 text-lg px-8"
            data-testid="button-spin"
          >
            <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
            {isSpinning 
              ? t('Tools.big-wheel.spinning', 'Spinning...') 
              : t('Tools.big-wheel.spin', 'SPIN!')}
          </Button>

          <AnimatePresence>
            {winner && (
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="text-center p-6 bg-primary/10 rounded-xl border-2 border-primary"
              >
                <div className="text-sm text-muted-foreground mb-2">
                  {t('Tools.big-wheel.winner', 'Winner!')}
                </div>
                <div className="text-3xl font-bold text-primary" data-testid="text-winner">
                  {winner}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: COLORS[i % COLORS.length],
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
              }}
              initial={{ y: -20, opacity: 1, rotate: 0 }}
              animate={{ 
                y: window.innerHeight + 20, 
                opacity: 0,
                rotate: Math.random() * 720 - 360
              }}
              transition={{ 
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: 'easeOut'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BigWheelTool() {
  return (
    <FullscreenWrapper baseWidth={600} baseHeight={700}>
      <WheelContent />
    </FullscreenWrapper>
  );
}
