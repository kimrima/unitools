import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
];

export default function LoremIpsumTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [output, setOutput] = useState('');
  const [count, setCount] = useState(3);
  const [type, setType] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');

  const generateWord = () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];

  const generateSentence = (minWords = 8, maxWords = 15) => {
    const wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
    const words = Array.from({ length: wordCount }, generateWord);
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    return words.join(' ') + '.';
  };

  const generateParagraph = (minSentences = 4, maxSentences = 8) => {
    const sentenceCount = Math.floor(Math.random() * (maxSentences - minSentences + 1)) + minSentences;
    return Array.from({ length: sentenceCount }, () => generateSentence()).join(' ');
  };

  const generate = () => {
    let result = '';
    
    switch (type) {
      case 'paragraphs':
        result = Array.from({ length: count }, () => generateParagraph()).join('\n\n');
        break;
      case 'sentences':
        result = Array.from({ length: count }, () => generateSentence()).join(' ');
        break;
      case 'words':
        result = Array.from({ length: count }, generateWord).join(' ');
        result = result.charAt(0).toUpperCase() + result.slice(1) + '.';
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

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm whitespace-nowrap">
                {t('Tools.lorem-ipsum.countLabel')}
              </Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                className="w-20"
                data-testid="input-count"
              />
            </div>
            
            <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
              <SelectTrigger className="w-40" data-testid="select-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paragraphs">{t('Tools.lorem-ipsum.paragraphs')}</SelectItem>
                <SelectItem value="sentences">{t('Tools.lorem-ipsum.sentences')}</SelectItem>
                <SelectItem value="words">{t('Tools.lorem-ipsum.words')}</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={generate} data-testid="button-generate">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('Tools.lorem-ipsum.generate')}
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                {t('Tools.lorem-ipsum.outputLabel')}
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
              className="min-h-[300px] text-sm resize-none bg-muted/30"
              placeholder={t('Tools.lorem-ipsum.placeholder')}
              data-testid="textarea-output"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
