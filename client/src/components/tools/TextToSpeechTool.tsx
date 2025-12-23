import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Play, Pause, Square, Volume2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceOption {
  voice: SpeechSynthesisVoice;
  label: string;
  lang: string;
}

export default function TextToSpeechTool() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      const voiceOptions: VoiceOption[] = availableVoices.map(voice => ({
        voice,
        label: `${voice.name} (${voice.lang})`,
        lang: voice.lang,
      }));
      
      const sortedVoices = voiceOptions.sort((a, b) => {
        const currentLang = i18n.language.split('-')[0];
        const aMatch = a.lang.startsWith(currentLang);
        const bMatch = b.lang.startsWith(currentLang);
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return a.label.localeCompare(b.label);
      });
      
      setVoices(sortedVoices);
      
      if (sortedVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(sortedVoices[0].voice.name);
      }
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      speechSynthesis.cancel();
    };
  }, [i18n.language, selectedVoice]);

  const speak = useCallback(() => {
    if (!text.trim()) return;
    
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find(v => v.voice.name === selectedVoice)?.voice;
    
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.rate = rate;
    utterance.pitch = pitch;
    
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    
    utterance.onerror = (event) => {
      if (event.error !== 'canceled') {
        toast({
          title: t('Common.messages.error'),
          description: t('Tools.text-to-speech.speakError'),
          variant: 'destructive',
        });
      }
      setIsPlaying(false);
      setIsPaused(false);
    };
    
    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [text, selectedVoice, rate, pitch, voices, toast, t]);

  const pause = () => {
    speechSynthesis.pause();
    setIsPaused(true);
  };

  const resume = () => {
    speechSynthesis.resume();
    setIsPaused(false);
  };

  const stop = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  if (!isSupported) {
    return (
      <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
        <CardContent className="pt-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">
              {t('Tools.text-to-speech.notSupported')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label>{t('Tools.text-to-speech.textLabel')}</Label>
            <Textarea
              placeholder={t('Tools.text-to-speech.placeholder')}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[150px]"
              data-testid="textarea-input"
            />
            <p className="text-xs text-muted-foreground">
              {text.length} {t('Tools.text-to-speech.characters')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('Tools.text-to-speech.voiceLabel')}</Label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger data-testid="select-voice">
                  <SelectValue placeholder={t('Tools.text-to-speech.selectVoice')} />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((v, index) => (
                    <SelectItem key={index} value={v.voice.name}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {voices.length === 0 && (
                <p className="text-xs text-muted-foreground">{t('Tools.text-to-speech.loadingVoices')}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>{t('Tools.text-to-speech.speed')}</Label>
                  <span className="text-sm text-muted-foreground">{rate.toFixed(1)}x</span>
                </div>
                <Slider
                  value={[rate]}
                  onValueChange={([v]) => setRate(v)}
                  min={0.5}
                  max={2}
                  step={0.1}
                  data-testid="slider-rate"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>{t('Tools.text-to-speech.pitch')}</Label>
                  <span className="text-sm text-muted-foreground">{pitch.toFixed(1)}</span>
                </div>
                <Slider
                  value={[pitch]}
                  onValueChange={([v]) => setPitch(v)}
                  min={0.5}
                  max={2}
                  step={0.1}
                  data-testid="slider-pitch"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {!isPlaying ? (
              <Button onClick={speak} disabled={!text.trim()} data-testid="button-play">
                <Play className="w-4 h-4 mr-2" />
                {t('Tools.text-to-speech.play')}
              </Button>
            ) : isPaused ? (
              <Button onClick={resume} data-testid="button-resume">
                <Play className="w-4 h-4 mr-2" />
                {t('Tools.text-to-speech.resume')}
              </Button>
            ) : (
              <Button onClick={pause} variant="secondary" data-testid="button-pause">
                <Pause className="w-4 h-4 mr-2" />
                {t('Tools.text-to-speech.pause')}
              </Button>
            )}
            
            {isPlaying && (
              <Button onClick={stop} variant="outline" data-testid="button-stop">
                <Square className="w-4 h-4 mr-2" />
                {t('Tools.text-to-speech.stop')}
              </Button>
            )}
          </div>

          {isPlaying && (
            <div className="flex items-center gap-2 text-sm text-primary">
              <Volume2 className="w-4 h-4 animate-pulse" />
              <span>{isPaused ? t('Tools.text-to-speech.paused') : t('Tools.text-to-speech.speaking')}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="pt-4">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {t('Tools.text-to-speech.browserNote')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
