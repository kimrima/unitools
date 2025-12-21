import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { RefreshCw, Copy, Check, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FIRST_NAMES_EN = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Emma', 'Olivia', 'Ava', 'Sophia', 'Liam', 'Noah', 'Oliver', 'Elijah'];
const LAST_NAMES_EN = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
const FIRST_NAMES_KO = ['민준', '서연', '예준', '서윤', '도윤', '지우', '시우', '지유', '주원', '하윤', '지호', '하은', '준서', '유나', '건우', '수아', '현우', '지민', '준우', '채원', '성민', '유진', '승현', '소연'];
const LAST_NAMES_KO = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '류', '홍'];

type NameType = 'en' | 'ko' | 'fantasy';

export default function RandomNameTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [nameType, setNameType] = useState<NameType>('en');
  const [count, setCount] = useState(5);
  const [names, setNames] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const generateFantasyName = (): string => {
    const prefixes = ['Ara', 'El', 'Tha', 'Mor', 'Zan', 'Dra', 'Lor', 'Kel', 'Val', 'Rin', 'Syl', 'Tal', 'Gor', 'Xen', 'Fay'];
    const middles = ['an', 'or', 'en', 'ar', 'in', 'el', 'on', 'is', 'us', 'ia'];
    const suffixes = ['dor', 'wyn', 'mir', 'wen', 'gon', 'dra', 'lia', 'ris', 'vex', 'thos', 'ra', 'na', 'don'];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const middle = Math.random() > 0.5 ? middles[Math.floor(Math.random() * middles.length)] : '';
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    return prefix + middle + suffix;
  };

  const generateNames = () => {
    const generated: string[] = [];
    
    for (let i = 0; i < count; i++) {
      if (nameType === 'en') {
        const first = FIRST_NAMES_EN[Math.floor(Math.random() * FIRST_NAMES_EN.length)];
        const last = LAST_NAMES_EN[Math.floor(Math.random() * LAST_NAMES_EN.length)];
        generated.push(`${first} ${last}`);
      } else if (nameType === 'ko') {
        const first = FIRST_NAMES_KO[Math.floor(Math.random() * FIRST_NAMES_KO.length)];
        const last = LAST_NAMES_KO[Math.floor(Math.random() * LAST_NAMES_KO.length)];
        generated.push(`${last}${first}`);
      } else {
        generated.push(generateFantasyName());
      }
    }
    
    setNames(generated);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(names.join('\n'));
    setCopied(true);
    toast({ title: t('Common.messages.copied') || 'Copied!' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <Label>{t('Tools.random-name.nameType') || 'Name Type'}</Label>
          <Select value={nameType} onValueChange={(v) => setNameType(v as NameType)}>
            <SelectTrigger data-testid="select-name-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">{t('Tools.random-name.english') || 'English Names'}</SelectItem>
              <SelectItem value="ko">{t('Tools.random-name.korean') || 'Korean Names'}</SelectItem>
              <SelectItem value="fantasy">{t('Tools.random-name.fantasy') || 'Fantasy Names'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t('Tools.random-name.count') || 'Number of Names'}: {count}</Label>
          <Slider
            value={[count]}
            onValueChange={([v]) => setCount(v)}
            min={1}
            max={20}
            step={1}
            data-testid="slider-count"
          />
        </div>

        <Button onClick={generateNames} className="w-full" data-testid="button-generate">
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('Tools.random-name.generate') || 'Generate Names'}
        </Button>
      </Card>

      {names.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">{t('Tools.random-name.results') || 'Generated Names'}</span>
            </div>
            <Button variant="outline" size="sm" onClick={copyAll} data-testid="button-copy-all">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <div className="space-y-2">
            {names.map((name, i) => (
              <div key={i} className="p-3 bg-muted rounded-md font-medium" data-testid={`text-name-${i}`}>
                {name}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
