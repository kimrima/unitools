import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Lock, Unlock, Shield, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CryptoJS from 'crypto-js';

export default function AesEncryptionTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleEncrypt = () => {
    if (!input || !password) return;
    setError('');
    try {
      const encrypted = CryptoJS.AES.encrypt(input, password).toString();
      setOutput(encrypted);
    } catch {
      setError(t('Tools.aes-encryption.encryptError'));
    }
  };

  const handleDecrypt = () => {
    if (!input || !password) return;
    setError('');
    try {
      const bytes = CryptoJS.AES.decrypt(input, password);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      if (!decrypted) {
        setError(t('Tools.aes-encryption.decryptError'));
        setOutput('');
        return;
      }
      setOutput(decrypted);
    } catch {
      setError(t('Tools.aes-encryption.decryptError'));
      setOutput('');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast({ title: t('Common.actions.copy') + '!' });
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-green-500/10 border-green-500/20">
        <div className="flex gap-2 text-sm text-green-600 dark:text-green-400">
          <Shield className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{t('Tools.aes-encryption.notice')}</p>
        </div>
      </Card>

      <Tabs value={mode} onValueChange={(v) => { setMode(v as 'encrypt' | 'decrypt'); setOutput(''); setError(''); }}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="encrypt" className="gap-2" data-testid="tab-encrypt">
            <Lock className="w-4 h-4" />
            {t('Tools.aes-encryption.encrypt')}
          </TabsTrigger>
          <TabsTrigger value="decrypt" className="gap-2" data-testid="tab-decrypt">
            <Unlock className="w-4 h-4" />
            {t('Tools.aes-encryption.decrypt')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="encrypt" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>{t('Tools.aes-encryption.textLabel')}</Label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('Tools.aes-encryption.textPlaceholder')}
              className="min-h-24 font-mono"
              data-testid="input-encrypt-text"
            />
          </div>
        </TabsContent>

        <TabsContent value="decrypt" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>{t('Tools.aes-encryption.cipherLabel')}</Label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('Tools.aes-encryption.cipherPlaceholder')}
              className="min-h-24 font-mono"
              data-testid="input-decrypt-text"
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="space-y-2">
        <Label>{t('Tools.aes-encryption.passwordLabel')}</Label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('Tools.aes-encryption.passwordPlaceholder')}
            className="pr-10 font-mono"
            data-testid="input-password"
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-0 top-0"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <Button
        onClick={mode === 'encrypt' ? handleEncrypt : handleDecrypt}
        disabled={!input || !password}
        className="w-full"
        data-testid="button-process"
      >
        {mode === 'encrypt' ? (
          <>
            <Lock className="w-4 h-4 mr-2" />
            {t('Tools.aes-encryption.encrypt')}
          </>
        ) : (
          <>
            <Unlock className="w-4 h-4 mr-2" />
            {t('Tools.aes-encryption.decrypt')}
          </>
        )}
      </Button>

      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}

      {output && (
        <div className="space-y-2">
          <Label>{t('Tools.aes-encryption.resultLabel')}</Label>
          <div className="relative">
            <Textarea
              value={output}
              readOnly
              className="min-h-24 font-mono pr-12"
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 top-2"
              onClick={copyToClipboard}
              data-testid="button-copy-result"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
