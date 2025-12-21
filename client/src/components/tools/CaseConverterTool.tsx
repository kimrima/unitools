import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type CaseType = 'upper' | 'lower' | 'title' | 'sentence' | 'camel' | 'pascal' | 'snake' | 'kebab';

export default function CaseConverterTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convertCase = (text: string, type: CaseType): string => {
    switch (type) {
      case 'upper':
        return text.toUpperCase();
      case 'lower':
        return text.toLowerCase();
      case 'title':
        return text.replace(/\w\S*/g, (txt) => 
          txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
      case 'sentence':
        return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
      case 'camel':
        return text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
      case 'pascal':
        return text
          .toLowerCase()
          .replace(/(^|[^a-zA-Z0-9]+)(.)/g, (_, __, c) => c.toUpperCase());
      case 'snake':
        return text
          .replace(/([a-z])([A-Z])/g, '$1_$2')
          .replace(/[\s-]+/g, '_')
          .toLowerCase();
      case 'kebab':
        return text
          .replace(/([a-z])([A-Z])/g, '$1-$2')
          .replace(/[\s_]+/g, '-')
          .toLowerCase();
      default:
        return text;
    }
  };

  const handleConvert = (type: CaseType) => {
    const result = convertCase(input, type);
    setOutput(result);
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    toast({
      title: t('Common.messages.complete'),
      description: t('Common.actions.copy'),
    });
  };

  const caseButtons: { type: CaseType; labelKey: string }[] = [
    { type: 'upper', labelKey: 'uppercase' },
    { type: 'lower', labelKey: 'lowercase' },
    { type: 'title', labelKey: 'titlecase' },
    { type: 'sentence', labelKey: 'sentencecase' },
    { type: 'camel', labelKey: 'camelcase' },
    { type: 'pascal', labelKey: 'pascalcase' },
    { type: 'snake', labelKey: 'snakecase' },
    { type: 'kebab', labelKey: 'kebabcase' },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {t('Tools.case-converter.inputLabel')}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setInput(''); setOutput(''); }}
                  disabled={!input}
                  data-testid="button-clear"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                placeholder={t('Tools.case-converter.placeholder')}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[200px] font-mono text-sm resize-none"
                data-testid="textarea-input"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {t('Tools.case-converter.outputLabel')}
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
                className="min-h-[200px] font-mono text-sm resize-none bg-muted/30"
                data-testid="textarea-output"
              />
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {caseButtons.map(({ type, labelKey }) => (
              <Button
                key={type}
                variant="outline"
                onClick={() => handleConvert(type)}
                disabled={!input}
                data-testid={`button-${type}`}
              >
                {t(`Tools.case-converter.${labelKey}`)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
