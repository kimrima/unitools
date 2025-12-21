import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Play, Pause, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MetronomeTool() {
  const { t } = useTranslation();
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beat, setBeat] = useState(0);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);
  const nextBeatTimeRef = useRef(0);

  const playClick = (isAccent: boolean) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = isAccent ? 1000 : 800;

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  };

  const startMetronome = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const ctx = audioContextRef.current;
    nextBeatTimeRef.current = ctx.currentTime;

    const scheduleBeats = () => {
      while (nextBeatTimeRef.current < ctx.currentTime + 0.1) {
        setBeat(prev => {
          const newBeat = (prev % beatsPerMeasure) + 1;
          playClick(newBeat === 1);
          return newBeat;
        });
        nextBeatTimeRef.current += 60 / bpm;
      }
    };

    intervalRef.current = window.setInterval(scheduleBeats, 25);
    setIsPlaying(true);
  };

  const stopMetronome = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    setBeat(0);
  };

  useEffect(() => {
    if (isPlaying) {
      stopMetronome();
      startMetronome();
    }
  }, [bpm, beatsPerMeasure]);

  useEffect(() => {
    return () => {
      stopMetronome();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const adjustBpm = (delta: number) => {
    setBpm(prev => Math.max(20, Math.min(300, prev + delta)));
  };

  const tempoLabels: { min: number; max: number; label: string }[] = [
    { min: 20, max: 40, label: 'Grave' },
    { min: 40, max: 60, label: 'Largo' },
    { min: 60, max: 80, label: 'Adagio' },
    { min: 80, max: 100, label: 'Andante' },
    { min: 100, max: 120, label: 'Moderato' },
    { min: 120, max: 140, label: 'Allegro' },
    { min: 140, max: 180, label: 'Vivace' },
    { min: 180, max: 300, label: 'Presto' },
  ];

  const currentTempo = tempoLabels.find(t => bpm >= t.min && bpm < t.max)?.label || 'Allegro';

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <Card className="p-8 text-center">
        <div className="mb-6">
          <p className="text-6xl font-bold tabular-nums" data-testid="text-bpm">{bpm}</p>
          <p className="text-lg text-muted-foreground">{currentTempo}</p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-6">
          <Button size="icon" variant="outline" onClick={() => adjustBpm(-5)} data-testid="button-decrease">
            <Minus className="w-5 h-5" />
          </Button>
          <Button
            size="lg"
            className="w-20 h-20 rounded-full"
            onClick={isPlaying ? stopMetronome : startMetronome}
            data-testid="button-toggle"
          >
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </Button>
          <Button size="icon" variant="outline" onClick={() => adjustBpm(5)} data-testid="button-increase">
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {Array.from({ length: beatsPerMeasure }, (_, i) => (
            <div
              key={i}
              className={cn(
                'w-4 h-4 rounded-full transition-all',
                beat === i + 1 ? (i === 0 ? 'bg-primary scale-125' : 'bg-primary/70 scale-110') : 'bg-muted'
              )}
            />
          ))}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>BPM: {bpm}</Label>
            <Slider
              value={[bpm]}
              onValueChange={([v]) => setBpm(v)}
              min={20}
              max={300}
              step={1}
              data-testid="slider-bpm"
            />
          </div>

          <div className="space-y-2">
            <Label>{t('Tools.metronome.beatsPerMeasure') || 'Beats per Measure'}: {beatsPerMeasure}</Label>
            <Slider
              value={[beatsPerMeasure]}
              onValueChange={([v]) => setBeatsPerMeasure(v)}
              min={2}
              max={8}
              step={1}
              data-testid="slider-beats"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
