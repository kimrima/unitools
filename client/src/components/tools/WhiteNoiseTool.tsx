import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Play, Pause, Volume2 } from 'lucide-react';

type NoiseType = 'white' | 'pink' | 'brown';

export default function WhiteNoiseTool() {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [noiseType, setNoiseType] = useState<NoiseType>('white');
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const createNoise = (type: NoiseType, sampleRate: number, length: number): Float32Array => {
    const buffer = new Float32Array(length);
    
    if (type === 'white') {
      for (let i = 0; i < length; i++) {
        buffer[i] = Math.random() * 2 - 1;
      }
    } else if (type === 'pink') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        buffer[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    } else if (type === 'brown') {
      let lastOut = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        buffer[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = buffer[i];
        buffer[i] *= 3.5;
      }
    }
    
    return buffer;
  };

  const startNoise = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const ctx = audioContextRef.current;
    const bufferSize = ctx.sampleRate * 2;
    const audioBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const channelData = audioBuffer.getChannelData(0);
    const noiseData = createNoise(noiseType, ctx.sampleRate, bufferSize);
    channelData.set(noiseData);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.loop = true;

    const gainNode = ctx.createGain();
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start();

    sourceRef.current = source;
    gainNodeRef.current = gainNode;
    setIsPlaying(true);
  };

  const stopNoise = () => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (isPlaying) {
      stopNoise();
      startNoise();
    }
  }, [noiseType]);

  useEffect(() => {
    return () => {
      stopNoise();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const noiseTypes: { type: NoiseType; label: string; color: string }[] = [
    { type: 'white', label: t('Tools.white-noise.white') || 'White Noise', color: 'bg-gray-100 dark:bg-gray-800' },
    { type: 'pink', label: t('Tools.white-noise.pink') || 'Pink Noise', color: 'bg-pink-100 dark:bg-pink-900/30' },
    { type: 'brown', label: t('Tools.white-noise.brown') || 'Brown Noise', color: 'bg-amber-100 dark:bg-amber-900/30' },
  ];

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <Card className="p-8 text-center">
        <div className="mb-6">
          <Button
            size="lg"
            className="w-24 h-24 rounded-full"
            onClick={isPlaying ? stopNoise : startNoise}
            data-testid="button-toggle-noise"
          >
            {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
          </Button>
        </div>

        <p className="text-lg font-medium mb-6">
          {isPlaying ? (t('Tools.white-noise.playing') || 'Playing...') : (t('Tools.white-noise.stopped') || 'Click to Play')}
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 justify-center">
              <Volume2 className="w-4 h-4" />
              {t('Tools.white-noise.volume') || 'Volume'}: {Math.round(volume * 100)}%
            </Label>
            <Slider
              value={[volume * 100]}
              onValueChange={([v]) => setVolume(v / 100)}
              max={100}
              step={1}
              className="w-full"
              data-testid="slider-volume"
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        {noiseTypes.map(({ type, label, color }) => (
          <Button
            key={type}
            variant={noiseType === type ? 'default' : 'outline'}
            className="h-auto py-4 flex flex-col gap-1"
            onClick={() => setNoiseType(type)}
            data-testid={`button-noise-${type}`}
          >
            <div className={`w-8 h-8 rounded-full ${color} border`} />
            <span className="text-xs">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
