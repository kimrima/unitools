import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, ArrowDownUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function BinaryConverterTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const textToBinary = (text: string): string => {
    return text
      .split('')
      .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
      .join(' ');
  };

  const binaryToText = (binary: string): string => {
    const cleanBinary = binary.replace(/[^01]/g, ' ').trim();
    const bytes = cleanBinary.split(/\s+/).filter(b => b.length > 0);
    
    return bytes.map(byte => {
      const paddedByte = byte.padStart(8, '0');
      const charCode = parseInt(paddedByte, 2);
      return String.fromCharCode(charCode);
    }).join('');
  };

  const handleProcess = () => {
    try {
      if (mode === 'encode') {
        setOutput(textToBinary(input));
      } else {
        setOutput(binaryToText(input));
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
              {t('Tools.binary-converter.textToBinary', 'Text to Binary')}
            </Button>
            <Button
              variant={mode === 'decode' ? 'default' : 'outline'}
              onClick={() => setMode('decode')}
              data-testid="button-decode-mode"
            >
              {t('Tools.binary-converter.binaryToText', 'Binary to Text')}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {mode === 'encode'
                    ? t('Tools.binary-converter.textLabel', 'Text')
                    : t('Tools.binary-converter.binaryLabel', 'Binary')}
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
                  ? t('Tools.binary-converter.textPlaceholder', 'Enter text to convert to binary...')
                  : t('Tools.binary-converter.binaryPlaceholder', 'Enter binary code (e.g., 01001000 01101001)...')}
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
                    ? t('Tools.binary-converter.binaryLabel', 'Binary')
                    : t('Tools.binary-converter.textLabel', 'Text')}
                </span>
                <div className="flex items-center gap-1">
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
