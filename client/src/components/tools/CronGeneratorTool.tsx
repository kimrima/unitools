import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, CalendarClock, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const presets = [
  { label: 'Every minute', cron: '* * * * *' },
  { label: 'Every hour', cron: '0 * * * *' },
  { label: 'Every day at midnight', cron: '0 0 * * *' },
  { label: 'Every day at noon', cron: '0 12 * * *' },
  { label: 'Every Monday', cron: '0 0 * * 1' },
  { label: 'Every weekday', cron: '0 0 * * 1-5' },
  { label: 'First day of month', cron: '0 0 1 * *' },
  { label: 'Every Sunday at 3am', cron: '0 3 * * 0' },
];

export default function CronGeneratorTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [minute, setMinute] = useState('*');
  const [hour, setHour] = useState('*');
  const [dayOfMonth, setDayOfMonth] = useState('*');
  const [month, setMonth] = useState('*');
  const [dayOfWeek, setDayOfWeek] = useState('*');
  const [copied, setCopied] = useState(false);

  const cronExpression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;

  const description = useMemo(() => {
    const parts: string[] = [];
    
    if (minute === '*') parts.push(t('Tools.cron-generator.everyMinute'));
    else if (minute === '0') parts.push(t('Tools.cron-generator.atMinute0'));
    else parts.push(t('Tools.cron-generator.atMinuteX', { x: minute }));

    if (hour === '*') parts.push(t('Tools.cron-generator.everyHour'));
    else parts.push(t('Tools.cron-generator.atHourX', { x: hour }));

    if (dayOfMonth === '*' && dayOfWeek === '*') {
      parts.push(t('Tools.cron-generator.everyDay'));
    } else if (dayOfMonth !== '*') {
      parts.push(t('Tools.cron-generator.onDayX', { x: dayOfMonth }));
    }

    if (month !== '*') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      parts.push(t('Tools.cron-generator.inMonthX', { x: months[parseInt(month) - 1] || month }));
    }

    if (dayOfWeek !== '*') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      parts.push(t('Tools.cron-generator.onDayOfWeekX', { x: days[parseInt(dayOfWeek)] || dayOfWeek }));
    }

    return parts.join(', ');
  }, [minute, hour, dayOfMonth, month, dayOfWeek, t]);

  const applyPreset = (cron: string) => {
    const [m, h, dom, mon, dow] = cron.split(' ');
    setMinute(m);
    setHour(h);
    setDayOfMonth(dom);
    setMonth(mon);
    setDayOfWeek(dow);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cronExpression);
    setCopied(true);
    toast({ title: t('Tools.cron-generator.copied') });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-primary" />
            <code className="font-mono text-lg font-bold">{cronExpression}</code>
          </div>
          <Button size="sm" variant="outline" onClick={copyToClipboard} data-testid="button-copy">
            {copied ? <Check className="w-4 h-4 mr-1 text-green-500" /> : <Copy className="w-4 h-4 mr-1" />}
            {t('Common.actions.copy')}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      </Card>

      <div className="space-y-2">
        <Label>{t('Tools.cron-generator.presetsLabel')}</Label>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.cron}
              variant="outline"
              size="sm"
              onClick={() => applyPreset(preset.cron)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="space-y-2">
          <Label className="text-xs">{t('Tools.cron-generator.minute')}</Label>
          <Input
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            className="font-mono text-center"
            placeholder="*"
            data-testid="input-minute"
          />
          <span className="text-xs text-muted-foreground">0-59</span>
        </div>
        <div className="space-y-2">
          <Label className="text-xs">{t('Tools.cron-generator.hour')}</Label>
          <Input
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            className="font-mono text-center"
            placeholder="*"
            data-testid="input-hour"
          />
          <span className="text-xs text-muted-foreground">0-23</span>
        </div>
        <div className="space-y-2">
          <Label className="text-xs">{t('Tools.cron-generator.dayOfMonth')}</Label>
          <Input
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value)}
            className="font-mono text-center"
            placeholder="*"
            data-testid="input-day"
          />
          <span className="text-xs text-muted-foreground">1-31</span>
        </div>
        <div className="space-y-2">
          <Label className="text-xs">{t('Tools.cron-generator.month')}</Label>
          <Input
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="font-mono text-center"
            placeholder="*"
            data-testid="input-month"
          />
          <span className="text-xs text-muted-foreground">1-12</span>
        </div>
        <div className="space-y-2">
          <Label className="text-xs">{t('Tools.cron-generator.dayOfWeek')}</Label>
          <Input
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value)}
            className="font-mono text-center"
            placeholder="*"
            data-testid="input-dow"
          />
          <span className="text-xs text-muted-foreground">0-6</span>
        </div>
      </div>

      <Card className="p-4 bg-muted/50">
        <div className="text-sm space-y-1">
          <p className="font-medium">{t('Tools.cron-generator.syntaxHelp')}</p>
          <ul className="text-muted-foreground text-xs space-y-1">
            <li><code>*</code> - {t('Tools.cron-generator.helpAny')}</li>
            <li><code>*/5</code> - {t('Tools.cron-generator.helpEvery')}</li>
            <li><code>1,15</code> - {t('Tools.cron-generator.helpList')}</li>
            <li><code>1-5</code> - {t('Tools.cron-generator.helpRange')}</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
