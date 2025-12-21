import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Network, ArrowRightLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function ipv4ToIpv6(ipv4: string): string | null {
  const parts = ipv4.split('.');
  if (parts.length !== 4) return null;
  
  const nums = parts.map(p => parseInt(p));
  if (nums.some(n => isNaN(n) || n < 0 || n > 255)) return null;
  
  const hex1 = ((nums[0] << 8) + nums[1]).toString(16).padStart(4, '0');
  const hex2 = ((nums[2] << 8) + nums[3]).toString(16).padStart(4, '0');
  
  return `::ffff:${hex1}:${hex2}`;
}

function ipv4ToIpv6Full(ipv4: string): string | null {
  const parts = ipv4.split('.');
  if (parts.length !== 4) return null;
  
  const nums = parts.map(p => parseInt(p));
  if (nums.some(n => isNaN(n) || n < 0 || n > 255)) return null;
  
  const hex1 = ((nums[0] << 8) + nums[1]).toString(16).padStart(4, '0');
  const hex2 = ((nums[2] << 8) + nums[3]).toString(16).padStart(4, '0');
  
  return `0000:0000:0000:0000:0000:ffff:${hex1}:${hex2}`;
}

function ipv6ToIpv4(ipv6: string): string | null {
  const match = ipv6.match(/::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i);
  if (!match) {
    const dotMatch = ipv6.match(/::ffff:(\d+)\.(\d+)\.(\d+)\.(\d+)$/i);
    if (dotMatch) {
      return `${dotMatch[1]}.${dotMatch[2]}.${dotMatch[3]}.${dotMatch[4]}`;
    }
    return null;
  }
  
  const hex1 = parseInt(match[1], 16);
  const hex2 = parseInt(match[2], 16);
  
  return `${(hex1 >> 8) & 0xff}.${hex1 & 0xff}.${(hex2 >> 8) & 0xff}.${hex2 & 0xff}`;
}

export default function Ipv4ToIpv6Tool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [mode, setMode] = useState<'v4tov6' | 'v6tov4'>('v4tov6');
  const [ipv4Input, setIpv4Input] = useState('');
  const [ipv6Input, setIpv6Input] = useState('');
  const [result, setResult] = useState<{ short?: string; full?: string; ipv4?: string } | null>(null);
  const [error, setError] = useState('');

  const handleConvert = () => {
    setError('');
    setResult(null);

    if (mode === 'v4tov6') {
      const short = ipv4ToIpv6(ipv4Input);
      const full = ipv4ToIpv6Full(ipv4Input);
      if (short && full) {
        setResult({ short, full });
      } else {
        setError(t('Tools.ipv4-to-ipv6.invalidIpv4'));
      }
    } else {
      const ipv4 = ipv6ToIpv4(ipv6Input);
      if (ipv4) {
        setResult({ ipv4 });
      } else {
        setError(t('Tools.ipv4-to-ipv6.invalidIpv6'));
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: t('Common.actions.copy') + '!' });
  };

  return (
    <div className="space-y-6">
      <Tabs value={mode} onValueChange={(v) => { setMode(v as typeof mode); setResult(null); setError(''); }}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="v4tov6" data-testid="tab-v4tov6">
            IPv4 → IPv6
          </TabsTrigger>
          <TabsTrigger value="v6tov4" data-testid="tab-v6tov4">
            IPv6 → IPv4
          </TabsTrigger>
        </TabsList>

        <TabsContent value="v4tov6" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Network className="w-4 h-4" />
              {t('Tools.ipv4-to-ipv6.ipv4Label')}
            </Label>
            <Input
              value={ipv4Input}
              onChange={(e) => setIpv4Input(e.target.value)}
              placeholder="192.168.1.1"
              className="font-mono"
              data-testid="input-ipv4"
            />
          </div>
        </TabsContent>

        <TabsContent value="v6tov4" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Network className="w-4 h-4" />
              {t('Tools.ipv4-to-ipv6.ipv6Label')}
            </Label>
            <Input
              value={ipv6Input}
              onChange={(e) => setIpv6Input(e.target.value)}
              placeholder="::ffff:c0a8:0101"
              className="font-mono"
              data-testid="input-ipv6"
            />
          </div>
        </TabsContent>
      </Tabs>

      <Button 
        onClick={handleConvert} 
        disabled={mode === 'v4tov6' ? !ipv4Input : !ipv6Input}
        className="w-full"
        data-testid="button-convert"
      >
        <ArrowRightLeft className="w-4 h-4 mr-2" />
        {t('Tools.ipv4-to-ipv6.convert')}
      </Button>

      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}

      {result && (
        <Card className="p-4 space-y-3">
          <Label>{t('Tools.ipv4-to-ipv6.resultLabel')}</Label>
          
          {result.short && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
              <div>
                <span className="text-xs text-muted-foreground">{t('Tools.ipv4-to-ipv6.shortForm')}</span>
                <code className="block font-mono">{result.short}</code>
              </div>
              <Button size="icon" variant="ghost" onClick={() => copyToClipboard(result.short!)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          )}

          {result.full && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
              <div>
                <span className="text-xs text-muted-foreground">{t('Tools.ipv4-to-ipv6.fullForm')}</span>
                <code className="block font-mono text-sm">{result.full}</code>
              </div>
              <Button size="icon" variant="ghost" onClick={() => copyToClipboard(result.full!)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          )}

          {result.ipv4 && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
              <div>
                <span className="text-xs text-muted-foreground">IPv4</span>
                <code className="block font-mono">{result.ipv4}</code>
              </div>
              <Button size="icon" variant="ghost" onClick={() => copyToClipboard(result.ipv4!)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
