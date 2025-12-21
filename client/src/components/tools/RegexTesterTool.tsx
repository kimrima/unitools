import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Regex, AlertCircle, Check } from 'lucide-react';

export default function RegexTesterTool() {
  const { t } = useTranslation();
  const [pattern, setPattern] = useState('');
  const [testString, setTestString] = useState('');
  const [flags, setFlags] = useState({
    global: true,
    ignoreCase: false,
    multiline: false,
  });

  const result = useMemo(() => {
    if (!pattern) return null;
    
    try {
      const flagStr = (flags.global ? 'g' : '') + (flags.ignoreCase ? 'i' : '') + (flags.multiline ? 'm' : '');
      const regex = new RegExp(pattern, flagStr);
      const matches: { match: string; index: number; groups?: Record<string, string> }[] = [];
      
      if (flags.global) {
        let match;
        while ((match = regex.exec(testString)) !== null) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.groups,
          });
        }
      } else {
        const match = regex.exec(testString);
        if (match) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.groups,
          });
        }
      }
      
      return { valid: true, matches, regex };
    } catch (e) {
      return { valid: false, error: (e as Error).message };
    }
  }, [pattern, testString, flags]);

  const highlightedText = useMemo(() => {
    if (!result?.valid || !result.matches || !result.matches.length || !testString) return null;
    
    const parts: { text: string; isMatch: boolean }[] = [];
    let lastIndex = 0;
    const matches = result.matches;
    
    matches.forEach(({ match, index }) => {
      if (index > lastIndex) {
        parts.push({ text: testString.slice(lastIndex, index), isMatch: false });
      }
      parts.push({ text: match, isMatch: true });
      lastIndex = index + match.length;
    });
    
    if (lastIndex < testString.length) {
      parts.push({ text: testString.slice(lastIndex), isMatch: false });
    }
    
    return parts;
  }, [result, testString]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Regex className="w-4 h-4" />
          {t('Tools.regex-tester.patternLabel')}
        </Label>
        <div className="flex items-center gap-2">
          <span className="text-lg text-muted-foreground">/</span>
          <Input
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder={t('Tools.regex-tester.patternPlaceholder')}
            className="font-mono"
            data-testid="input-pattern"
          />
          <span className="text-lg text-muted-foreground">/</span>
          <span className="font-mono text-sm text-muted-foreground">
            {flags.global ? 'g' : ''}{flags.ignoreCase ? 'i' : ''}{flags.multiline ? 'm' : ''}
          </span>
        </div>
        {result && !result.valid && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            {result.error}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Switch
            id="global"
            checked={flags.global}
            onCheckedChange={(v) => setFlags({ ...flags, global: v })}
          />
          <Label htmlFor="global" className="text-sm">Global (g)</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="ignoreCase"
            checked={flags.ignoreCase}
            onCheckedChange={(v) => setFlags({ ...flags, ignoreCase: v })}
          />
          <Label htmlFor="ignoreCase" className="text-sm">Case Insensitive (i)</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="multiline"
            checked={flags.multiline}
            onCheckedChange={(v) => setFlags({ ...flags, multiline: v })}
          />
          <Label htmlFor="multiline" className="text-sm">Multiline (m)</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t('Tools.regex-tester.testLabel')}</Label>
        <Textarea
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder={t('Tools.regex-tester.testPlaceholder')}
          className="min-h-32 font-mono"
          data-testid="input-test-string"
        />
      </div>

      {highlightedText && result?.valid && result.matches && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label>{t('Tools.regex-tester.highlightLabel')}</Label>
            <Badge variant="secondary" className="gap-1">
              <Check className="w-3 h-3" />
              {result.matches.length} {t('Tools.regex-tester.matches')}
            </Badge>
          </div>
          <div className="font-mono text-sm whitespace-pre-wrap break-all p-3 bg-muted/50 rounded-md">
            {highlightedText.map((part, i) => (
              <span
                key={i}
                className={part.isMatch ? 'bg-yellow-300 dark:bg-yellow-600 px-0.5 rounded' : ''}
              >
                {part.text}
              </span>
            ))}
          </div>
        </Card>
      )}

      {result?.valid && result.matches && result.matches.length > 0 && (
        <Card className="p-4 space-y-3">
          <Label>{t('Tools.regex-tester.matchesLabel')}</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {result.matches.map((match, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                <Badge variant="outline" className="shrink-0">#{i + 1}</Badge>
                <code className="text-sm font-mono">"{match.match}"</code>
                <span className="text-xs text-muted-foreground ml-auto">
                  index: {match.index}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {result?.valid && result.matches && result.matches.length === 0 && testString && (
        <div className="text-center py-4 text-muted-foreground">
          {t('Tools.regex-tester.noMatches')}
        </div>
      )}
    </div>
  );
}
