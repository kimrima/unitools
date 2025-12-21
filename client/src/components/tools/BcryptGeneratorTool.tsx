import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Copy, Fingerprint, Shield, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CryptoJS from 'crypto-js';

function generateBcryptLikeHash(password: string, rounds: number): string {
  const salt = CryptoJS.lib.WordArray.random(16).toString();
  let hash = password + salt;
  
  for (let i = 0; i < Math.pow(2, rounds); i++) {
    hash = CryptoJS.SHA256(hash).toString();
  }
  
  const version = '$2a$';
  const roundsStr = rounds.toString().padStart(2, '0');
  const combined = salt.substring(0, 22) + hash.substring(0, 31);
  
  return `${version}${roundsStr}$${combined}`;
}

export default function BcryptGeneratorTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [rounds, setRounds] = useState(10);
  const [hash, setHash] = useState('');

  const handleGenerate = () => {
    if (!password) return;
    const result = generateBcryptLikeHash(password, rounds);
    setHash(result);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(hash);
    toast({ title: t('Tools.bcrypt-generator.copied') });
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-green-500/10 border-green-500/20">
        <div className="flex gap-2 text-sm text-green-600 dark:text-green-400">
          <Shield className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{t('Tools.bcrypt-generator.notice')}</p>
        </div>
      </Card>

      <Card className="p-4 bg-yellow-500/10 border-yellow-500/20">
        <div className="flex gap-2 text-sm text-yellow-600 dark:text-yellow-400">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{t('Tools.bcrypt-generator.simulationNotice')}</p>
        </div>
      </Card>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Fingerprint className="w-4 h-4" />
          {t('Tools.bcrypt-generator.passwordLabel')}
        </Label>
        <Input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('Tools.bcrypt-generator.passwordPlaceholder')}
          className="font-mono"
          data-testid="input-password"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>{t('Tools.bcrypt-generator.roundsLabel')}</Label>
          <span className="text-sm font-mono text-muted-foreground">{rounds}</span>
        </div>
        <Slider
          value={[rounds]}
          onValueChange={(v) => setRounds(v[0])}
          min={4}
          max={14}
          step={1}
          data-testid="slider-rounds"
        />
        <p className="text-xs text-muted-foreground">
          {t('Tools.bcrypt-generator.roundsHint')}
        </p>
      </div>

      <Button onClick={handleGenerate} disabled={!password} className="w-full" data-testid="button-generate">
        <Fingerprint className="w-4 h-4 mr-2" />
        {t('Tools.bcrypt-generator.generate')}
      </Button>

      {hash && (
        <div className="space-y-2">
          <Label>{t('Tools.bcrypt-generator.resultLabel')}</Label>
          <div className="relative">
            <Textarea
              value={hash}
              readOnly
              className="font-mono text-sm pr-12"
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 top-2"
              onClick={copyToClipboard}
              data-testid="button-copy"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
