import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const volumeUnits = {
  ml: { name: 'Milliliters', toMl: 1 },
  l: { name: 'Liters', toMl: 1000 },
  gal: { name: 'US Gallons', toMl: 3785.41 },
  qt: { name: 'US Quarts', toMl: 946.353 },
  pt: { name: 'US Pints', toMl: 473.176 },
  cup: { name: 'US Cups', toMl: 236.588 },
  floz: { name: 'US Fluid Oz', toMl: 29.5735 },
  tbsp: { name: 'Tablespoons', toMl: 14.7868 },
  tsp: { name: 'Teaspoons', toMl: 4.92892 },
};

type UnitKey = keyof typeof volumeUnits;

export default function VolumeConverterTool() {
  const { t } = useTranslation();
  const tk = (key: string) => t(`Tools.volume-converter.${key}`);

  const [value, setValue] = useState('');
  const [fromUnit, setFromUnit] = useState<UnitKey>('l');
  const [toUnit, setToUnit] = useState<UnitKey>('gal');

  const convert = () => {
    const num = parseFloat(value);
    if (isNaN(num)) return '';
    const inMl = num * volumeUnits[fromUnit].toMl;
    const result = inMl / volumeUnits[toUnit].toMl;
    return result.toLocaleString('en-US', { maximumFractionDigits: 4 });
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
              placeholder="1"
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
                  {Object.entries(volumeUnits).map(([key, { name }]) => (
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
                  {Object.entries(volumeUnits).map(([key, { name }]) => (
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
              {result} {volumeUnits[toUnit].name}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-1">
            <p>1 L = 0.264 gal</p>
            <p>1 cup = 8 fl oz = 16 tbsp</p>
            <p>1 tbsp = 3 tsp</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
