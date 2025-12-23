import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Check, FlipVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FLIP_MAP: Record<string, string> = {
  'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ', 'h': 'ɥ',
  'i': 'ᴉ', 'j': 'ɾ', 'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u', 'o': 'o', 'p': 'd',
  'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ', 'u': 'n', 'v': 'ʌ', 'w': 'ʍ', 'x': 'x',
  'y': 'ʎ', 'z': 'z',
  'A': '∀', 'B': 'ᗺ', 'C': 'Ɔ', 'D': 'ᗡ', 'E': 'Ǝ', 'F': 'Ⅎ', 'G': '⅁', 'H': 'H',
  'I': 'I', 'J': 'ſ', 'K': 'ʞ', 'L': '˥', 'M': 'W', 'N': 'N', 'O': 'O', 'P': 'Ԁ',
  'Q': 'Q', 'R': 'ᴚ', 'S': 'S', 'T': '⊥', 'U': '∩', 'V': 'Λ', 'W': 'M', 'X': 'X',
  'Y': '⅄', 'Z': 'Z',
  '0': '0', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ',
  '8': '8', '9': '6',
  '.': '˙', ',': '\'', '\'': ',', '"': '„', '`': ',', '!': '¡', '?': '¿',
  '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<',
  '&': '⅋', '_': '‾', ';': '؛', '∴': '∵',
};

const REVERSE_FLIP_MAP = Object.fromEntries(
  Object.entries(FLIP_MAP).map(([k, v]) => [v, k])
);

export default function FlipTextTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const flipText = useCallback((text: string) => {
    const flipped = text.split('').map(char => FLIP_MAP[char] || char).reverse().join('');
    setOutput(flipped);
  }, []);

  const handleInputChange = useCallback((text: string) => {
    setInput(text);
    flipText(text);
  }, [flipText]);

  const copyOutput = useCallback(async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    toast({ description: t('Common.actions.copied', 'Copied!') });
    setTimeout(() => setCopied(false), 2000);
  }, [output, toast, t]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>{t('Tools.flip-text.input', 'Your Text')}</Label>
              <Textarea
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={t('Tools.flip-text.placeholder', 'Type your text here...')}
                rows={6}
                data-testid="input-text"
              />
            </div>
            
            <div className="space-y-2">
              <Label>{t('Tools.flip-text.output', 'Flipped Text')}</Label>
              <Textarea
                value={output}
                readOnly
                rows={6}
                className="font-mono"
                data-testid="output-text"
              />
              <Button 
                onClick={copyOutput} 
                disabled={!output}
                className="w-full"
                data-testid="button-copy"
              >
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? t('Common.actions.copied', 'Copied!') : t('Common.actions.copy', 'Copy')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
