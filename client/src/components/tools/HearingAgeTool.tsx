import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FullscreenWrapper } from './FullscreenWrapper';
import { playClick } from '@/lib/sounds';
import { Volume2, VolumeX, Play, RotateCcw, Ear } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FrequencyTest {
  frequency: number;
  ageRange: string;
  label: string;
  color: string;
}

const FREQUENCY_TESTS: FrequencyTest[] = [
  { frequency: 8000, ageRange: '60+', label: '8,000 Hz', color: '#22C55E' },
  { frequency: 10000, ageRange: '50-59', label: '10,000 Hz', color: '#84CC16' },
  { frequency: 12000, ageRange: '40-49', label: '12,000 Hz', color: '#EAB308' },
  { frequency: 14000, ageRange: '30-39', label: '14,000 Hz', color: '#F97316' },
  { frequency: 15000, ageRange: '25-29', label: '15,000 Hz', color: '#EF4444' },
  { frequency: 16000, ageRange: '20-24', label: '16,000 Hz', color: '#EC4899' },
  { frequency: 17000, ageRange: '18-19', label: '17,000 Hz', color: '#A855F7' },
  { frequency: 18000, ageRange: 'Under 18', label: '18,000 Hz', color: '#8B5CF6' },
];

export default function HearingAgeTool() {
  const { t } = useTranslation();
  const [testStarted, setTestStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [testComplete, setTestComplete] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const startTest = useCallback(() => {
    setTestStarted(true);
    setCurrentIndex(0);
    setResults([]);
    setTestComplete(false);
    playClick();
  }, []);

  const playFrequency = useCallback((frequency: number) => {
    if (isPlaying) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.1);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 2.9);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 3);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillatorRef.current = oscillator;
    gainRef.current = gain;

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 3);

    setIsPlaying(true);
    
    oscillator.onended = () => {
      setIsPlaying(false);
    };
  }, [isPlaying, volume]);

  const stopSound = useCallback(() => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
      } catch (e) {}
      oscillatorRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const handleResponse = useCallback((canHear: boolean) => {
    stopSound();
    const newResults = [...results, canHear];
    setResults(newResults);

    if (currentIndex < FREQUENCY_TESTS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setTestComplete(true);
    }
    playClick();
  }, [results, currentIndex, stopSound]);

  const getHearingAge = useCallback((): { age: string; color: string } => {
    let lastHeardIndex = -1;
    for (let i = results.length - 1; i >= 0; i--) {
      if (results[i]) {
        lastHeardIndex = i;
        break;
      }
    }

    if (lastHeardIndex === -1) {
      return { age: '60+', color: '#22C55E' };
    }

    const test = FREQUENCY_TESTS[lastHeardIndex];
    return { age: test.ageRange, color: test.color };
  }, [results]);

  const reset = useCallback(() => {
    stopSound();
    setTestStarted(false);
    setCurrentIndex(0);
    setResults([]);
    setTestComplete(false);
  }, [stopSound]);

  const progress = ((currentIndex + (testComplete ? 1 : 0)) / FREQUENCY_TESTS.length) * 100;
  const currentTest = FREQUENCY_TESTS[currentIndex];

  if (!testStarted) {
    return (
      <FullscreenWrapper baseWidth={500} baseHeight={500}>
        <div className="space-y-6 max-w-md mx-auto text-center">
          <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Ear className="w-12 h-12 text-primary" />
          </div>

          <h2 className="text-2xl font-bold">{t('Tools.hearing-age.title', 'Hearing Age Test')}</h2>
          <p className="text-muted-foreground">
            {t('Tools.hearing-age.desc', 'Test your hearing by playing high-frequency sounds. As we age, we lose the ability to hear higher frequencies.')}
          </p>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t('Tools.hearing-age.volume', 'Volume')}</span>
                  <span className="text-sm text-muted-foreground">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="p-4 bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400 text-sm">
                {t('Tools.hearing-age.warning', 'Use headphones for accurate results. Start with low volume.')}
              </div>

              <Button onClick={startTest} className="w-full gap-2" size="lg" data-testid="button-start">
                <Play className="w-5 h-5" />
                {t('Tools.hearing-age.start', 'Start Test')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </FullscreenWrapper>
    );
  }

  if (testComplete) {
    const { age, color } = getHearingAge();

    return (
      <FullscreenWrapper baseWidth={500} baseHeight={500}>
        <div className="space-y-6 max-w-md mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-32 h-32 mx-auto rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${color}20`, border: `4px solid ${color}` }}
          >
            <Ear className="w-16 h-16" style={{ color }} />
          </motion.div>

          <h2 className="text-2xl font-bold">{t('Tools.hearing-age.result', 'Your Hearing Age')}</h2>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold"
            style={{ color }}
            data-testid="text-result"
          >
            {age}
          </motion.div>

          <div className="grid grid-cols-4 gap-2">
            {results.map((canHear, i) => (
              <div 
                key={i}
                className={`p-2 rounded text-xs ${canHear ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}
              >
                {FREQUENCY_TESTS[i].label}
                <div className="text-lg">{canHear ? '✓' : '✗'}</div>
              </div>
            ))}
          </div>

          <Button onClick={reset} variant="outline" className="gap-2" data-testid="button-reset">
            <RotateCcw className="w-4 h-4" />
            {t('Tools.hearing-age.retry', 'Try Again')}
          </Button>
        </div>
      </FullscreenWrapper>
    );
  }

  return (
    <FullscreenWrapper baseWidth={500} baseHeight={500}>
      <div className="space-y-6 max-w-md mx-auto">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-base">
            {currentIndex + 1} / {FREQUENCY_TESTS.length}
          </Badge>
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        <Progress value={progress} className="h-2" />

        <Card>
          <CardContent className="p-8 text-center space-y-6">
            <div 
              className="w-24 h-24 mx-auto rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${currentTest.color}20` }}
            >
              <motion.div
                animate={isPlaying ? { scale: [1, 1.2, 1] } : {}}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                <Volume2 className="w-12 h-12" style={{ color: currentTest.color }} />
              </motion.div>
            </div>

            <div>
              <h3 className="text-2xl font-bold" style={{ color: currentTest.color }}>
                {currentTest.label}
              </h3>
              <p className="text-muted-foreground">
                {t('Tools.hearing-age.typical', 'Typically heard by ages')} {currentTest.ageRange}
              </p>
            </div>

            {!isPlaying ? (
              <Button 
                onClick={() => playFrequency(currentTest.frequency)} 
                size="lg"
                className="gap-2"
                data-testid="button-play"
              >
                <Volume2 className="w-5 h-5" />
                {t('Tools.hearing-age.playSound', 'Play Sound')}
              </Button>
            ) : (
              <Button 
                onClick={stopSound} 
                size="lg"
                variant="destructive"
                className="gap-2"
                data-testid="button-stop"
              >
                <VolumeX className="w-5 h-5" />
                {t('Tools.hearing-age.stop', 'Stop')}
              </Button>
            )}

            <div className="flex gap-4 justify-center pt-4">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => handleResponse(false)}
                className="flex-1 gap-2"
                data-testid="button-no"
              >
                <VolumeX className="w-5 h-5" />
                {t('Tools.hearing-age.cantHear', "Can't Hear")}
              </Button>
              <Button 
                size="lg"
                onClick={() => handleResponse(true)}
                className="flex-1 gap-2"
                data-testid="button-yes"
              >
                <Volume2 className="w-5 h-5" />
                {t('Tools.hearing-age.canHear', 'I Hear It!')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </FullscreenWrapper>
  );
}
