import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, ArrowDownUp, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MORSE_CODE: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
  ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
  '"': '.-..-.', '$': '...-..-', '@': '.--.-.', ' ': '/',
};

const REVERSE_MORSE: Record<string, string> = {};
Object.entries(MORSE_CODE).forEach(([char, morse]) => {
  REVERSE_MORSE[morse] = char;
});

export default function MorseCodeTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [isPlaying, setIsPlaying] = useState(false);

  const textToMorse = (text: string): string => {
    return text
      .toUpperCase()
      .split('')
      .map(char => MORSE_CODE[char] || char)
      .join(' ');
  };

  const morseToText = (morse: string): string => {
    return morse
      .split(' ')
      .map(code => {
        if (code === '/') return ' ';
        if (code === '') return '';
        return REVERSE_MORSE[code] || code;
      })
      .join('');
  };

  const handleProcess = () => {
    try {
      if (mode === 'encode') {
        setOutput(textToMorse(input));
      } else {
        setOutput(morseToText(input));
      }
    } catch (error) {
      toast({
        title: t('Common.errors.PROCESSING_FAILED'),
        variant: 'destructive',
      });
    }
  };

  const toggleMode = () => {
    setMode(mode === 'encode' ? 'decode' : 'encode');
    setInput(output);
    setOutput('');
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    toast({
      title: t('Common.messages.complete'),
      description: t('Common.actions.copy'),
    });
  };

  const handleReset = () => {
    setInput('');
    setOutput('');
  };

  const playMorse = async () => {
    if (!output || mode !== 'encode' || isPlaying) return;
    
    setIsPlaying(true);
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const dotDuration = 0.1;
    const dashDuration = 0.3;
    const pauseDuration = 0.1;
    const letterPause = 0.3;
    const wordPause = 0.7;

    let currentTime = audioContext.currentTime;

    for (const char of output) {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 600;
      oscillator.type = 'sine';

      if (char === '.') {
        gainNode.gain.setValueAtTime(0.3, currentTime);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + dotDuration);
        currentTime += dotDuration + pauseDuration;
      } else if (char === '-') {
        gainNode.gain.setValueAtTime(0.3, currentTime);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + dashDuration);
        currentTime += dashDuration + pauseDuration;
      } else if (char === ' ') {
        currentTime += letterPause;
      } else if (char === '/') {
        currentTime += wordPause;
      }
    }

    setTimeout(() => setIsPlaying(false), (currentTime - audioContext.currentTime) * 1000 + 500);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant={mode === 'encode' ? 'default' : 'outline'}
              onClick={() => setMode('encode')}
              data-testid="button-encode-mode"
            >
              {t('Tools.morse-code.textToMorse', 'Text to Morse')}
            </Button>
            <Button
              variant={mode === 'decode' ? 'default' : 'outline'}
              onClick={() => setMode('decode')}
              data-testid="button-decode-mode"
            >
              {t('Tools.morse-code.morseToText', 'Morse to Text')}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {mode === 'encode'
                    ? t('Tools.morse-code.textLabel', 'Text')
                    : t('Tools.morse-code.morseLabel', 'Morse Code')}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReset}
                  disabled={!input}
                  data-testid="button-clear"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                placeholder={mode === 'encode'
                  ? t('Tools.morse-code.textPlaceholder', 'Enter text to convert to morse code...')
                  : t('Tools.morse-code.morsePlaceholder', 'Enter morse code (e.g., .... . .-.. .-.. ---)...')}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[200px] font-mono text-sm resize-none"
                data-testid="textarea-input"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {mode === 'encode'
                    ? t('Tools.morse-code.morseLabel', 'Morse Code')
                    : t('Tools.morse-code.textLabel', 'Text')}
                </span>
                <div className="flex items-center gap-1">
                  {mode === 'encode' && output && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={playMorse}
                      disabled={isPlaying}
                      data-testid="button-play"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMode}
                    disabled={!output}
                    data-testid="button-swap"
                  >
                    <ArrowDownUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    disabled={!output}
                    data-testid="button-copy"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Textarea
                value={output}
                readOnly
                className="min-h-[200px] font-mono text-sm resize-none bg-muted/30"
                data-testid="textarea-output"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <Button
              onClick={handleProcess}
              disabled={!input}
              className="w-full sm:w-auto"
              data-testid="button-process"
            >
              {t('Common.actions.convert', 'Convert')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
