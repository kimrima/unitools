import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TemperatureConverterTool() {
  const { t } = useTranslation();
  const tk = (key: string) => t(`Tools.temperature-converter.${key}`);

  const [celsius, setCelsius] = useState('');
  const [fahrenheit, setFahrenheit] = useState('');
  const [kelvin, setKelvin] = useState('');

  const handleCelsiusChange = (value: string) => {
    setCelsius(value);
    const c = parseFloat(value);
    if (!isNaN(c)) {
      setFahrenheit(((c * 9/5) + 32).toFixed(2));
      setKelvin((c + 273.15).toFixed(2));
    } else {
      setFahrenheit('');
      setKelvin('');
    }
  };

  const handleFahrenheitChange = (value: string) => {
    setFahrenheit(value);
    const f = parseFloat(value);
    if (!isNaN(f)) {
      const c = (f - 32) * 5/9;
      setCelsius(c.toFixed(2));
      setKelvin((c + 273.15).toFixed(2));
    } else {
      setCelsius('');
      setKelvin('');
    }
  };

  const handleKelvinChange = (value: string) => {
    setKelvin(value);
    const k = parseFloat(value);
    if (!isNaN(k)) {
      const c = k - 273.15;
      setCelsius(c.toFixed(2));
      setFahrenheit(((c * 9/5) + 32).toFixed(2));
    } else {
      setCelsius('');
      setFahrenheit('');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label>{tk('celsius')} (°C)</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={celsius}
              onChange={(e) => handleCelsiusChange(e.target.value)}
              placeholder="0"
              data-testid="input-celsius"
            />
          </div>
          <div className="space-y-2">
            <Label>{tk('fahrenheit')} (°F)</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={fahrenheit}
              onChange={(e) => handleFahrenheitChange(e.target.value)}
              placeholder="32"
              data-testid="input-fahrenheit"
            />
          </div>
          <div className="space-y-2">
            <Label>{tk('kelvin')} (K)</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={kelvin}
              onChange={(e) => handleKelvinChange(e.target.value)}
              placeholder="273.15"
              data-testid="input-kelvin"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-1">
            <p>0°C = 32°F = 273.15K ({tk('freezing')})</p>
            <p>100°C = 212°F = 373.15K ({tk('boiling')})</p>
            <p>-40°C = -40°F ({tk('same')})</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
