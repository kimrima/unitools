import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Check, RefreshCw, Fingerprint, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function generateUUIDv4(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  array[6] = (array[6] & 0x0f) | 0x40;
  array[8] = (array[8] & 0x3f) | 0x80;
  const hex = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function generateNanoId(size: number = 21): string {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const array = new Uint8Array(size);
  crypto.getRandomValues(array);
  return Array.from(array, b => alphabet[b % alphabet.length]).join('');
}

export default function UuidGeneratorTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [type, setType] = useState<'uuid' | 'guid' | 'nanoid'>('uuid');
  const [count, setCount] = useState(1);
  const [uuids, setUuids] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generate = () => {
    const generated: string[] = [];
    for (let i = 0; i < count; i++) {
      if (type === 'uuid' || type === 'guid') {
        const uuid = generateUUIDv4();
        generated.push(type === 'guid' ? uuid.toUpperCase() : uuid);
      } else {
        generated.push(generateNanoId());
      }
    }
    setUuids(generated);
  };

  const copyToClipboard = (uuid: string, index: number) => {
    navigator.clipboard.writeText(uuid);
    setCopiedIndex(index);
    toast({ title: t('Tools.uuid-generator.copied') });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
    toast({ title: t('Tools.uuid-generator.allCopied') });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('Tools.uuid-generator.typeLabel')}</Label>
          <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
            <SelectTrigger data-testid="select-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uuid">UUID v4 (lowercase)</SelectItem>
              <SelectItem value="guid">GUID (UPPERCASE)</SelectItem>
              <SelectItem value="nanoid">NanoID</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t('Tools.uuid-generator.countLabel')}</Label>
          <Select value={count.toString()} onValueChange={(v) => setCount(parseInt(v))}>
            <SelectTrigger data-testid="select-count">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 5, 10, 20, 50].map((n) => (
                <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={generate} className="w-full" data-testid="button-generate">
        <Fingerprint className="w-4 h-4 mr-2" />
        {t('Tools.uuid-generator.generate')}
      </Button>

      {uuids.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>{t('Tools.uuid-generator.resultLabel')}</Label>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copyAll} data-testid="button-copy-all">
                <Copy className="w-3 h-3 mr-1" />
                {t('Tools.uuid-generator.copyAll')}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setUuids([])} data-testid="button-clear">
                <Trash2 className="w-3 h-3 mr-1" />
                {t('Common.actions.clear')}
              </Button>
            </div>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {uuids.map((uuid, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2 bg-muted/50 rounded-md group"
              >
                <code className="flex-1 font-mono text-sm break-all">{uuid}</code>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => copyToClipboard(uuid, i)}
                  className="shrink-0"
                  data-testid={`button-copy-${i}`}
                >
                  {copiedIndex === i ? (
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

      {uuids.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {t('Tools.uuid-generator.empty')}
        </div>
      )}
    </div>
  );
}
