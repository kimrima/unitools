import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, ArrowDownUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '©': '&copy;',
  '®': '&reg;',
  '™': '&trade;',
  '€': '&euro;',
  '£': '&pound;',
  '¥': '&yen;',
  '¢': '&cent;',
  '§': '&sect;',
  '°': '&deg;',
  '±': '&plusmn;',
  '×': '&times;',
  '÷': '&divide;',
  '•': '&bull;',
  '…': '&hellip;',
  '–': '&ndash;',
  '—': '&mdash;',
  ' ': '&nbsp;',
  '¡': '&iexcl;',
  '¿': '&iquest;',
  'á': '&aacute;',
  'é': '&eacute;',
  'í': '&iacute;',
  'ó': '&oacute;',
  'ú': '&uacute;',
  'ñ': '&ntilde;',
  'ü': '&uuml;',
};

const REVERSE_ENTITIES: Record<string, string> = {};
Object.entries(HTML_ENTITIES).forEach(([char, entity]) => {
  REVERSE_ENTITIES[entity] = char;
});

export default function HtmlEntityTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const encodeHtmlEntities = (text: string): string => {
    let result = text;
    Object.entries(HTML_ENTITIES).forEach(([char, entity]) => {
      if (char !== ' ') {
        result = result.split(char).join(entity);
      }
    });
    return result;
  };

  const decodeHtmlEntities = (text: string): string => {
    let result = text;
    Object.entries(REVERSE_ENTITIES).forEach(([entity, char]) => {
      result = result.split(entity).join(char);
    });
    result = result.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)));
    result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
    return result;
  };

  const handleProcess = () => {
    try {
      if (mode === 'encode') {
        setOutput(encodeHtmlEntities(input));
      } else {
        setOutput(decodeHtmlEntities(input));
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
              {t('Tools.html-entity.encode', 'Encode')}
            </Button>
            <Button
              variant={mode === 'decode' ? 'default' : 'outline'}
              onClick={() => setMode('decode')}
              data-testid="button-decode-mode"
            >
              {t('Tools.html-entity.decode', 'Decode')}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {mode === 'encode'
                    ? t('Tools.html-entity.textLabel', 'Plain Text')
                    : t('Tools.html-entity.encodedLabel', 'HTML Entities')}
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
                  ? t('Tools.html-entity.textPlaceholder', 'Enter text with special characters...')
                  : t('Tools.html-entity.encodedPlaceholder', 'Enter HTML entities like &amp;lt;div&amp;gt;...')}
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
                    ? t('Tools.html-entity.encodedLabel', 'HTML Entities')
                    : t('Tools.html-entity.textLabel', 'Plain Text')}
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
              {mode === 'encode' ? t('Tools.html-entity.encode', 'Encode') : t('Tools.html-entity.decode', 'Decode')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
