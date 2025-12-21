import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function DiscountCalculatorTool() {
  const { t } = useTranslation();
  const tk = (key: string) => t(`Tools.discount-calculator.${key}`);

  const [originalPrice, setOriginalPrice] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');

  const original = parseFloat(originalPrice) || 0;
  const discount = parseFloat(discountPercent) || 0;
  const discountAmount = (original * discount) / 100;
  const finalPrice = original - discountAmount;

  const presetDiscounts = [10, 15, 20, 25, 30, 40, 50];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <Label>{tk('originalPrice')}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                type="number"
                inputMode="decimal"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="pl-8"
                placeholder="100.00"
                data-testid="input-original"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>{tk('discountPercent')}</Label>
            <div className="flex gap-2 flex-wrap">
              {presetDiscounts.map((d) => (
                <Button
                  key={d}
                  variant={discountPercent === String(d) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDiscountPercent(String(d))}
                  data-testid={`btn-discount-${d}`}
                >
                  {d}%
                </Button>
              ))}
            </div>
            <div className="relative">
              <Input
                type="number"
                inputMode="decimal"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                placeholder="20"
                className="pr-8"
                data-testid="input-discount"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {original > 0 && discount > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{tk('originalPrice')}</span>
                <span className="text-lg line-through text-muted-foreground" data-testid="original-display">
                  ${original.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{tk('youSave')}</span>
                <span className="text-lg text-green-600 dark:text-green-400" data-testid="savings">
                  -${discountAmount.toFixed(2)} ({discount}%)
                </span>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{tk('finalPrice')}</span>
                  <span className="text-3xl font-bold" data-testid="final-price">
                    ${finalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
