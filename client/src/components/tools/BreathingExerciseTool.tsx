import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Play, Pause } from 'lucide-react';

type BreathingPattern = {
  name: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
};

const PATTERNS: Record<string, BreathingPattern> = {
  relaxed: { name: 'relaxed', inhale: 4, hold1: 0, exhale: 4, hold2: 0 },
  box: { name: 'box', inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
  '478': { name: '478', inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
  calm: { name: 'calm', inhale: 4, hold1: 2, exhale: 6, hold2: 0 },
};

type Phase = 'inhale' | 'hold1' | 'exhale' | 'hold2';

export default function BreathingExerciseTool() {
  const { t } = useTranslation();
  const [pattern, setPattern] = useState<string>('box');
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [counter, setCounter] = useState(0);
  const [cycles, setCycles] = useState(0);

  const currentPattern = PATTERNS[pattern];

  const getPhaseLabel = (p: Phase) => {
    switch (p) {
      case 'inhale': return t('Tools.breathing-exercise.inhale', 'Breathe In');
      case 'hold1': return t('Tools.breathing-exercise.hold', 'Hold');
      case 'exhale': return t('Tools.breathing-exercise.exhale', 'Breathe Out');
      case 'hold2': return t('Tools.breathing-exercise.hold', 'Hold');
    }
  };

  const getNextPhase = useCallback((current: Phase): Phase => {
    const phases: Phase[] = ['inhale', 'hold1', 'exhale', 'hold2'];
    const durations = [currentPattern.inhale, currentPattern.hold1, currentPattern.exhale, currentPattern.hold2];
    let idx = phases.indexOf(current);
    do {
      idx = (idx + 1) % 4;
    } while (durations[idx] === 0);
    return phases[idx];
  }, [currentPattern]);

  useEffect(() => {
    if (!isRunning) return;

    const durations: Record<Phase, number> = {
      inhale: currentPattern.inhale,
      hold1: currentPattern.hold1,
      exhale: currentPattern.exhale,
      hold2: currentPattern.hold2,
    };

    if (counter >= durations[phase]) {
      const nextPhase = getNextPhase(phase);
      if (nextPhase === 'inhale' && phase !== 'inhale') {
        setCycles(c => c + 1);
      }
      setPhase(nextPhase);
      setCounter(0);
    } else {
      const timer = setTimeout(() => setCounter(c => c + 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [isRunning, counter, phase, currentPattern, getNextPhase]);

  const toggleExercise = () => {
    if (isRunning) {
      setIsRunning(false);
    } else {
      setIsRunning(true);
      setPhase('inhale');
      setCounter(0);
    }
  };

  const getScale = () => {
    if (!isRunning) return 1;
    if (phase === 'inhale') return 1 + (counter / currentPattern.inhale) * 0.3;
    if (phase === 'exhale') return 1.3 - (counter / currentPattern.exhale) * 0.3;
    return phase === 'hold1' ? 1.3 : 1;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-6">
            <div className="space-y-2 w-full max-w-xs">
              <Label>{t('Tools.breathing-exercise.pattern', 'Breathing Pattern')}</Label>
              <Select value={pattern} onValueChange={setPattern} disabled={isRunning}>
                <SelectTrigger data-testid="select-pattern">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relaxed">{t('Tools.breathing-exercise.relaxed', 'Relaxed (4-4)')}</SelectItem>
                  <SelectItem value="box">{t('Tools.breathing-exercise.box', 'Box (4-4-4-4)')}</SelectItem>
                  <SelectItem value="478">{t('Tools.breathing-exercise.478', '4-7-8 Technique')}</SelectItem>
                  <SelectItem value="calm">{t('Tools.breathing-exercise.calm', 'Calming (4-2-6)')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div 
              className="relative w-64 h-64 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center transition-transform duration-1000 ease-in-out"
              style={{ transform: `scale(${getScale()})` }}
            >
              <div className="text-center text-white">
                <div className="text-3xl font-bold" data-testid="phase-display">
                  {isRunning ? getPhaseLabel(phase) : t('Tools.breathing-exercise.ready', 'Ready')}
                </div>
                {isRunning && (
                  <div className="text-6xl font-light mt-2">
                    {Math.max(0, (phase === 'inhale' ? currentPattern.inhale : phase === 'hold1' ? currentPattern.hold1 : phase === 'exhale' ? currentPattern.exhale : currentPattern.hold2) - counter)}
                  </div>
                )}
              </div>
            </div>

            <Button size="lg" onClick={toggleExercise} data-testid="button-toggle">
              {isRunning ? (
                <><Pause className="mr-2 h-5 w-5" />{t('Tools.breathing-exercise.stop', 'Stop')}</>
              ) : (
                <><Play className="mr-2 h-5 w-5" />{t('Tools.breathing-exercise.start', 'Start')}</>
              )}
            </Button>

            <div className="text-center text-muted-foreground">
              {t('Tools.breathing-exercise.cycles', 'Cycles completed')}: <span className="font-bold">{cycles}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
