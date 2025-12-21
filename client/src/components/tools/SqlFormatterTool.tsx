import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Database, Wand2, Minimize2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 'HAVING',
  'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'FULL JOIN',
  'ON', 'AS', 'IN', 'NOT', 'NULL', 'IS', 'LIKE', 'BETWEEN', 'EXISTS',
  'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE',
  'ALTER TABLE', 'DROP TABLE', 'CREATE INDEX', 'DROP INDEX', 'UNION',
  'LIMIT', 'OFFSET', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'WITH', 'OVER', 'PARTITION BY'
];

function formatSQL(sql: string, indentSize: number = 2): string {
  let formatted = sql.trim();
  const indent = ' '.repeat(indentSize);
  
  formatted = formatted.replace(/\s+/g, ' ');
  
  const majorKeywords = ['SELECT', 'FROM', 'WHERE', 'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION'];
  majorKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    formatted = formatted.replace(regex, `\n${keyword}`);
  });
  
  const joinKeywords = ['LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'FULL JOIN', 'JOIN'];
  joinKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    formatted = formatted.replace(regex, `\n${indent}${keyword}`);
  });
  
  formatted = formatted.replace(/\bAND\b/gi, `\n${indent}AND`);
  formatted = formatted.replace(/\bOR\b/gi, `\n${indent}OR`);
  
  formatted = formatted.replace(/,\s*/g, ',\n' + indent + indent);
  
  formatted = formatted.trim();
  
  const lines = formatted.split('\n');
  const result: string[] = [];
  let currentIndent = 0;
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    
    if (trimmed.match(/^(FROM|WHERE|ORDER BY|GROUP BY|HAVING)/i)) {
      currentIndent = 0;
    } else if (trimmed.match(/^(AND|OR)/i)) {
      currentIndent = 1;
    } else if (trimmed.match(/^(LEFT|RIGHT|INNER|OUTER|FULL|JOIN)/i)) {
      currentIndent = 1;
    } else if (!trimmed.match(/^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|WITH|UNION)/i)) {
      currentIndent = 2;
    } else {
      currentIndent = 0;
    }
    
    result.push(indent.repeat(currentIndent) + trimmed);
  });
  
  return result.join('\n');
}

function minifySQL(sql: string): string {
  return sql.replace(/\s+/g, ' ').trim();
}

export default function SqlFormatterTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indentSize, setIndentSize] = useState('2');

  const handleFormat = () => {
    if (!input) return;
    setOutput(formatSQL(input, parseInt(indentSize)));
  };

  const handleMinify = () => {
    if (!input) return;
    setOutput(minifySQL(input));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast({ title: t('Common.actions.copy') + '!' });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Database className="w-4 h-4" />
          {t('Tools.sql-formatter.inputLabel')}
        </Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('Tools.sql-formatter.placeholder')}
          className="min-h-32 font-mono text-sm"
          data-testid="input-sql"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label className="text-sm">{t('Tools.sql-formatter.indentLabel')}</Label>
          <Select value={indentSize} onValueChange={setIndentSize}>
            <SelectTrigger className="w-24" data-testid="select-indent">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 {t('Tools.sql-formatter.spaces')}</SelectItem>
              <SelectItem value="4">4 {t('Tools.sql-formatter.spaces')}</SelectItem>
              <SelectItem value="8">8 {t('Tools.sql-formatter.spaces')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 ml-auto">
          <Button onClick={handleFormat} disabled={!input} data-testid="button-format">
            <Wand2 className="w-4 h-4 mr-2" />
            {t('Tools.sql-formatter.format')}
          </Button>
          <Button variant="outline" onClick={handleMinify} disabled={!input} data-testid="button-minify">
            <Minimize2 className="w-4 h-4 mr-2" />
            {t('Tools.sql-formatter.minify')}
          </Button>
        </div>
      </div>

      {output && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{t('Tools.sql-formatter.outputLabel')}</Label>
            <Button size="sm" variant="ghost" onClick={copyToClipboard} data-testid="button-copy">
              <Copy className="w-4 h-4 mr-1" />
              {t('Common.actions.copy')}
            </Button>
          </div>
          <pre className="p-4 bg-muted/50 rounded-md font-mono text-sm overflow-x-auto whitespace-pre-wrap">
            {output}
          </pre>
        </div>
      )}

      {!input && !output && (
        <div className="text-center py-8 text-muted-foreground">
          {t('Tools.sql-formatter.empty')}
        </div>
      )}
    </div>
  );
}
