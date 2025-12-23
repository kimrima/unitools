import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Trash2, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ToolType = 
  | 'line-break-remover' 
  | 'remove-duplicates' 
  | 'text-sort' 
  | 'find-replace'
  | 'blank-line-remover'
  | 'prefix-suffix'
  | 'text-to-list'
  | 'text-shuffle';

export default function TextProcessingTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [location] = useLocation();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [delimiter, setDelimiter] = useState(',');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'length'>('asc');

  const toolId = useMemo(() => {
    const parts = location.split('/');
    return parts[parts.length - 1] as ToolType;
  }, [location]);

  const processText = () => {
    let result = input;
    
    switch (toolId) {
      case 'line-break-remover':
        result = input.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
        break;
        
      case 'remove-duplicates':
        const linesArr = input.split('\n');
        const uniqueSet = new Set(linesArr);
        result = Array.from(uniqueSet).join('\n');
        break;
        
      case 'text-sort':
        const sortLines = input.split('\n').filter(l => l.trim());
        if (sortOrder === 'asc') {
          sortLines.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
        } else if (sortOrder === 'desc') {
          sortLines.sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }));
        } else {
          sortLines.sort((a, b) => a.length - b.length);
        }
        result = sortLines.join('\n');
        break;
        
      case 'find-replace':
        if (findText) {
          result = input.split(findText).join(replaceText);
        }
        break;
        
      case 'blank-line-remover':
        result = input.split('\n').filter(line => line.trim()).join('\n');
        break;
        
      case 'prefix-suffix':
        result = input.split('\n').map(line => `${prefix}${line}${suffix}`).join('\n');
        break;
        
      case 'text-to-list':
        const items = input.split(delimiter).map(item => item.trim()).filter(Boolean);
        result = items.map((item, i) => `${i + 1}. ${item}`).join('\n');
        break;
        
      case 'text-shuffle':
        const shuffleLines = input.split('\n').map(line => {
          const words = line.split(/\s+/);
          for (let i = words.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [words[i], words[j]] = [words[j], words[i]];
          }
          return words.join(' ');
        });
        result = shuffleLines.join('\n');
        break;
    }
    
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

  const handleReset = () => {
    setInput('');
    setOutput('');
  };

  const renderOptions = () => {
    switch (toolId) {
      case 'find-replace':
        return (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm whitespace-nowrap">
                {t('Tools.find-replace.findLabel')}
              </Label>
              <Input
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                placeholder={t('Tools.find-replace.findPlaceholder')}
                className="w-40"
                data-testid="input-find"
              />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <Label className="text-sm whitespace-nowrap">
                {t('Tools.find-replace.replaceLabel')}
              </Label>
              <Input
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder={t('Tools.find-replace.replacePlaceholder')}
                className="w-40"
                data-testid="input-replace"
              />
            </div>
          </div>
        );
        
      case 'text-sort':
        return (
          <div className="flex items-center gap-2 mb-4">
            <Label className="text-sm">{t('Tools.text-sort.orderLabel')}</Label>
            <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as typeof sortOrder)}>
              <SelectTrigger className="w-40" data-testid="select-order">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">{t('Tools.text-sort.ascending')}</SelectItem>
                <SelectItem value="desc">{t('Tools.text-sort.descending')}</SelectItem>
                <SelectItem value="length">{t('Tools.text-sort.byLength')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
        
      case 'prefix-suffix':
        return (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm whitespace-nowrap">
                {t('Tools.prefix-suffix.prefixLabel')}
              </Label>
              <Input
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder={t('Tools.prefix-suffix.prefixPlaceholder')}
                className="w-32"
                data-testid="input-prefix"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm whitespace-nowrap">
                {t('Tools.prefix-suffix.suffixLabel')}
              </Label>
              <Input
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
                placeholder={t('Tools.prefix-suffix.suffixPlaceholder')}
                className="w-32"
                data-testid="input-suffix"
              />
            </div>
          </div>
        );
        
      case 'text-to-list':
        return (
          <div className="flex items-center gap-2 mb-4">
            <Label className="text-sm">{t('Tools.text-to-list.delimiterLabel')}</Label>
            <Select value={delimiter} onValueChange={setDelimiter}>
              <SelectTrigger className="w-32" data-testid="select-delimiter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=",">{t('Tools.text-to-list.comma')}</SelectItem>
                <SelectItem value=";">{t('Tools.text-to-list.semicolon')}</SelectItem>
                <SelectItem value="|">{t('Tools.text-to-list.pipe')}</SelectItem>
                <SelectItem value="\t">{t('Tools.text-to-list.tab')}</SelectItem>
                <SelectItem value=" ">{t('Tools.text-to-list.space')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          {renderOptions()}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {t(`Tools.${toolId}.inputLabel`)}
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
                placeholder={t(`Tools.${toolId}.placeholder`)}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[250px] font-mono text-sm resize-none"
                data-testid="textarea-input"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {t(`Tools.${toolId}.outputLabel`)}
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
                className="min-h-[250px] font-mono text-sm resize-none bg-muted/30"
                data-testid="textarea-output"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <Button
              onClick={processText}
              disabled={!input}
              className="w-full sm:w-auto"
              data-testid="button-process"
            >
              {t('Common.actions.process')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
