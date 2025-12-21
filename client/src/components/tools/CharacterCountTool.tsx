import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CharacterCountTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text ? text.split('\n').length : 0;
    const paragraphs = text.trim() ? text.trim().split(/\n\n+/).length : 0;
    const sentences = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0;
    const bytes = new TextEncoder().encode(text).length;
    
    return { chars, charsNoSpaces, words, lines, paragraphs, sentences, bytes };
  }, [text]);

  const handleCopy = async () => {
    const statsText = `${t('Tools.character-count.characters')}: ${stats.chars}
${t('Tools.character-count.charactersNoSpaces')}: ${stats.charsNoSpaces}
${t('Tools.character-count.words')}: ${stats.words}
${t('Tools.character-count.lines')}: ${stats.lines}
${t('Tools.character-count.paragraphs')}: ${stats.paragraphs}
${t('Tools.character-count.sentences')}: ${stats.sentences}
${t('Tools.character-count.bytes')}: ${stats.bytes}`;
    
    await navigator.clipboard.writeText(statsText);
    toast({
      title: t('Common.messages.complete'),
      description: t('Tools.character-count.statsCopied'),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {t('Tools.character-count.inputLabel')}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setText('')}
                  disabled={!text}
                  data-testid="button-clear-text"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                placeholder={t('Tools.character-count.placeholder')}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[300px] font-mono text-sm resize-none"
                data-testid="textarea-input"
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {t('Tools.character-count.statsLabel')}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  data-testid="button-copy-stats"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label={t('Tools.character-count.characters')}
                  value={stats.chars}
                  testId="stat-chars"
                />
                <StatCard
                  label={t('Tools.character-count.charactersNoSpaces')}
                  value={stats.charsNoSpaces}
                  testId="stat-chars-no-spaces"
                />
                <StatCard
                  label={t('Tools.character-count.words')}
                  value={stats.words}
                  testId="stat-words"
                />
                <StatCard
                  label={t('Tools.character-count.lines')}
                  value={stats.lines}
                  testId="stat-lines"
                />
                <StatCard
                  label={t('Tools.character-count.paragraphs')}
                  value={stats.paragraphs}
                  testId="stat-paragraphs"
                />
                <StatCard
                  label={t('Tools.character-count.sentences')}
                  value={stats.sentences}
                  testId="stat-sentences"
                />
                <StatCard
                  label={t('Tools.character-count.bytes')}
                  value={stats.bytes}
                  testId="stat-bytes"
                  className="col-span-2"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  testId,
  className = '' 
}: { 
  label: string; 
  value: number; 
  testId: string;
  className?: string;
}) {
  return (
    <div 
      className={`p-4 rounded-md bg-muted/50 ${className}`}
      data-testid={testId}
    >
      <div className="text-2xl font-bold tabular-nums">
        {value.toLocaleString()}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
