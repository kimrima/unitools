import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Copy, RefreshCw, Check, Shield, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PasswordGeneratorTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const generatePassword = useCallback(() => {
    let chars = '';
    if (includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) chars += '0123456789';
    if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (!chars) {
      setPassword('');
      return;
    }

    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
    setPassword(result);
    setCopied(false);
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    toast({ title: t('Tools.password-generator.copied') });
    setTimeout(() => setCopied(false), 2000);
  };

  const getStrength = () => {
    if (!password) return { level: 0, label: '' };
    let score = 0;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) return { level: 1, label: t('Tools.password-generator.weak'), color: 'bg-red-500' };
    if (score <= 4) return { level: 2, label: t('Tools.password-generator.medium'), color: 'bg-yellow-500' };
    return { level: 3, label: t('Tools.password-generator.strong'), color: 'bg-green-500' };
  };

  const strength = getStrength();

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-green-500/10 border-green-500/20">
        <div className="flex gap-2 text-sm text-green-600 dark:text-green-400">
          <Shield className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{t('Tools.password-generator.notice')}</p>
        </div>
      </Card>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{t('Tools.password-generator.lengthLabel')}</Label>
            <span className="text-sm font-mono text-muted-foreground">{length}</span>
          </div>
          <Slider
            value={[length]}
            onValueChange={(v) => setLength(v[0])}
            min={4}
            max={64}
            step={1}
            data-testid="slider-length"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="uppercase" className="text-sm">{t('Tools.password-generator.uppercase')}</Label>
            <Switch
              id="uppercase"
              checked={includeUppercase}
              onCheckedChange={setIncludeUppercase}
              data-testid="switch-uppercase"
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="lowercase" className="text-sm">{t('Tools.password-generator.lowercase')}</Label>
            <Switch
              id="lowercase"
              checked={includeLowercase}
              onCheckedChange={setIncludeLowercase}
              data-testid="switch-lowercase"
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="numbers" className="text-sm">{t('Tools.password-generator.numbers')}</Label>
            <Switch
              id="numbers"
              checked={includeNumbers}
              onCheckedChange={setIncludeNumbers}
              data-testid="switch-numbers"
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="symbols" className="text-sm">{t('Tools.password-generator.symbols')}</Label>
            <Switch
              id="symbols"
              checked={includeSymbols}
              onCheckedChange={setIncludeSymbols}
              data-testid="switch-symbols"
            />
          </div>
        </div>

        <Button onClick={generatePassword} className="w-full" data-testid="button-generate">
          <Key className="w-4 h-4 mr-2" />
          {t('Tools.password-generator.generate')}
        </Button>
      </div>

      {password && (
        <div className="space-y-3">
          <Label>{t('Tools.password-generator.resultLabel')}</Label>
          <div className="relative">
            <Input
              value={password}
              readOnly
              className="font-mono text-lg pr-20"
              data-testid="output-password"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
              <Button size="icon" variant="ghost" onClick={generatePassword}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={copyToClipboard} data-testid="button-copy">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('Tools.password-generator.strength')}</span>
              <span className={`font-medium ${strength.level === 1 ? 'text-red-500' : strength.level === 2 ? 'text-yellow-500' : 'text-green-500'}`}>
                {strength.label}
              </span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${i <= strength.level ? strength.color : 'bg-muted'}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
