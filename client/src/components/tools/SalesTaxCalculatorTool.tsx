import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const usTaxRates: Record<string, number> = {
  'AL': 4.0, 'AK': 0.0, 'AZ': 5.6, 'AR': 6.5, 'CA': 7.25,
  'CO': 2.9, 'CT': 6.35, 'DE': 0.0, 'FL': 6.0, 'GA': 4.0,
  'HI': 4.0, 'ID': 6.0, 'IL': 6.25, 'IN': 7.0, 'IA': 6.0,
  'KS': 6.5, 'KY': 6.0, 'LA': 4.45, 'ME': 5.5, 'MD': 6.0,
  'MA': 6.25, 'MI': 6.0, 'MN': 6.875, 'MS': 7.0, 'MO': 4.225,
  'MT': 0.0, 'NE': 5.5, 'NV': 6.85, 'NH': 0.0, 'NJ': 6.625,
  'NM': 4.875, 'NY': 4.0, 'NC': 4.75, 'ND': 5.0, 'OH': 5.75,
  'OK': 4.5, 'OR': 0.0, 'PA': 6.0, 'RI': 7.0, 'SC': 6.0,
  'SD': 4.2, 'TN': 7.0, 'TX': 6.25, 'UT': 6.1, 'VT': 6.0,
  'VA': 5.3, 'WA': 6.5, 'WV': 6.0, 'WI': 5.0, 'WY': 4.0,
};

const euVatRates: Record<string, number> = {
  'DE': 19, 'FR': 20, 'IT': 22, 'ES': 21, 'NL': 21,
  'BE': 21, 'AT': 20, 'PT': 23, 'SE': 25, 'DK': 25,
  'FI': 24, 'IE': 23, 'PL': 23, 'CZ': 21, 'GR': 24,
  'HU': 27, 'RO': 19, 'UK': 20,
};

export default function SalesTaxCalculatorTool() {
  const { t } = useTranslation();
  const tk = (key: string) => t(`Tools.sales-tax-calculator.${key}`);

  const [amount, setAmount] = useState('100');
  const [region, setRegion] = useState<'us' | 'eu' | 'custom'>('us');
  const [selectedState, setSelectedState] = useState('CA');
  const [selectedCountry, setSelectedCountry] = useState('DE');
  const [customRate, setCustomRate] = useState('10');

  const getTaxRate = () => {
    if (region === 'us') return usTaxRates[selectedState] || 0;
    if (region === 'eu') return euVatRates[selectedCountry] || 0;
    return parseFloat(customRate) || 0;
  };

  const price = parseFloat(amount) || 0;
  const taxRate = getTaxRate();
  const taxAmount = (price * taxRate) / 100;
  const totalAmount = price + taxAmount;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label>{tk('amount')}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8"
                data-testid="input-amount"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{tk('region')}</Label>
            <Select value={region} onValueChange={(v) => setRegion(v as 'us' | 'eu' | 'custom')}>
              <SelectTrigger data-testid="select-region">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">{tk('usStates')}</SelectItem>
                <SelectItem value="eu">{tk('euCountries')}</SelectItem>
                <SelectItem value="custom">{tk('customRate')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {region === 'us' && (
            <div className="space-y-2">
              <Label>{tk('state')}</Label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger data-testid="select-state">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(usTaxRates).map(([code, rate]) => (
                    <SelectItem key={code} value={code}>{code} ({rate}%)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {region === 'eu' && (
            <div className="space-y-2">
              <Label>{tk('country')}</Label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger data-testid="select-country">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(euVatRates).map(([code, rate]) => (
                    <SelectItem key={code} value={code}>{code} ({rate}%)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {region === 'custom' && (
            <div className="space-y-2">
              <Label>{tk('taxRate')}</Label>
              <div className="relative">
                <Input
                  type="number"
                  inputMode="decimal"
                  value={customRate}
                  onChange={(e) => setCustomRate(e.target.value)}
                  className="pr-8"
                  data-testid="input-rate"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{tk('subtotal')}</span>
              <span data-testid="subtotal">${price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{tk('tax')} ({taxRate}%)</span>
              <span data-testid="tax-amount">${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="font-semibold">{tk('total')}</span>
              <span className="text-2xl font-bold" data-testid="total">${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
