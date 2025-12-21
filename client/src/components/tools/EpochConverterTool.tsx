import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Timer, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function EpochConverterTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [mode, setMode] = useState<'toDate' | 'toEpoch'>('toDate');
  const [epochInput, setEpochInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [timeInput, setTimeInput] = useState('');
  const [currentEpoch, setCurrentEpoch] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const epochToDate = (epoch: string) => {
    const num = parseInt(epoch);
    if (isNaN(num)) return null;
    const ms = epoch.length > 10 ? num : num * 1000;
    return new Date(ms);
  };

  const dateToEpoch = () => {
    if (!dateInput) return null;
    const date = new Date(`${dateInput}T${timeInput || '00:00'}`);
    if (isNaN(date.getTime())) return null;
    return Math.floor(date.getTime() / 1000);
  };

  const result = mode === 'toDate' ? epochToDate(epochInput) : dateToEpoch();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: t('Common.actions.copy') + '!' });
  };

  const setNow = () => {
    const now = new Date();
    setDateInput(now.toISOString().split('T')[0]);
    setTimeInput(now.toTimeString().slice(0, 5));
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">{t('Tools.epoch-converter.currentEpoch')}</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="font-mono text-lg font-bold">{currentEpoch}</code>
            <Button size="icon" variant="ghost" onClick={() => copyToClipboard(currentEpoch.toString())}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="toDate" data-testid="tab-to-date">
            {t('Tools.epoch-converter.epochToDate')}
          </TabsTrigger>
          <TabsTrigger value="toEpoch" data-testid="tab-to-epoch">
            {t('Tools.epoch-converter.dateToEpoch')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="toDate" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>{t('Tools.epoch-converter.epochLabel')}</Label>
            <Input
              type="number"
              value={epochInput}
              onChange={(e) => setEpochInput(e.target.value)}
              placeholder={t('Tools.epoch-converter.epochPlaceholder')}
              className="font-mono"
              data-testid="input-epoch"
            />
            <p className="text-xs text-muted-foreground">
              {t('Tools.epoch-converter.epochHint')}
            </p>
          </div>

          {result instanceof Date && !isNaN(result.getTime()) && (
            <Card className="p-4 space-y-3">
              <Label>{t('Tools.epoch-converter.resultLabel')}</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                  <span className="text-sm text-muted-foreground">Local</span>
                  <code className="font-mono text-sm">{result.toLocaleString()}</code>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                  <span className="text-sm text-muted-foreground">UTC</span>
                  <code className="font-mono text-sm">{result.toUTCString()}</code>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                  <span className="text-sm text-muted-foreground">ISO 8601</span>
                  <code className="font-mono text-sm">{result.toISOString()}</code>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="toEpoch" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('Tools.epoch-converter.dateLabel')}</Label>
              <Input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                data-testid="input-date"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('Tools.epoch-converter.timeLabel')}</Label>
              <Input
                type="time"
                value={timeInput}
                onChange={(e) => setTimeInput(e.target.value)}
                data-testid="input-time"
              />
            </div>
          </div>

          <Button variant="outline" onClick={setNow} className="w-full" data-testid="button-now">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('Tools.epoch-converter.now')}
          </Button>

          {typeof result === 'number' && (
            <Card className="p-4 space-y-3">
              <Label>{t('Tools.epoch-converter.resultLabel')}</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                  <span className="text-sm text-muted-foreground">{t('Tools.epoch-converter.seconds')}</span>
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-sm">{result}</code>
                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(result.toString())}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                  <span className="text-sm text-muted-foreground">{t('Tools.epoch-converter.milliseconds')}</span>
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-sm">{result * 1000}</code>
                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard((result * 1000).toString())}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
