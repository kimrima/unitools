import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Copy, FileCode, Minimize2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function minifyJS(js: string): string {
  let result = js;
  result = result.replace(/\/\*[\s\S]*?\*\//g, '');
  result = result.replace(/\/\/.*$/gm, '');
  result = result.replace(/\n\s*\n/g, '\n');
  result = result.replace(/^\s+|\s+$/gm, '');
  result = result.replace(/\s*([{};:,=+\-*/<>!&|?()])\s*/g, '$1');
  result = result.replace(/\n/g, '');
  result = result.replace(/\s{2,}/g, ' ');
  return result.trim();
}

export default function JsMinifierTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const handleMinify = () => {
    if (!input) return;
    setOutput(minifyJS(input));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast({ title: t('Common.actions.copy') + '!' });
  };

  const savings = input && output ? 
    Math.round((1 - output.length / input.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-yellow-500/10 border-yellow-500/20">
        <div className="flex gap-2 text-sm text-yellow-600 dark:text-yellow-400">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{t('Tools.js-minifier.notice')}</p>
        </div>
      </Card>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <FileCode className="w-4 h-4" />
          {t('Tools.js-minifier.inputLabel')}
        </Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('Tools.js-minifier.placeholder')}
          className="min-h-40 font-mono text-sm"
          data-testid="input-js"
        />
      </div>

      <Button onClick={handleMinify} disabled={!input} className="w-full" data-testid="button-minify">
        <Minimize2 className="w-4 h-4 mr-2" />
        {t('Tools.js-minifier.minify')}
      </Button>

      {output && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{t('Tools.js-minifier.outputLabel')}</Label>
            <div className="flex items-center gap-3">
              {savings > 0 && (
                <span className="text-sm text-green-600 dark:text-green-400">
                  -{savings}% ({input.length} → {output.length} bytes)
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
