import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, FileCode, Minimize2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function minifyCSS(css: string): string {
  let result = css;
  result = result.replace(/\/\*[\s\S]*?\*\//g, '');
  result = result.replace(/\s+/g, ' ');
  result = result.replace(/\s*([{};:,>~+])\s*/g, '$1');
  result = result.replace(/;}/g, '}');
  result = result.replace(/\s*{\s*/g, '{');
  result = result.replace(/\s*}\s*/g, '}');
  return result.trim();
}

function beautifyCSS(css: string): string {
  let result = minifyCSS(css);
  result = result.replace(/}/g, '}\n\n');
  result = result.replace(/{/g, ' {\n  ');
  result = result.replace(/;/g, ';\n  ');
  result = result.replace(/\n  }/g, '\n}');
  return result.trim();
}

export default function CssMinifierTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const handleMinify = () => {
    if (!input) return;
    setOutput(minifyCSS(input));
  };

  const handleBeautify = () => {
    if (!input) return;
    setOutput(beautifyCSS(input));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast({ title: t('Common.actions.copy') + '!' });
  };

  const savings = input && output && output.length < input.length ? 
    Math.round((1 - output.length / input.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <FileCode className="w-4 h-4" />
          {t('Tools.css-minifier.inputLabel')}
        </Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('Tools.css-minifier.placeholder')}
          className="min-h-40 font-mono text-sm"
          data-testid="input-css"
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleMinify} disabled={!input} className="flex-1" data-testid="button-minify">
          <Minimize2 className="w-4 h-4 mr-2" />
          {t('Tools.css-minifier.minify')}
        </Button>
        <Button variant="outline" onClick={handleBeautify} disabled={!input} className="flex-1" data-testid="button-beautify">
          <Wand2 className="w-4 h-4 mr-2" />
          {t('Tools.css-minifier.beautify')}
        </Button>
      </div>

      {output && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{t('Tools.css-minifier.outputLabel')}</Label>
            <div className="flex items-center gap-3">
              {savings > 0 && (
                <span className="text-sm text-green-600 dark:text-green-400">
                  -{savings}%
                </span>
              )}
              <Button size="sm" variant="ghost" onClick={copyToClipboard} data-testid="button-copy">
                <Copy className="w-4 h-4 mr-1" />
                {t('Common.actions.copy')}
              </Button>
            </div>
          </div>
          <Textarea
            value={output}
            readOnly
            className="min-h-32 font-mono text-sm"
          />
        </div>
      )}
    </div>
  );
}
