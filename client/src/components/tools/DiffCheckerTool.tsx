import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';

interface DiffLine {
  type: 'equal' | 'add' | 'remove';
  text: string;
  lineNum1?: number;
  lineNum2?: number;
}

export default function DiffCheckerTool() {
  const { t } = useTranslation();
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');

  const diff = useMemo((): DiffLine[] => {
    if (!text1 && !text2) return [];
    
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const result: DiffLine[] = [];
    
    const maxLen = Math.max(lines1.length, lines2.length);
    let lineNum1 = 0;
    let lineNum2 = 0;
    
    for (let i = 0; i < maxLen; i++) {
      const line1 = lines1[i];
      const line2 = lines2[i];
      
      if (line1 === undefined) {
        lineNum2++;
        result.push({ type: 'add', text: line2, lineNum2 });
      } else if (line2 === undefined) {
        lineNum1++;
        result.push({ type: 'remove', text: line1, lineNum1 });
      } else if (line1 === line2) {
        lineNum1++;
        lineNum2++;
        result.push({ type: 'equal', text: line1, lineNum1, lineNum2 });
      } else {
        lineNum1++;
        result.push({ type: 'remove', text: line1, lineNum1 });
        lineNum2++;
        result.push({ type: 'add', text: line2, lineNum2 });
      }
    }
    
    return result;
  }, [text1, text2]);

  const stats = useMemo(() => {
    const added = diff.filter(d => d.type === 'add').length;
    const removed = diff.filter(d => d.type === 'remove').length;
    const unchanged = diff.filter(d => d.type === 'equal').length;
    return { added, removed, unchanged };
  }, [diff]);

  const handleReset = () => {
    setText1('');
    setText2('');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {t('Tools.diff-checker.text1Label')}
                </span>
              </div>
              <Textarea
                placeholder={t('Tools.diff-checker.text1Placeholder')}
                value={text1}
                onChange={(e) => setText1(e.target.value)}
                className="min-h-[200px] font-mono text-sm resize-none"
                data-testid="textarea-text1"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {t('Tools.diff-checker.text2Label')}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReset}
                  disabled={!text1 && !text2}
                  data-testid="button-clear"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                placeholder={t('Tools.diff-checker.text2Placeholder')}
                value={text2}
                onChange={(e) => setText2(e.target.value)}
                className="min-h-[200px] font-mono text-sm resize-none"
                data-testid="textarea-text2"
              />
            </div>
          </div>
          
          {(text1 || text2) && (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  {t('Tools.diff-checker.added')}: {stats.added}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  {t('Tools.diff-checker.removed')}: {stats.removed}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                  {t('Tools.diff-checker.unchanged')}: {stats.unchanged}
                </Badge>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[400px] overflow-auto">
                  {diff.map((line, i) => (
                    <div
                      key={i}
                      className={`flex font-mono text-sm ${
                        line.type === 'add'
                          ? 'bg-green-500/10 dark:bg-green-500/20'
                          : line.type === 'remove'
                          ? 'bg-red-500/10 dark:bg-red-500/20'
                          : ''
                      }`}
                    >
                      <div className="w-8 shrink-0 text-center py-1 text-muted-foreground text-xs border-r select-none">
                        {line.lineNum1 || ''}
                      </div>
                      <div className="w-8 shrink-0 text-center py-1 text-muted-foreground text-xs border-r select-none">
                        {line.lineNum2 || ''}
                      </div>
                      <div className="w-6 shrink-0 text-center py-1 font-bold select-none">
                        {line.type === 'add' && <span className="text-green-600">+</span>}
                        {line.type === 'remove' && <span className="text-red-600">-</span>}
                      </div>
                      <div className="flex-1 py-1 px-2 whitespace-pre-wrap break-all">
                        {line.text || ' '}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
