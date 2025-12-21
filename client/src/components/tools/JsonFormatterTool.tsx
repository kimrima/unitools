import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Trash2, Check, X, FileJson, FileText, Code2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

type ToolMode = 'json-formatter' | 'csv-to-json' | 'json-to-csv' | 'xml-to-json' | 'yaml-to-json';

interface JsonFormatterToolProps {
  toolId?: string;
}

export default function JsonFormatterTool({ toolId: propToolId }: JsonFormatterToolProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [location] = useLocation();
  
  const toolId = useMemo(() => {
    if (propToolId) return propToolId as ToolMode;
    const parts = location.split('/');
    return (parts[parts.length - 1] || 'json-formatter') as ToolMode;
  }, [propToolId, location]);
  
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indentSize, setIndentSize] = useState('2');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  const toolConfig = useMemo(() => {
    switch (toolId) {
      case 'csv-to-json':
        return { icon: FileJson, titleKey: 'csv-to-json', inputLabel: 'CSV', outputLabel: 'JSON' };
      case 'json-to-csv':
        return { icon: FileText, titleKey: 'json-to-csv', inputLabel: 'JSON', outputLabel: 'CSV' };
      case 'xml-to-json':
        return { icon: FileJson, titleKey: 'xml-to-json', inputLabel: 'XML', outputLabel: 'JSON' };
      case 'yaml-to-json':
        return { icon: FileJson, titleKey: 'yaml-to-json', inputLabel: 'YAML', outputLabel: 'JSON' };
      default:
        return { icon: Code2, titleKey: 'json-formatter', inputLabel: 'JSON', outputLabel: 'JSON' };
    }
  }, [toolId]);

  const csvToJson = useCallback((csv: string): string => {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) throw new Error('CSV must have headers and at least one row');
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const result = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      return headers.reduce((obj, header, i) => {
        obj[header] = values[i] || '';
        return obj;
      }, {} as Record<string, string>);
    });
    return JSON.stringify(result, null, parseInt(indentSize));
  }, [indentSize]);

  const jsonToCsv = useCallback((json: string): string => {
    const data = JSON.parse(json);
    if (!Array.isArray(data) || data.length === 0) throw new Error('JSON must be an array of objects');
    const headers = Object.keys(data[0]);
    const rows = data.map(obj => headers.map(h => `"${String(obj[h] || '').replace(/"/g, '""')}"`).join(','));
    return [headers.join(','), ...rows].join('\n');
  }, []);

  const xmlToJson = useCallback((xml: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    const errorNode = doc.querySelector('parsererror');
    if (errorNode) throw new Error('Invalid XML');
    
    const nodeToObject = (node: Element): Record<string, unknown> => {
      const obj: Record<string, unknown> = {};
      if (node.attributes.length) {
        obj['@attributes'] = {};
        for (const attr of Array.from(node.attributes)) {
          (obj['@attributes'] as Record<string, string>)[attr.name] = attr.value;
        }
      }
      for (const child of Array.from(node.children)) {
        const name = child.nodeName;
        const value = child.children.length ? nodeToObject(child) : child.textContent;
        if (obj[name]) {
          if (!Array.isArray(obj[name])) obj[name] = [obj[name]];
          (obj[name] as unknown[]).push(value);
        } else {
          obj[name] = value;
        }
      }
      if (!node.children.length && node.textContent) {
        return { '#text': node.textContent } as Record<string, unknown>;
      }
      return obj;
    };
    
    return JSON.stringify({ [doc.documentElement.nodeName]: nodeToObject(doc.documentElement) }, null, parseInt(indentSize));
  }, [indentSize]);

  const yamlToJson = useCallback((yaml: string): string => {
    const lines = yaml.split('\n');
    const result: Record<string, unknown> = {};
    let currentKey = '';
    let currentIndent = 0;
    const stack: { obj: Record<string, unknown>; indent: number }[] = [{ obj: result, indent: -1 }];
    
    for (const line of lines) {
      if (!line.trim() || line.trim().startsWith('#')) continue;
      const indent = line.search(/\S/);
      const content = line.trim();
      
      if (content.includes(':')) {
        const [key, ...valueParts] = content.split(':');
        const value = valueParts.join(':').trim();
        
        while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
          stack.pop();
        }
        
        const current = stack[stack.length - 1].obj;
        if (value) {
          let parsedValue: unknown = value;
          if (value === 'true') parsedValue = true;
          else if (value === 'false') parsedValue = false;
          else if (!isNaN(Number(value))) parsedValue = Number(value);
          else if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            parsedValue = value.slice(1, -1);
          }
          current[key.trim()] = parsedValue;
        } else {
          current[key.trim()] = {};
          stack.push({ obj: current[key.trim()] as Record<string, unknown>, indent });
        }
        currentKey = key.trim();
        currentIndent = indent;
      } else if (content.startsWith('- ')) {
        const parent = stack[stack.length - 1].obj;
        if (!Array.isArray(parent[currentKey])) {
          parent[currentKey] = [];
        }
        (parent[currentKey] as unknown[]).push(content.slice(2));
      }
    }
    
    return JSON.stringify(result, null, parseInt(indentSize));
  }, [indentSize]);

  const processInput = useCallback(() => {
    try {
      let result: string;
      
      switch (toolId) {
        case 'csv-to-json':
          result = csvToJson(input);
          break;
        case 'json-to-csv':
          result = jsonToCsv(input);
          break;
        case 'xml-to-json':
          result = xmlToJson(input);
          break;
        case 'yaml-to-json':
          result = yamlToJson(input);
          break;
        default:
          const parsed = JSON.parse(input);
          result = JSON.stringify(parsed, null, parseInt(indentSize));
      }
      
      setOutput(result);
      setIsValid(true);
      setErrorMessage('');
    } catch (error) {
      setIsValid(false);
      setErrorMessage((error as Error).message);
      setOutput('');
    }
  }, [toolId, input, indentSize, csvToJson, jsonToCsv, xmlToJson, yamlToJson]);

  const minifyJson = useCallback(() => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setIsValid(true);
      setErrorMessage('');
    } catch (error) {
      setIsValid(false);
      setErrorMessage((error as Error).message);
      setOutput('');
    }
  }, [input]);

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
  
  const Icon = toolConfig.icon;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {toolId === 'json-formatter' && (
              <Select value={indentSize} onValueChange={setIndentSize}>
                <SelectTrigger className="w-32" data-testid="select-indent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">{t('Tools.json-formatter.indent2', { defaultValue: '2 spaces' })}</SelectItem>
                  <SelectItem value="4">{t('Tools.json-formatter.indent4', { defaultValue: '4 spaces' })}</SelectItem>
                  <SelectItem value="8">{t('Tools.json-formatter.indent8', { defaultValue: '8 spaces' })}</SelectItem>
                </SelectContent>
              </Select>
            )}
            
            {isValid !== null && (
              <Badge variant={isValid ? 'default' : 'destructive'} className="gap-1">
                {isValid ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                {isValid ? t('Common.messages.valid', { defaultValue: 'Valid' }) : t('Common.messages.invalid', { defaultValue: 'Invalid' })}
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {toolConfig.inputLabel}
                </Label>
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
                placeholder={t(`Tools.${toolConfig.titleKey}.placeholder`, { defaultValue: `Enter ${toolConfig.inputLabel} here...` })}
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
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileJson className="h-4 w-4" />
                  {toolConfig.outputLabel}
                </Label>
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
              onClick={processInput}
              disabled={!input}
              data-testid="button-convert"
            >
              {toolId === 'json-formatter' ? t('Tools.json-formatter.format', { defaultValue: 'Format' }) : t('Common.actions.convert', { defaultValue: 'Convert' })}
            </Button>
            {toolId === 'json-formatter' && (
              <Button
                variant="outline"
                onClick={minifyJson}
                disabled={!input}
                data-testid="button-minify"
              >
                {t('Tools.json-formatter.minify', { defaultValue: 'Minify' })}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
