import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { FullscreenWrapper, useFullscreenContext } from './FullscreenWrapper';
import { playClick, playDrumroll, playExplosion, playFanfare } from '@/lib/sounds';
import { Swords, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SWORD_COLORS = [
  '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#84CC16', '#6366F1'
];

interface Sword {
  id: number;
  angle: number;
  inserted: boolean;
  color: string;
}

function BarrelContent() {
  const { t } = useTranslation();
  const { isFullscreen } = useFullscreenContext();

  const [participants, setParticipants] = useState<string[]>([]);
  const [newName, setNewName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [swords, setSwords] = useState<Sword[]>([]);
  const [triggerSword, setTriggerSword] = useState<number | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [loser, setLoser] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pirateJumped, setPirateJumped] = useState(false);

  const addParticipant = useCallback(() => {
    if (!newName.trim()) return;
    setParticipants([...participants, newName.trim()]);
    setNewName('');
    playClick();
  }, [newName, participants]);

  const removeParticipant = useCallback((index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
    playClick();
  }, [participants]);

  const startGame = useCallback(() => {
    if (participants.length < 2) return;
    
    const numSwords = 16 + Math.floor(Math.random() * 8);
    const newSwords: Sword[] = [];
    
    for (let i = 0; i < numSwords; i++) {
      newSwords.push({
        id: i,
        angle: (360 / numSwords) * i + (Math.random() * 10 - 5),
        inserted: false,
        color: SWORD_COLORS[i % SWORD_COLORS.length]
      });
    }
    
    const triggerIndex = Math.floor(Math.random() * numSwords);
    setTriggerSword(triggerIndex);
    setSwords(newSwords);
    setGameStarted(true);
    setCurrentPlayer(0);
    setLoser(null);
    setPirateJumped(false);
    playDrumroll();
  }, [participants]);

  const insertSword = useCallback((swordId: number) => {
    if (isAnimating || loser) return;
    
    const sword = swords.find(s => s.id === swordId);
    if (!sword || sword.inserted) return;
    
    setIsAnimating(true);
    playClick();
    
    setSwords(swords.map(s => 
      s.id === swordId ? { ...s, inserted: true } : s
    ));

    setTimeout(() => {
      if (swordId === triggerSword) {
        setPirateJumped(true);
        playExplosion();
        setTimeout(() => {
          setLoser(participants[currentPlayer]);
          playFanfare();
        }, 500);
      } else {
        setCurrentPlayer((currentPlayer + 1) % participants.length);
      }
      setIsAnimating(false);
    }, 300);
  }, [swords, triggerSword, participants, currentPlayer, isAnimating, loser]);

  const reset = useCallback(() => {
    setGameStarted(false);
    setSwords([]);
    setTriggerSword(null);
    setCurrentPlayer(0);
    setLoser(null);
    setPirateJumped(false);
  }, []);

  const barrelSize = isFullscreen ? 400 : 280;

  if (participants.length === 0 || !gameStarted) {
    return (
      <div className="space-y-6 max-w-md mx-auto">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto bg-amber-600 rounded-lg flex items-center justify-center">
            <Swords className="w-12 h-12 text-amber-100" />
          </div>
          <h3 className="text-xl font-semibold">{t('Tools.pirate-barrel.title', 'Pirate Barrel')}</h3>
          <p className="text-muted-foreground">
            {t('Tools.pirate-barrel.desc', 'Take turns inserting swords. Whoever makes the pirate jump loses!')}
          </p>
        </div>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t('Tools.pirate-barrel.namePlaceholder', 'Player name')}
                onKeyDown={(e) => e.key === 'Enter' && addParticipant()}
                data-testid="input-name"
              />
              <Button size="icon" onClick={addParticipant}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {participants.map((name, i) => (
                <Badge 
                  key={i}
                  variant="secondary"
                  className="gap-1 cursor-pointer"
                  onClick={() => removeParticipant(i)}
                >
                  {name}
                  <Trash2 className="w-3 h-3" />
                </Badge>
              ))}
            </div>

            <Button 
              className="w-full" 
              onClick={startGame}
              disabled={participants.length < 2}
              data-testid="button-start"
            >
              {t('Tools.pirate-barrel.start', 'Start Game')} ({participants.length} {t('Tools.pirate-barrel.players', 'players')})
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Badge variant="outline" className="text-lg px-4 py-2">
          {t('Tools.pirate-barrel.turn', "{{name}}'s Turn", { name: participants[currentPlayer] })}
        </Badge>
        <Button variant="outline" size="sm" onClick={reset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          {t('Tools.pirate-barrel.reset', 'New Game')}
        </Button>
      </div>

      <div className="flex justify-center">
        <div 
          className="relative"
          style={{ width: barrelSize, height: barrelSize }}
        >
          <div 
            className="absolute inset-[15%] rounded-lg overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #8B4513 0%, #5D2E0C 50%, #3D1E08 100%)',
              boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5), 0 10px 40px rgba(0,0,0,0.3)'
            }}
          >
            <div className="absolute inset-0 flex flex-col justify-around py-4">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className="h-2 bg-amber-900/50 mx-4 rounded"
                  style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)' }}
                />
              ))}
            </div>

            <AnimatePresence>
              {!pirateJumped && (
                <motion.div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center">
                    <span className="text-3xl">🏴‍☠️</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {pirateJumped && (
                <motion.div
                  className="absolute top-1/2 left-1/2 text-6xl"
                  initial={{ x: '-50%', y: '-50%' }}
                  animate={{ 
                    y: ['-50%', '-200%', '100%'],
                    x: ['-50%', '-50%', '-50%'],
                    rotate: [0, 360, 720]
                  }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                >
                  <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center">
                    <span className="text-3xl">😱</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {swords.map((sword) => {
            const radians = (sword.angle - 90) * (Math.PI / 180);
            const outerRadius = barrelSize / 2;
            const innerRadius = barrelSize * 0.35;
            const startX = outerRadius + Math.cos(radians) * outerRadius;
            const startY = outerRadius + Math.sin(radians) * outerRadius;
            const endX = outerRadius + Math.cos(radians) * (sword.inserted ? innerRadius * 0.6 : innerRadius);
            const endY = outerRadius + Math.sin(radians) * (sword.inserted ? innerRadius * 0.6 : innerRadius);
            
            return (
              <motion.button
                key={sword.id}
                className={`absolute cursor-pointer ${sword.inserted || loser ? 'pointer-events-none' : ''}`}
                style={{
                  left: startX - 15,
                  top: startY - 15,
                  transform: `rotate(${sword.angle}deg)`,
                  transformOrigin: 'center',
                  zIndex: sword.inserted ? 5 : 10
                }}
                onClick={() => insertSword(sword.id)}
                whileHover={!sword.inserted && !loser ? { scale: 1.2 } : {}}
                data-testid={`button-sword-${sword.id}`}
              >
                <motion.div
                  animate={{ 
                    x: sword.inserted ? (innerRadius - outerRadius + innerRadius * 0.4) : 0 
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <svg width="30" height="60" viewBox="0 0 30 60">
                    <rect x="13" y="0" width="4" height="40" fill={sword.color} rx="1" />
                    <rect x="8" y="38" width="14" height="6" fill="#4B5563" rx="1" />
                    <rect x="11" y="44" width="8" height="12" fill="#1F2937" rx="2" />
                  </svg>
                </motion.div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {loser && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center p-6 bg-destructive/10 rounded-xl border-2 border-destructive"
          >
            <div className="text-xl font-bold text-destructive" data-testid="text-loser">
              {t('Tools.pirate-barrel.loser', '{{name}} loses!', { name: loser })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PirateBarrelTool() {
  return (
    <FullscreenWrapper baseWidth={500} baseHeight={600}>
      <BarrelContent />
    </FullscreenWrapper>
  );
}
