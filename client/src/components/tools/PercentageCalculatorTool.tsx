import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PercentageCalculatorTool() {
  const { t } = useTranslation();
  const tk = (key: string) => t(`Tools.percentage-calculator.${key}`);

  const [mode, setMode] = useState<'whatIs' | 'percentOf' | 'change'>('whatIs');
  const [value1, setValue1] = useState('');
  const [value2, setValue2] = useState('');

  const calculateResult = () => {
    const v1 = parseFloat(value1);
    const v2 = parseFloat(value2);
    if (isNaN(v1) || isNaN(v2)) return '';

    switch (mode) {
      case 'whatIs':
        return ((v1 / 100) * v2).toFixed(2);
      case 'percentOf':
        if (v2 === 0) return '0';
        return ((v1 / v2) * 100).toFixed(2);
      case 'change':
        if (v1 === 0) return '0';
        return (((v2 - v1) / v1) * 100).toFixed(2);
      default:
        return '';
    }
  };

  const result = calculateResult();

  return (
    <div className="space-y-6">
      <Tabs value={mode} onValueChange={(v) => { setMode(v as typeof mode); setValue1(''); setValue2(''); }}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="whatIs" data-testid="tab-what-is">{tk('whatIs')}</TabsTrigger>
          <TabsTrigger value="percentOf" data-testid="tab-percent-of">{tk('percentOf')}</TabsTrigger>
          <TabsTrigger value="change" data-testid="tab-change">{tk('change')}</TabsTrigger>
        </TabsList>

        <TabsContent value="whatIs" className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span>{tk('whatIsPrefix')}</span>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={value1}
                  onChange={(e) => setValue1(e.target.value)}
                  className="w-24"
                  placeholder="10"
                  data-testid="input-percent"
                />
                <span>% {tk('of')}</span>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={value2}
                  onChange={(e) => setValue2(e.target.value)}
                  className="w-28"
                  placeholder="200"
                  data-testid="input-value"
                />
                <span>?</span>
              </div>
              {result && (
                <div className="text-2xl font-bold text-center p-4 bg-muted rounded-md" data-testid="result">
                  = {result}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="percentOf" className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Input
                  type="number"
                  inputMode="decimal"
                  value={value1}
                  onChange={(e) => setValue1(e.target.value)}
                  className="w-24"
                  placeholder="25"
                  data-testid="input-part"
                />
                <span>{tk('isWhatPercent')}</span>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={value2}
                  onChange={(e) => setValue2(e.target.value)}
                  className="w-28"
                  placeholder="100"
                  data-testid="input-whole"
                />
                <span>?</span>
              </div>
              {result && (
                <div className="text-2xl font-bold text-center p-4 bg-muted rounded-md" data-testid="result">
                  = {result}%
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="change" className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{tk('from')}</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={value1}
                    onChange={(e) => setValue1(e.target.value)}
                    placeholder="100"
                    data-testid="input-from"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{tk('to')}</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={value2}
                    onChange={(e) => setValue2(e.target.value)}
                    placeholder="150"
                    data-testid="input-to"
                  />
                </div>
              </div>
              {result && (
                <div className="text-2xl font-bold text-center p-4 bg-muted rounded-md" data-testid="result">
                  {parseFloat(result) >= 0 ? '+' : ''}{result}%
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
