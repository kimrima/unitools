import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function BmiCalculatorTool() {
  const { t } = useTranslation();
  const tk = (key: string) => t(`Tools.bmi-calculator.${key}`);

  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [weightLbs, setWeightLbs] = useState('');

  const calculateBMI = () => {
    if (unit === 'metric') {
      const h = parseFloat(heightCm) / 100;
      const w = parseFloat(weightKg);
      if (h > 0 && w > 0) {
        return w / (h * h);
      }
    } else {
      const totalInches = (parseFloat(heightFt) || 0) * 12 + (parseFloat(heightIn) || 0);
      const w = parseFloat(weightLbs);
      if (totalInches > 0 && w > 0) {
        return (w / (totalInches * totalInches)) * 703;
      }
    }
    return null;
  };

  const bmi = calculateBMI();

  const getCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: tk('underweight'), color: 'text-blue-500' };
    if (bmi < 25) return { label: tk('normal'), color: 'text-green-500' };
    if (bmi < 30) return { label: tk('overweight'), color: 'text-yellow-500' };
    return { label: tk('obese'), color: 'text-red-500' };
  };

  const category = bmi ? getCategory(bmi) : null;

  return (
    <div className="space-y-6">
      <Tabs value={unit} onValueChange={(v) => setUnit(v as 'metric' | 'imperial')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="metric" data-testid="tab-metric">{tk('metric')}</TabsTrigger>
          <TabsTrigger value="imperial" data-testid="tab-imperial">{tk('imperial')}</TabsTrigger>
        </TabsList>

        <TabsContent value="metric" className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>{tk('height')} (cm)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="170"
                  data-testid="input-height-cm"
                />
              </div>
              <div className="space-y-2">
                <Label>{tk('weight')} (kg)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="70"
                  data-testid="input-weight-kg"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="imperial" className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>{tk('height')}</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={heightFt}
                      onChange={(e) => setHeightFt(e.target.value)}
                      placeholder="5"
                      data-testid="input-height-ft"
                    />
                    <span className="text-xs text-muted-foreground">ft</span>
                  </div>
                  <div className="flex-1">
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={heightIn}
                      onChange={(e) => setHeightIn(e.target.value)}
                      placeholder="10"
                      data-testid="input-height-in"
                    />
                    <span className="text-xs text-muted-foreground">in</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{tk('weight')} (lbs)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={weightLbs}
                  onChange={(e) => setWeightLbs(e.target.value)}
                  placeholder="154"
                  data-testid="input-weight-lbs"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {bmi !== null && (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-sm text-muted-foreground">{tk('yourBmi')}</div>
            <div className="text-5xl font-bold my-2" data-testid="bmi-result">
              {bmi.toFixed(1)}
            </div>
            <div className={`text-lg font-semibold ${category?.color}`} data-testid="bmi-category">
              {category?.label}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-1">
            <p>&lt; 18.5: {tk('underweight')}</p>
            <p>18.5 - 24.9: {tk('normal')}</p>
            <p>25 - 29.9: {tk('overweight')}</p>
            <p>&gt;= 30: {tk('obese')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
