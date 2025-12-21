import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function BmrCalculatorTool() {
  const { t } = useTranslation();
  const tk = (key: string) => t(`Tools.bmr-calculator.${key}`);

  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState('30');
  const [heightCm, setHeightCm] = useState('170');
  const [weightKg, setWeightKg] = useState('70');
  const [heightFt, setHeightFt] = useState('5');
  const [heightIn, setHeightIn] = useState('7');
  const [weightLbs, setWeightLbs] = useState('154');
  const [activity, setActivity] = useState('1.2');

  const calculateBMR = () => {
    let weight: number, height: number;
    const ageNum = parseFloat(age);

    if (unit === 'metric') {
      weight = parseFloat(weightKg);
      height = parseFloat(heightCm);
    } else {
      weight = parseFloat(weightLbs) * 0.453592;
      height = (parseFloat(heightFt) * 12 + parseFloat(heightIn)) * 2.54;
    }

    if (isNaN(weight) || isNaN(height) || isNaN(ageNum) || weight <= 0 || height <= 0 || ageNum <= 0) {
      return null;
    }

    let bmr: number;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * ageNum);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * ageNum);
    }

    const activityMultiplier = parseFloat(activity);
    const tdee = bmr * activityMultiplier;

    return { bmr: Math.round(bmr), tdee: Math.round(tdee) };
  };

  const result = calculateBMR();

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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{tk('gender')}</Label>
                  <Select value={gender} onValueChange={(v) => setGender(v as 'male' | 'female')}>
                    <SelectTrigger data-testid="select-gender">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{tk('male')}</SelectItem>
                      <SelectItem value="female">{tk('female')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{tk('age')}</Label>
                  <Input type="number" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} data-testid="input-age" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{tk('height')} (cm)</Label>
                <Input type="number" inputMode="decimal" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} data-testid="input-height" />
              </div>
              <div className="space-y-2">
                <Label>{tk('weight')} (kg)</Label>
                <Input type="number" inputMode="decimal" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} data-testid="input-weight" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="imperial" className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{tk('gender')}</Label>
                  <Select value={gender} onValueChange={(v) => setGender(v as 'male' | 'female')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{tk('male')}</SelectItem>
                      <SelectItem value="female">{tk('female')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{tk('age')}</Label>
                  <Input type="number" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{tk('height')}</Label>
                <div className="flex gap-2">
                  <Input type="number" inputMode="numeric" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} placeholder="ft" />
                  <Input type="number" inputMode="numeric" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} placeholder="in" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{tk('weight')} (lbs)</Label>
                <Input type="number" inputMode="decimal" value={weightLbs} onChange={(e) => setWeightLbs(e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent className="pt-6 space-y-2">
          <Label>{tk('activity')}</Label>
          <Select value={activity} onValueChange={setActivity}>
            <SelectTrigger data-testid="select-activity">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1.2">{tk('sedentary')}</SelectItem>
              <SelectItem value="1.375">{tk('light')}</SelectItem>
              <SelectItem value="1.55">{tk('moderate')}</SelectItem>
              <SelectItem value="1.725">{tk('active')}</SelectItem>
              <SelectItem value="1.9">{tk('veryActive')}</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-muted rounded-md">
                <div className="text-sm text-muted-foreground">{tk('bmr')}</div>
                <div className="text-3xl font-bold" data-testid="bmr-result">{result.bmr}</div>
                <div className="text-sm text-muted-foreground">{tk('calDay')}</div>
              </div>
              <div className="p-4 bg-muted rounded-md">
                <div className="text-sm text-muted-foreground">{tk('tdee')}</div>
                <div className="text-3xl font-bold" data-testid="tdee-result">{result.tdee}</div>
                <div className="text-sm text-muted-foreground">{tk('calDay')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
