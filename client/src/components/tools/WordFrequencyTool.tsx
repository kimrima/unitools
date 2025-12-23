import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface WordCount {
  word: string;
  count: number;
  percentage: number;
}

export default function WordFrequencyTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [results, setResults] = useState<WordCount[]>([]);
  const [sortBy, setSortBy] = useState<'frequency' | 'alphabetical'>('frequency');
  const [minLength, setMinLength] = useState<number>(1);
  const [totalWords, setTotalWords] = useState(0);
  const [uniqueWords, setUniqueWords] = useState(0);

  const analyzeFrequency = () => {
    const words = input
      .toLowerCase()
      .replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length >= minLength);

    const frequencyMap = new Map<string, number>();
    words.forEach(word => {
      frequencyMap.set(word, (frequencyMap.get(word) || 0) + 1);
    });

    const total = words.length;
    setTotalWords(total);
    setUniqueWords(frequencyMap.size);

    let wordCounts: WordCount[] = Array.from(frequencyMap.entries()).map(([word, count]) => ({
      word,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }));

    if (sortBy === 'frequency') {
      wordCounts.sort((a, b) => b.count - a.count);
    } else {
      wordCounts.sort((a, b) => a.word.localeCompare(b.word));
    }

    setResults(wordCounts);
  };

  const handleCopy = async () => {
    if (results.length === 0) return;
    const text = results.map(r => `${r.word}: ${r.count} (${r.percentage.toFixed(1)}%)`).join('\n');
    await navigator.clipboard.writeText(text);
    toast({
      title: t('Common.messages.complete'),
      description: t('Common.actions.copy'),
    });
  };

  const handleReset = () => {
    setInput('');
    setResults([]);
    setTotalWords(0);
    setUniqueWords(0);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm whitespace-nowrap">
                {t('Tools.word-frequency.sortLabel', 'Sort by')}
              </Label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-36" data-testid="select-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="frequency">{t('Tools.word-frequency.byFrequency', 'Frequency')}</SelectItem>
                  <SelectItem value="alphabetical">{t('Tools.word-frequency.alphabetical', 'Alphabetical')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm whitespace-nowrap">
                {t('Tools.word-frequency.minLength', 'Min length')}
              </Label>
              <Select value={String(minLength)} onValueChange={(v) => setMinLength(Number(v))}>
                <SelectTrigger className="w-20" data-testid="select-min-length">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                {t('Tools.word-frequency.inputLabel', 'Input Text')}
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
              placeholder={t('Tools.word-frequency.placeholder', 'Paste your text here to analyze word frequency...')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[150px] resize-none"
              data-testid="textarea-input"
            />
          </div>

          <Button onClick={analyzeFrequency} disabled={!input.trim()} data-testid="button-analyze">
            <BarChart3 className="h-4 w-4 mr-2" />
            {t('Tools.word-frequency.analyze', 'Analyze Frequency')}
          </Button>

          {results.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{t('Tools.word-frequency.totalWords', 'Total words')}: <strong className="text-foreground">{totalWords}</strong></span>
                  <span>{t('Tools.word-frequency.uniqueWords', 'Unique words')}: <strong className="text-foreground">{uniqueWords}</strong></span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleCopy} data-testid="button-copy">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="border rounded-md max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="text-left p-2 font-medium">{t('Tools.word-frequency.wordColumn', 'Word')}</th>
                      <th className="text-right p-2 font-medium">{t('Tools.word-frequency.countColumn', 'Count')}</th>
                      <th className="text-right p-2 font-medium">%</th>
                      <th className="p-2 w-32"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.slice(0, 100).map((item, index) => (
                      <tr key={index} className="border-t" data-testid={`row-word-${index}`}>
                        <td className="p-2 font-mono">{item.word}</td>
                        <td className="p-2 text-right">{item.count}</td>
                        <td className="p-2 text-right text-muted-foreground">{item.percentage.toFixed(1)}%</td>
                        <td className="p-2">
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${Math.min(100, item.percentage * 5)}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {results.length > 100 && (
                  <div className="p-2 text-center text-sm text-muted-foreground border-t">
                    {t('Tools.word-frequency.showingTop', 'Showing top 100 of {{count}} words', { count: results.length })}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
