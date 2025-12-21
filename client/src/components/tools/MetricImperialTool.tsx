import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ConversionType = 'length' | 'weight' | 'distance';

const conversions = {
  length: {
    metric: 'cm',
    imperial: 'in',
    toImperial: (v: number) => v / 2.54,
    toMetric: (v: number) => v * 2.54,
  },
  weight: {
    metric: 'kg',
    imperial: 'lbs',
    toImperial: (v: number) => v * 2.20462,
    toMetric: (v: number) => v / 2.20462,
  },
  distance: {
    metric: 'km',
    imperial: 'mi',
    toImperial: (v: number) => v * 0.621371,
    toMetric: (v: number) => v / 0.621371,
  },
};

export default function MetricImperialTool() {
  const { t } = useTranslation();
  const tk = (key: string) => t(`Tools.metric-imperial.${key}`);

  const [type, setType] = useState<ConversionType>('length');
  const [metricValue, setMetricValue] = useState('');
  const [imperialValue, setImperialValue] = useState('');
  const [direction, setDirection] = useState<'toImperial' | 'toMetric'>('toImperial');

  const conv = conversions[type];

  const handleMetricChange = (value: string) => {
    setMetricValue(value);
    setDirection('toImperial');
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setImperialValue(conv.toImperial(num).toFixed(4));
    } else {
      setImperialValue('');
    }
  };

  const handleImperialChange = (value: string) => {
    setImperialValue(value);
    setDirection('toMetric');
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setMetricValue(conv.toMetric(num).toFixed(4));
    } else {
      setMetricValue('');
    }
  };

  const swap = () => {
    if (direction === 'toImperial') {
      setDirection('toMetric');
    } else {
      setDirection('toImperial');
    }
  };

  const handleTypeChange = (newType: string) => {
    setType(newType as ConversionType);
    setMetricValue('');
    setImperialValue('');
  };

  return (
    <div className="space-y-6">
      <Tabs value={type} onValueChange={handleTypeChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="length" data-testid="tab-length">{tk('length')}</TabsTrigger>
          <TabsTrigger value="weight" data-testid="tab-weight">{tk('weight')}</TabsTrigger>
          <TabsTrigger value="distance" data-testid="tab-distance">{tk('distance')}</TabsTrigger>
        </TabsList>

        {(['length', 'weight', 'distance'] as ConversionType[]).map((t) => (
          <TabsContent key={t} value={t} className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-1 w-full space-y-2">
                    <Label>{tk('metric')} ({conversions[t].metric})</Label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={metricValue}
                      onChange={(e) => handleMetricChange(e.target.value)}
                      placeholder="0"
                      data-testid="input-metric"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={swap}
                    className="shrink-0 mt-6 sm:mt-0"
                    data-testid="btn-swap"
                  >
                    <ArrowRightLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 w-full space-y-2">
                    <Label>{tk('imperial')} ({conversions[t].imperial})</Label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={imperialValue}
                      onChange={(e) => handleImperialChange(e.target.value)}
                      placeholder="0"
                      data-testid="input-imperial"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-1">
            <p>1 cm = 0.3937 in</p>
            <p>1 kg = 2.2046 lbs</p>
            <p>1 km = 0.6214 mi</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
