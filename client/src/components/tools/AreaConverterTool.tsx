import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const units = {
  sqm: { name: 'Square Meters', toSqm: 1 },
  sqft: { name: 'Square Feet', toSqm: 0.092903 },
  sqyd: { name: 'Square Yards', toSqm: 0.836127 },
  acre: { name: 'Acres', toSqm: 4046.86 },
  hectare: { name: 'Hectares', toSqm: 10000 },
  sqmi: { name: 'Square Miles', toSqm: 2589988.11 },
};

type UnitKey = keyof typeof units;

export default function AreaConverterTool() {
  const { t } = useTranslation();
  const tk = (key: string) => t(`Tools.area-converter.${key}`);

  const [value, setValue] = useState('');
  const [fromUnit, setFromUnit] = useState<UnitKey>('sqm');
  const [toUnit, setToUnit] = useState<UnitKey>('sqft');

  const convert = () => {
    const num = parseFloat(value);
    if (isNaN(num)) return '';
    const inSqm = num * units[fromUnit].toSqm;
    const result = inSqm / units[toUnit].toSqm;
    return result.toLocaleString('en-US', { maximumFractionDigits: 6 });
  };

  const result = convert();

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label>{tk('value')}</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="100"
              data-testid="input-value"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{tk('from')}</Label>
              <Select value={fromUnit} onValueChange={(v) => setFromUnit(v as UnitKey)}>
                <SelectTrigger data-testid="select-from">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(units).map(([key, { name }]) => (
                    <SelectItem key={key} value={key}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{tk('to')}</Label>
              <Select value={toUnit} onValueChange={(v) => setToUnit(v as UnitKey)}>
                <SelectTrigger data-testid="select-to">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(units).map(([key, { name }]) => (
                    <SelectItem key={key} value={key}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-sm text-muted-foreground">{tk('result')}</div>
            <div className="text-3xl font-bold my-2" data-testid="result">
              {result} {units[toUnit].name}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
