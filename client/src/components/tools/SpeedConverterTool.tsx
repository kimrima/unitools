import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SpeedConverterTool() {
  const { t } = useTranslation();
  const tk = (key: string) => t(`Tools.speed-converter.${key}`);

  const [kmh, setKmh] = useState('');
  const [mph, setMph] = useState('');
  const [mps, setMps] = useState('');
  const [knots, setKnots] = useState('');

  const handleKmhChange = (value: string) => {
    setKmh(value);
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setMph((num * 0.621371).toFixed(2));
      setMps((num / 3.6).toFixed(2));
      setKnots((num * 0.539957).toFixed(2));
    } else {
      setMph('');
      setMps('');
      setKnots('');
    }
  };

  const handleMphChange = (value: string) => {
    setMph(value);
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setKmh((num / 0.621371).toFixed(2));
      setMps((num * 0.44704).toFixed(2));
      setKnots((num * 0.868976).toFixed(2));
    } else {
      setKmh('');
      setMps('');
      setKnots('');
    }
  };

  const handleMpsChange = (value: string) => {
    setMps(value);
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setKmh((num * 3.6).toFixed(2));
      setMph((num * 2.23694).toFixed(2));
      setKnots((num * 1.94384).toFixed(2));
    } else {
      setKmh('');
      setMph('');
      setKnots('');
    }
  };

  const handleKnotsChange = (value: string) => {
    setKnots(value);
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setKmh((num / 0.539957).toFixed(2));
      setMph((num / 0.868976).toFixed(2));
      setMps((num / 1.94384).toFixed(2));
    } else {
      setKmh('');
      setMph('');
      setMps('');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label>{tk('kmh')} (km/h)</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={kmh}
              onChange={(e) => handleKmhChange(e.target.value)}
              placeholder="100"
              data-testid="input-kmh"
            />
          </div>
          <div className="space-y-2">
            <Label>{tk('mph')} (mph)</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={mph}
              onChange={(e) => handleMphChange(e.target.value)}
              placeholder="62.14"
              data-testid="input-mph"
            />
          </div>
          <div className="space-y-2">
            <Label>{tk('mps')} (m/s)</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={mps}
              onChange={(e) => handleMpsChange(e.target.value)}
              placeholder="27.78"
              data-testid="input-mps"
            />
          </div>
          <div className="space-y-2">
            <Label>{tk('knots')} (kn)</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={knots}
              onChange={(e) => handleKnotsChange(e.target.value)}
              placeholder="54"
              data-testid="input-knots"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-1">
            <p>1 km/h = 0.621 mph</p>
            <p>1 mph = 1.609 km/h</p>
            <p>1 m/s = 3.6 km/h</p>
            <p>1 knot = 1.852 km/h</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
