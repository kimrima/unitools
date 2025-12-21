import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Copy, FileCode, Minimize2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function minifyHTML(html: string, options: {
  removeComments: boolean;
  collapseWhitespace: boolean;
  removeEmptyAttributes: boolean;
}): string {
  let result = html;

  if (options.removeComments) {
    result = result.replace(/<!--[\s\S]*?-->/g, '');
  }

  if (options.collapseWhitespace) {
    result = result.replace(/>\s+</g, '><');
    result = result.replace(/\s+/g, ' ');
  }

  if (options.removeEmptyAttributes) {
    result = result.replace(/\s+(\w+)=""/g, '');
  }

  return result.trim();
}

export default function HtmlMinifierTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [options, setOptions] = useState({
    removeComments: true,
    collapseWhitespace: true,
    removeEmptyAttributes: true,
  });

  const handleMinify = () => {
    if (!input) return;
    setOutput(minifyHTML(input, options));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast({ title: t('Common.actions.copy') + '!' });
  };

  const savings = input && output ? 
    Math.round((1 - output.length / input.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <FileCode className="w-4 h-4" />
          {t('Tools.html-minifier.inputLabel')}
        </Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('Tools.html-minifier.placeholder')}
          className="min-h-40 font-mono text-sm"
          data-testid="input-html"
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Switch
            id="removeComments"
            checked={options.removeComments}
            onCheckedChange={(v) => setOptions({ ...options, removeComments: v })}
          />
          <Label htmlFor="removeComments" className="text-sm">
            {t('Tools.html-minifier.removeComments')}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="collapseWhitespace"
            checked={options.collapseWhitespace}
            onCheckedChange={(v) => setOptions({ ...options, collapseWhitespace: v })}
          />
          <Label htmlFor="collapseWhitespace" className="text-sm">
            {t('Tools.html-minifier.collapseWhitespace')}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="removeEmptyAttributes"
            checked={options.removeEmptyAttributes}
            onCheckedChange={(v) => setOptions({ ...options, removeEmptyAttributes: v })}
          />
          <Label htmlFor="removeEmptyAttributes" className="text-sm">
            {t('Tools.html-minifier.removeEmptyAttr')}
          </Label>
        </div>
      </div>

      <Button onClick={handleMinify} disabled={!input} className="w-full" data-testid="button-minify">
        <Minimize2 className="w-4 h-4 mr-2" />
        {t('Tools.html-minifier.minify')}
      </Button>

      {output && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{t('Tools.html-minifier.outputLabel')}</Label>
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
