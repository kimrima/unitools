import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Copy, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TIMEZONES = [
  { id: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: 0 },
  { id: 'Asia/Seoul', label: 'Seoul (KST)', offset: 9 },
  { id: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 9 },
  { id: 'Asia/Shanghai', label: 'Shanghai (CST)', offset: 8 },
  { id: 'Asia/Singapore', label: 'Singapore (SGT)', offset: 8 },
  { id: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)', offset: 8 },
  { id: 'America/New_York', label: 'New York (EST/EDT)', offset: -5 },
  { id: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)', offset: -8 },
  { id: 'America/Chicago', label: 'Chicago (CST/CDT)', offset: -6 },
  { id: 'Europe/London', label: 'London (GMT/BST)', offset: 0 },
  { id: 'Europe/Paris', label: 'Paris (CET/CEST)', offset: 1 },
  { id: 'Europe/Berlin', label: 'Berlin (CET/CEST)', offset: 1 },
  { id: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)', offset: 11 },
  { id: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)', offset: 13 },
  { id: 'Asia/Dubai', label: 'Dubai (GST)', offset: 4 },
  { id: 'Asia/Mumbai', label: 'Mumbai (IST)', offset: 5.5 },
];

export default function TimezoneConverterTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const now = new Date();
  const [date, setDate] = useState(now.toISOString().split('T')[0]);
  const [time, setTime] = useState(now.toTimeString().slice(0, 5));
  const [fromZone, setFromZone] = useState('Asia/Seoul');

  const conversions = useMemo(() => {
    try {
      const inputDate = new Date(`${date}T${time}:00`);
      const fromOffset = TIMEZONES.find(tz => tz.id === fromZone)?.offset || 0;
      const utcTime = inputDate.getTime() - (fromOffset * 60 * 60 * 1000);
      
      return TIMEZONES.map(tz => {
        const localTime = new Date(utcTime + (tz.offset * 60 * 60 * 1000));
        return {
          ...tz,
          time: localTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          }),
          date: localTime.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          }),
          isCurrent: tz.id === fromZone,
        };
      });
    } catch {
      return [];
    }
  }, [date, time, fromZone]);

  const handleCopy = async (tz: typeof conversions[0]) => {
    const text = `${tz.label}: ${tz.date} ${tz.time}`;
    await navigator.clipboard.writeText(text);
    toast({
      title: t('Common.messages.complete'),
      description: t('Common.actions.copy'),
    });
  };

  const setCurrentTime = () => {
    const now = new Date();
    setDate(now.toISOString().split('T')[0]);
    setTime(now.toTimeString().slice(0, 5));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>{t('Tools.timezone-converter.dateLabel')}</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  data-testid="input-date"
                />
              </div>
              
              <div className="space-y-2">
                <Label>{t('Tools.timezone-converter.timeLabel')}</Label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  data-testid="input-time"
                />
              </div>
              
              <div className="space-y-2">
                <Label>{t('Tools.timezone-converter.fromLabel')}</Label>
                <Select value={fromZone} onValueChange={setFromZone}>
                  <SelectTrigger data-testid="select-from">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.id} value={tz.id}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button onClick={setCurrentTime} variant="outline" className="w-full" data-testid="button-now">
                  <Clock className="h-4 w-4 mr-2" />
                  {t('Tools.timezone-converter.now')}
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {conversions.map((tz) => (
                <div
                  key={tz.id}
                  className={`flex items-center justify-between gap-2 p-3 rounded-lg ${
                    tz.isCurrent ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground truncate">{tz.label}</p>
                    <p className="font-medium">{tz.time}</p>
                    <p className="text-xs text-muted-foreground">{tz.date}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(tz)}
                    data-testid={`button-copy-${tz.id}`}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
