import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Trash2, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function JsonFormatterTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indentSize, setIndentSize] = useState('2');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, parseInt(indentSize));
      setOutput(formatted);
      setIsValid(true);
      setErrorMessage('');
    } catch (error) {
      setIsValid(false);
      setErrorMessage((error as Error).message);
      setOutput('');
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setIsValid(true);
      setErrorMessage('');
    } catch (error) {
      setIsValid(false);
      setErrorMessage((error as Error).message);
      setOutput('');
    }
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
    setIsValid(null);
    setErrorMessage('');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Select value={indentSize} onValueChange={setIndentSize}>
              <SelectTrigger className="w-32" data-testid="select-indent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">{t('Tools.json-formatter.indent2')}</SelectItem>
                <SelectItem value="4">{t('Tools.json-formatter.indent4')}</SelectItem>
                <SelectItem value="8">{t('Tools.json-formatter.indent8')}</SelectItem>
              </SelectContent>
            </Select>
            
            {isValid !== null && (
              <Badge variant={isValid ? 'default' : 'destructive'} className="gap-1">
                {isValid ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                {isValid ? t('Tools.json-formatter.valid') : t('Tools.json-formatter.invalid')}
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {t('Tools.json-formatter.inputLabel')}
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
                placeholder={t('Tools.json-formatter.placeholder')}
                value={input}
                onChange={(e) => { setInput(e.target.value); setIsValid(null); }}
                className="min-h-[300px] font-mono text-sm resize-none"
                data-testid="textarea-input"
              />
              {errorMessage && (
                <p className="text-sm text-destructive">{errorMessage}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {t('Tools.json-formatter.outputLabel')}
                </span>
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
              <Textarea
                value={output}
                readOnly
                className="min-h-[300px] font-mono text-sm resize-none bg-muted/30"
                data-testid="textarea-output"
              />
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              onClick={formatJson}
              disabled={!input}
              data-testid="button-format"
            >
              {t('Tools.json-formatter.format')}
            </Button>
            <Button
              variant="outline"
              onClick={minifyJson}
              disabled={!input}
              data-testid="button-minify"
            >
              {t('Tools.json-formatter.minify')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
