import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Copy, Check, Shield, Hash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CryptoJS from 'crypto-js';

export default function HashGeneratorTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const hashes = input ? {
    'MD5': CryptoJS.MD5(input).toString(),
    'SHA-1': CryptoJS.SHA1(input).toString(),
    'SHA-256': CryptoJS.SHA256(input).toString(),
    'SHA-384': CryptoJS.SHA384(input).toString(),
    'SHA-512': CryptoJS.SHA512(input).toString(),
    'SHA3-256': CryptoJS.SHA3(input, { outputLength: 256 }).toString(),
    'RIPEMD-160': CryptoJS.RIPEMD160(input).toString(),
  } : null;

  const copyToClipboard = (hash: string, name: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(name);
    toast({ title: t('Tools.sha256-hash.copied', { algorithm: name }) });
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-blue-500/10 border-blue-500/20">
        <div className="flex gap-2 text-sm text-blue-600 dark:text-blue-400">
          <Shield className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{t('Tools.sha256-hash.notice')}</p>
        </div>
      </Card>

      <div className="space-y-2">
        <Label>{t('Tools.sha256-hash.inputLabel')}</Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('Tools.sha256-hash.placeholder')}
          className="min-h-32 font-mono"
          data-testid="input-hash-text"
        />
      </div>

      {hashes && (
        <div className="space-y-3">
          <Label>{t('Tools.sha256-hash.resultLabel')}</Label>
          <div className="space-y-2">
            {Object.entries(hashes).map(([name, hash]) => (
              <div
                key={name}
                className="flex items-center gap-2 p-3 bg-muted/50 rounded-md"
              >
                <Hash className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="font-medium text-sm w-24 shrink-0">{name}</span>
                <code className="flex-1 text-xs font-mono break-all text-muted-foreground">
                  {hash}
                </code>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => copyToClipboard(hash, name)}
                  data-testid={`button-copy-${name.toLowerCase()}`}
                >
                  {copiedHash === name ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!input && (
        <div className="text-center py-8 text-muted-foreground">
          {t('Tools.sha256-hash.empty')}
        </div>
      )}
    </div>
  );
}
